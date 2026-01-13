import type { WrapperProps } from "@docusaurus/types";
import useLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";
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

function buildFieldAnchorId(schemaName: any, name?: string) {
  const schemaPart = Array.isArray(schemaName)
    ? schemaName.join("-")
    : schemaName ?? "schema";

  const fieldPart = name ?? "field";

  return slugify(`${schemaPart}-${fieldPart}`);
}

export default function SchemaItemWrapper(props: Props): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  const fieldAnchorId = useMemo(
    () => buildFieldAnchorId(props.schemaName, props.name),
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

    const currentElement = containerRef.current.querySelector(
      ".openapi-schema__property"
    );
    if (!currentElement) return;

    const anchor = document.createElement("a");
    anchor.href = `#${fieldAnchorId}`;
    anchor.classList.add("hash-link");

    currentElement.id = fieldAnchorId;
    currentElement.appendChild(anchor);

    const hash = window.location.hash.slice(1); // Remove the # prefix
    if (hash === fieldAnchorId) anchor.click();
  }, [props.collapsible, fieldAnchorId]);

  return (
    <div ref={containerRef}>
      <SchemaItem {...props} />
    </div>
  );
}
