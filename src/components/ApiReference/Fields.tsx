// A Stripe-style field list: name, type, badges and description, with child
// attributes folded away until the reader opens them. Every field has its own
// anchor; opening a link to a nested field opens its parents.
import React, { useEffect, useState } from "react";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import {
  fieldId,
  forMarkdown,
  variantId,
  normalize,
  typeLabel,
  type Field,
  type Schema,
} from "./schema";
import { useHashNavigation } from "./useHash";
import styles from "./styles.module.css";

function Facts({ schema }: { schema: Schema }) {
  const facts: React.ReactNode[] = [];
  // An array's allowed values sit on its items.
  const values =
    schema.enum ??
    (schema.type === "array" ? normalize(schema.items).schema.enum : undefined);
  // Skip the list when the description already names every value in code.
  const described = values?.every((value) =>
    (schema.description ?? "").includes(`\`${String(value)}\``),
  );
  if (values && !described) {
    facts.push(
      <>
        {schema.type === "array" ? "Each one of" : "One of"}{" "}
        {values.map((value, i) => (
          <React.Fragment key={String(value)}>
            {i > 0 && ", "}
            <code>{String(value)}</code>
          </React.Fragment>
        ))}
      </>,
    );
  }
  if (schema.default !== undefined)
    facts.push(
      <>
        Default <code>{JSON.stringify(schema.default)}</code>
      </>,
    );
  if (schema.minLength !== undefined)
    facts.push(<>Min length {schema.minLength}</>);
  if (schema.maxLength !== undefined)
    facts.push(<>Max length {schema.maxLength}</>);
  if (schema.pattern !== undefined)
    facts.push(
      <>
        Pattern <code>{schema.pattern}</code>
      </>,
    );
  if (schema.minimum !== undefined) facts.push(<>Minimum {schema.minimum}</>);
  if (schema.maximum !== undefined) facts.push(<>Maximum {schema.maximum}</>);
  if (schema.example !== undefined)
    facts.push(
      <>
        Example <code>{JSON.stringify(schema.example)}</code>
      </>,
    );
  if (facts.length === 0) return null;
  return (
    <ul className={styles.facts}>
      {facts.map((fact, i) => (
        <li key={i}>{fact}</li>
      ))}
    </ul>
  );
}

/** A folded box of fields under a row (or under an error code). */
function Children({
  id,
  fields,
  label,
  anchored = false,
}: {
  id: string;
  fields: Field[];
  label: string;
  /** A shape box (`<field>--<label>`): the box itself is a link target. */
  anchored?: boolean;
}) {
  const { hash, visit } = useHashNavigation();
  // Register the shape's own anchor for Docusaurus' broken-anchor check.
  const brokenLinks = useBrokenLinks();
  if (anchored) brokenLinks.collectAnchor(id);
  // Inside this box, but not inside one of the field's shapes (`<id>--…`).
  const inside =
    (anchored && hash === id) ||
    (hash.startsWith(`${id}-`) && !hash.startsWith(`${id}--`));
  const [open, setOpen] = useState(false);
  // Open on every visit to a link that points inside, even if the reader
  // closed this box after an earlier one (or the same one).
  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside, visit]);

  return (
    <details
      id={anchored ? id : undefined}
      className={styles.children}
      open={open}
      onToggle={(event) =>
        setOpen((event.currentTarget as HTMLDetailsElement).open)
      }
    >
      <summary>
        {open ? "Hide" : "Show"} {label}
      </summary>
      <FieldList fields={fields} prefix={id} />
    </details>
  );
}

// Memoized: every Children box re-renders when the reader follows a link (to
// open on a deep link). The field lists below must not re-render with them,
// or every description is parsed as Markdown again.
const FieldRow = React.memo(function FieldRow({
  field,
  prefix,
}: {
  field: Field;
  prefix: string;
}) {
  const id = fieldId(prefix, field.name);
  const { schema } = field;
  // Register the anchor, so links to it pass Docusaurus' broken-anchor check.
  useBrokenLinks().collectAnchor(id);
  return (
    <li className={styles.field} id={id}>
      <div className={styles.fieldHead}>
        <a className={styles.fieldName} href={`#${id}`}>
          {field.name}
        </a>
        <span className={styles.fieldType}>{typeLabel(schema)}</span>
        {field.required && <span className={styles.required}>required</span>}
        {field.nullable && <span className={styles.badge}>nullable</span>}
        {schema.readOnly && <span className={styles.badge}>read-only</span>}
      </div>
      {schema.description && (
        <div className={styles.fieldText}>
          <Markdown>{forMarkdown(schema.description)}</Markdown>
        </div>
      )}
      <Facts schema={schema} />
      {field.children.length > 0 && (
        <Children
          id={id}
          fields={field.children}
          label={
            field.children.length === 1
              ? "1 child attribute"
              : `${field.children.length} child attributes`
          }
        />
      )}
      {field.variants.map((variant) => (
        <Children
          key={variant.label}
          id={variantId(id, variant.label)}
          anchored
          fields={variant.children}
          label={`attributes when ${variant.label}`}
        />
      ))}
    </li>
  );
});

const FieldList = React.memo(function FieldList({
  fields,
  prefix,
}: {
  fields: Field[];
  prefix: string;
}) {
  if (fields.length === 0) return null;
  return (
    <ul className={styles.fields}>
      {fields.map((field) => (
        <FieldRow key={field.name} field={field} prefix={prefix} />
      ))}
    </ul>
  );
});

export default FieldList;
