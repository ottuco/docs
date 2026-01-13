import type { WrapperProps } from "@docusaurus/types";
import useLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";
import { useLocation } from "@docusaurus/router";
import SchemaItem from "@theme-original/SchemaItem";
import type SchemaItemType from "@theme/SchemaItem";
import { useMemo, useRef, type ReactNode } from "react";

type Props = WrapperProps<typeof SchemaItemType>;

const slugify = (value?: string) => {
  if (!value) return undefined;
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
};

function buildFieldAnchorBaseId(schemaName: any, name?: string) {
  const schemaPart = Array.isArray(schemaName)
    ? schemaName.join("-")
    : schemaName ?? "schema";

  const fieldPart = name ?? "field";

  return slugify(`${schemaPart}-${fieldPart}`) ?? "field";
}

/**
 * Unique-id allocator (per page):
 * baseId, baseId-1, baseId-2, ...
 */
let lastPathname: string | null = null;
let idCounters = new Map<string, number>();

function resetCountersIfRouteChanged(pathname: string) {
  if (lastPathname !== pathname) {
    lastPathname = pathname;
    idCounters = new Map();
  }
}

function allocateUniqueId(baseId: string) {
  const current = idCounters.get(baseId) ?? 0;
  idCounters.set(baseId, current + 1);

  // First occurrence gets baseId (no suffix)
  if (current === 0) return baseId;

  // Subsequent occurrences get -1, -2, ...
  return `${baseId}-${current}`;
}

/**
 * Skip anchors inside the API caller (ApiExplorer / Try It Out).
 * That UI uses "openapi-explorer__..." class names. :contentReference[oaicite:1]{index=1}
 */
function isInsideApiExplorer(el: HTMLElement) {
  // Matches .openapi-explorer or any ancestor whose class contains "openapi-explorer"
  return Boolean(
    el.closest?.('[class*="openapi-explorer"]') ||
      el.closest?.(".openapi-explorer")
  );
}

export default function SchemaItemWrapper(props: Props): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the allocated ID stable for this specific SchemaItem instance
  const assignedIdRef = useRef<string | null>(null);

  const { pathname } = useLocation();

  const baseId = useMemo(
    () => buildFieldAnchorBaseId(props.schemaName, props.name),
    [props.schemaName, props.name]
  );

  useLayoutEffect(() => {
    if (
      props.collapsible ||
      !containerRef.current ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    )
      return;

    // ✅ Ignore SchemaItems rendered inside the API caller / ApiExplorer
    if (isInsideApiExplorer(containerRef.current)) return;

    // Reset counters per page route
    resetCountersIfRouteChanged(pathname);

    // Allocate a unique ID once per component instance
    if (!assignedIdRef.current) {
      assignedIdRef.current = allocateUniqueId(baseId);
    }
    const fieldAnchorId = assignedIdRef.current;

    const currentElement = containerRef.current.querySelector(
      ".openapi-schema__property"
    ) as HTMLElement | null;
    if (!currentElement) return;

    // Set element ID (target for deep link)
    currentElement.id = fieldAnchorId;

    // Ensure we only append one hash-link
    let anchor = currentElement.querySelector(
      "a.hash-link"
    ) as HTMLAnchorElement | null;

    if (!anchor) {
      anchor = document.createElement("a");
      anchor.classList.add("hash-link");
      currentElement.appendChild(anchor);
    }

    anchor.href = `#${fieldAnchorId}`;

    // If page loaded with that hash, trigger the scroll behavior
    const hash = window.location.hash.slice(1);
    if (hash === fieldAnchorId) anchor.click();
  }, [props.collapsible, baseId, pathname]);

  return (
    <div ref={containerRef}>
      <SchemaItem {...props} />
    </div>
  );
}
