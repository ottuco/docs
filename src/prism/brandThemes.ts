// The Prism themes of the site (github light, dracula dark), with every token
// colour turned into a CSS variable whose fallback is today's exact colour:
// `color: var(--ottu-code-<role>, #e3116c)`. Where no variable is set the code
// looks exactly as before; src/css/brand-code.css sets the variables (Ottu
// dark, Ottu orange, a grey for comments) for the pages that use the brand
// palette.
// The code box background is a variable too:
// `var(--ottu-code-background, <the theme's own background>)`.
//
// Roles:
//   plain   - text, punctuation, operators (and the theme's plain colour)
//   value   - strings, numbers, booleans, null, constants, symbols, regexes
//   accent  - what structures the code: JSON keys (property), keywords,
//             function and command names, builtins, variables, tags,
//             attribute names, selectors
//   comment - comments
// A theme entry whose types fall in several roles is split into one entry
// per role, so every type keeps its own colour where the variables are unset.
// Each role also gets a font-style variable (`--ottu-code-<role>-style`):
// the brand palette sets italic only for comments.
import { themes } from "prism-react-renderer";

type PrismTheme = typeof themes.github;
type ThemeEntry = PrismTheme["styles"][number];
type Role = "plain" | "value" | "accent" | "comment";

const ROLE: Record<string, Role> = {
  comment: "comment",
  prolog: "comment",
  doctype: "comment",
  cdata: "comment",
  punctuation: "plain",
  operator: "plain",
  namespace: "plain",
  string: "value",
  "attr-value": "value",
  char: "value",
  number: "value",
  boolean: "value",
  constant: "value",
  symbol: "value",
  regex: "value",
  entity: "value",
  url: "value",
  inserted: "value",
  deleted: "value",
  changed: "value",
  property: "accent",
  keyword: "accent",
  atrule: "accent",
  "attr-name": "accent",
  selector: "accent",
  function: "accent",
  "function-variable": "accent",
  builtin: "accent",
  variable: "accent",
  tag: "accent",
  "class-name": "accent",
};

const roleOf = (type: string): Role => ROLE[type] ?? "plain";

function brandEntry(entry: ThemeEntry, role: Role, types: string[]): ThemeEntry {
  const style = { ...entry.style } as Record<string, unknown>;
  if (typeof style.color === "string") style.color = `var(--ottu-code-${role}, ${style.color})`;
  if (typeof style.fontStyle === "string") {
    style.fontStyle = `var(--ottu-code-${role}-style, ${style.fontStyle})`;
  }
  return { ...entry, types, style: style as ThemeEntry["style"] };
}

function brand(theme: PrismTheme): PrismTheme {
  const styles: ThemeEntry[] = [];
  for (const entry of theme.styles) {
    const byRole = new Map<Role, string[]>();
    for (const type of entry.types) {
      const role = roleOf(type);
      byRole.set(role, [...(byRole.get(role) ?? []), type]);
    }
    for (const [role, types] of byRole) styles.push(brandEntry(entry, role, types));
  }
  return {
    ...theme,
    plain: {
      ...theme.plain,
      color: `var(--ottu-code-plain, ${theme.plain.color})`,
      backgroundColor: `var(--ottu-code-background, ${theme.plain.backgroundColor})`,
    },
    styles,
  };
}

export const lightCodeTheme = brand(themes.github);
export const darkCodeTheme = brand(themes.dracula);
