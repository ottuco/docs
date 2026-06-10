#!/usr/bin/env python3
"""Turn an authored light-theme SVG into a single inline-ready, theme-aware SVG.

Ottu docs diagrams render *inline* (in the page DOM, via the <Diagram> React
component) so they inherit the site's Poppins font and switch light/dark
instantly with the page — one file, no `<img>`, no drift. Because several
diagrams can share one page (one DOM, one id/CSS namespace), an inline SVG must
be **scoped** and its ids made **unique**. This script does that mechanically:

  1. Adds a root scope class  ``ottu-dgm--<slug>``.
  2. Suffixes every id (``arrow`` → ``arrow-<slug>``, ``diagram-title`` →
     ``diagram-title-<slug>`` …) and rewrites every reference to it
     (``url(#…)``, ``href``/``xlink:href``, ``aria-labelledby``).
  3. Scopes every CSS selector in <style> under the root class, then appends
     ``[data-theme='dark']`` overrides (only the properties that change) from
     the dark token map — so the one file carries both themes.

Author a normal light SVG (Poppins, classes, a single ``<marker id="arrow">``
with ``class="arrow-head"`` — see references/svg-conventions.md), then run:

    python inline-svg.py <authored-light.svg> <slug>   [> out.svg]

Output goes to stdout (or pass a third arg as the output path). Drop the result
into a ``src/diagrams/<Name>.tsx`` module and render it with <Diagram>.
"""

from __future__ import annotations

import re
import sys
import xml.dom.minidom as minidom
from pathlib import Path

# Dark-theme overrides: ONLY the declarations that differ from the light rule.
# `[data-theme='dark'] .scope .X` outranks `.scope .X`, so unspecified props
# (e.g. font) correctly fall through to the light rule. Classes whose colours
# are theme-independent (accent, danger, *-white) are intentionally absent.
DARK_OVERRIDES: dict[str, str] = {
    "node": "fill: #171A21; stroke: #1E2939;",
    "container-bg": "fill: #0F1A22;",
    "platform-label": "fill: #5CB4E1;",
    "label": "fill: #E5E7EB;",
    "sub": "fill: #A0A0A8;",
    "divider": "stroke: #1E2939;",
    "arrow": "stroke: #8A8A92;",
    "arrow-head": "fill: #8A8A92;",
    "arrow-label": "fill: #A0A0A8;",
    "arrow-label-bg": "fill: #0F1A22;",
}

# Classes intentionally identical in light & dark — filled accent/danger boxes and
# the white text on them read correctly on either background, so they need (and get)
# no dark override. Any class that is NEITHER here NOR in DARK_OVERRIDES can't be
# dark-themed by this script and will keep its light value in dark mode (a bug).
THEME_INDEPENDENT: set[str] = {"accent", "danger", "label-white", "sub-white"}

STYLE_RE = re.compile(r"(<style[^>]*>)(.*?)(</style>)", re.DOTALL)
RULE_RE = re.compile(r"^(\s*)\.([\w-]+)(\s*\{.*\})\s*$")
ID_DEF_RE = re.compile(r'\bid="([^"]+)"')
ROOT_SVG_RE = re.compile(r"<svg\b[^>]*?>", re.DOTALL)


def uniquify_ids(svg: str, slug: str) -> str:
    ids = set(ID_DEF_RE.findall(svg))
    for old in sorted(ids, key=len, reverse=True):  # longest first, avoid partial hits
        new = f"{old}-{slug}"
        svg = re.sub(rf'\bid="{re.escape(old)}"', f'id="{new}"', svg)
        svg = svg.replace(f"url(#{old})", f"url(#{new})")
        svg = re.sub(rf'((?:xlink:)?href=")#{re.escape(old)}(")', rf"\1#{new}\2", svg)

    def fix_labelledby(m: re.Match) -> str:
        toks = [f"{t}-{slug}" if t in ids else t for t in m.group(1).split()]
        return f'aria-labelledby="{" ".join(toks)}"'

    return re.sub(r'aria-labelledby="([^"]+)"', fix_labelledby, svg)


def add_scope_class(svg: str, scope: str) -> str:
    def repl(m: re.Match) -> str:
        tag = m.group(0)
        cm = re.search(r'\bclass="([^"]*)"', tag)
        if cm:
            return tag.replace(cm.group(0), f'class="{cm.group(1)} {scope}"')
        return tag[:-1] + f' class="{scope}"' + tag[-1]

    return ROOT_SVG_RE.sub(repl, svg, count=1)


def scope_and_theme_style(inner: str, scope: str) -> tuple[str, list[str]]:
    """Return (rescoped+dual-theme style inner, classes with no dark override)."""
    light_lines: list[str] = []
    classes: list[str] = []
    for line in inner.splitlines():
        m = RULE_RE.match(line)
        if not m:
            light_lines.append(line)
            continue
        indent, name, body = m.groups()
        light_lines.append(f"{indent}.{scope} .{name}{body}")
        classes.append(name)

    dark_lines = ["      /* dark theme — overrides only what changes */"]
    for name in classes:
        if name in DARK_OVERRIDES:
            dark_lines.append(
                f"      [data-theme='dark'] .{scope} .{name} {{ {DARK_OVERRIDES[name]} }}"
            )
    style = "\n".join(light_lines) + "\n\n" + "\n".join(dark_lines) + "\n    "
    unthemed = [n for n in dict.fromkeys(classes)
                if n not in DARK_OVERRIDES and n not in THEME_INDEPENDENT]
    return style, unthemed


def main(argv: list[str]) -> int:
    if not (3 <= len(argv) <= 4):
        print(__doc__)
        return 2
    src = Path(argv[1])
    slug = argv[2]
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        print(f"error: slug must be kebab-case (got {slug!r})", file=sys.stderr)
        return 1
    if not src.is_file():
        print(f"error: input not found: {src}", file=sys.stderr)
        return 1

    scope = f"ottu-dgm--{slug}"
    svg = src.read_text(encoding="utf-8")

    if re.search(r"['\"]inter['\"]", svg, re.I):
        print("⚠ input uses the Inter font — switch it to Poppins before inlining.",
              file=sys.stderr)

    svg = uniquify_ids(svg, slug)
    svg = add_scope_class(svg, scope)

    m = STYLE_RE.search(svg)
    if not m:
        print("error: no <style> block found.", file=sys.stderr)
        return 1
    new_style, unthemed = scope_and_theme_style(m.group(2), scope)
    svg = svg[:m.start()] + m.group(1) + new_style + m.group(3) + svg[m.end():]

    if unthemed:
        print(
            "⚠ no dark-theme override for class(es): "
            + ", ".join(f".{c}" for c in unthemed)
            + "\n  They keep their LIGHT value in dark mode (e.g. a white chip on a dark "
              "background). Prefer a standard class from references/design-tokens.md; if the "
              "class is genuinely needed, add it to inline-svg.py's DARK_OVERRIDES (or "
              "THEME_INDEPENDENT if it's correct in both themes).",
            file=sys.stderr,
        )

    try:
        minidom.parseString(svg)
    except Exception as e:
        print(f"⚠ output is NOT well-formed XML: {e}\n"
              f"  Most common cause: a '--' (double hyphen) inside an XML comment in the "
              f"source SVG (illegal in XML). Fix the source's comments and re-run.",
              file=sys.stderr)

    if len(argv) == 4:
        Path(argv[3]).write_text(svg, encoding="utf-8")
        print(f"✓ wrote {argv[3]}  (scope=.{scope})", file=sys.stderr)
    else:
        sys.stdout.write(svg)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
