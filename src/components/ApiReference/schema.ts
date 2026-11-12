// Turns an endpoint's OpenAPI schemas (decoded in sources.ts from the
// generated page in docs/developers/apis/) into a readable field tree.
import { getFragmentId } from "@site/src/utils";

export type Schema = {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  required?: string[];
  properties?: Record<string, Schema>;
  additionalProperties?: Schema | boolean;
  items?: Schema;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
};

export type Param = {
  in: "path" | "query" | "header" | "cookie";
  name: string;
  required?: boolean;
  description?: string;
  schema?: Schema;
};

export type Example = { summary?: string; value: unknown };

export type Response = {
  description?: string;
  content?: Record<
    string,
    { schema?: Schema; examples?: Record<string, Example>; example?: unknown }
  >;
};

/** Which side of the call a schema describes: request fields hide readOnly, response fields hide writeOnly. */
export type Side = "request" | "response";

/** One field as the reader sees it. */
export type Field = {
  name: string;
  schema: Schema;
  required: boolean;
  nullable: boolean;
  /** Child fields (object properties, or the properties of array items). */
  children: Field[];
  /** Alternative shapes (oneOf / anyOf), each with its own children. */
  variants: Variant[];
};

/** Merges allOf and drops `null` from oneOf / anyOf, so `oneOf: [X, null]` reads as a nullable X. */
export function normalize(schema: Schema = {}): {
  schema: Schema;
  nullable: boolean;
} {
  let out: Schema = { ...schema };
  let nullable = Boolean(schema.nullable);

  if (out.allOf) {
    const normalized = out.allOf.map((part) => normalize(part));
    if (normalized.some((part) => part.nullable)) nullable = true;
    const parts = normalized.map((part) => part.schema);
    const { allOf: _allOf, ...rest } = out;
    out = parts.reduce<Schema>(
      (merged, part) => ({
        ...part,
        ...merged,
        // Schema order (outer, then each part in turn); a name already seen
        // keeps its first definition. For example, `{properties: {amount:
        // {description: "A"}}, allOf: [{properties: {amount: {description:
        // "B"}, currency: {…}}}]}` shows `amount` with "A", plus `currency`.
        properties: {
          ...merged.properties,
          ...Object.fromEntries(
            Object.entries(part.properties ?? {}).filter(
              ([name]) => !(name in (merged.properties ?? {})),
            ),
          ),
        },
        required: [...(merged.required ?? []), ...(part.required ?? [])],
      }),
      rest,
    );
    if (!Object.keys(out.properties ?? {}).length) delete out.properties;
  }

  for (const key of ["oneOf", "anyOf"] as const) {
    const options = out[key];
    if (!options) continue;
    const real = options.filter((option) => option.type !== "null");
    if (real.length < options.length) nullable = true;
    if (real.length === 1) {
      const { [key]: _drop, ...rest } = out;
      const inner = normalize(real[0]);
      out = {
        ...inner.schema,
        ...rest,
        description: rest.description ?? inner.schema.description,
      };
      nullable = nullable || inner.nullable;
    } else {
      out = { ...out, [key]: real };
    }
  }

  if (Array.isArray(out.type)) {
    if (out.type.includes("null")) nullable = true;
    const types = out.type.filter((type) => type !== "null");
    out = { ...out, type: types.length === 1 ? types[0] : types };
  }
  return { schema: out, nullable };
}

// Checked on the normalized schema: the flag can sit inside an allOf / oneOf part.
const hidden = (raw: Schema, side: Side) => {
  const { schema } = normalize(raw);
  return side === "request"
    ? Boolean(schema.readOnly)
    : Boolean(schema.writeOnly);
};

/** The fields of an object schema (or of the objects inside an array), in schema order. */
export function fieldsOf(
  raw: Schema | undefined,
  side: Side,
  depth = 0,
): Field[] {
  if (!raw || depth > 8) return [];
  const { schema } = normalize(raw);
  const target =
    schema.type === "array" && schema.items
      ? normalize(schema.items).schema
      : schema;
  const required = new Set(target.required ?? []);

  return Object.entries(target.properties ?? {})
    .filter(([, child]) => !hidden(child, side))
    .map(([name, child]) =>
      toField(name, child, required.has(name), side, depth),
    );
}

export type Variant = { label: string; children: Field[] };

/**
 * The shapes of a oneOf / anyOf, each with its own fields. A shape without a
 * title is "option N"; labels are unique, so they are safe as keys and anchors.
 */
function variantList(options: Schema[], side: Side, depth: number): Variant[] {
  const seen = new Set<string>();
  return options
    .map((option, i) => {
      // Titles can repeat (or differ only in characters an id can't hold):
      // compare them as anchors, and number a repeat by its position.
      const base = normalize(option).schema.title ?? `option ${i + 1}`;
      let label = base;
      for (let n = 2; seen.has(fieldId(label)); n += 1) label = `${base} ${n}`;
      seen.add(fieldId(label));
      return { label, children: fieldsOf(option, side, depth + 1) };
    })
    .filter((variant) => variant.children.length > 0);
}

/** A top-level schema that is one of several shapes (e.g. the Checkout API's 201 response). */
export function variantsOf(raw: Schema | undefined, side: Side): Variant[] {
  if (!raw) return [];
  const { schema } = normalize(raw);
  return variantList(schema.oneOf ?? schema.anyOf ?? [], side, 0);
}

function toField(
  name: string,
  raw: Schema,
  required: boolean,
  side: Side,
  depth: number,
): Field {
  const { schema, nullable } = normalize(raw);
  // For an array, the shapes are those of its items.
  const shaped =
    schema.type === "array" && schema.items
      ? normalize(schema.items).schema
      : schema;
  return {
    name,
    schema,
    required,
    nullable,
    // An object can have shared properties and alternative shapes: list both.
    children: fieldsOf(schema, side, depth + 1),
    variants: variantList(shaped.oneOf ?? shaped.anyOf ?? [], side, depth),
  };
}

/** "string", "integer", "array of objects", "enum"… */
export function typeLabel(schema: Schema): string {
  if (schema.enum) return "enum";
  if (schema.type === "array") {
    const item = schema.items ? normalize(schema.items).schema : undefined;
    if (!item) return "array";
    const label = typeLabel(item);
    // "array of strings", but "array of string (date-time) items", "array of enum items".
    return /^(string|integer|number|boolean|object)$/.test(label)
      ? `array of ${label}s`
      : `array of ${label} items`;
  }
  if (Array.isArray(schema.type)) return schema.type.join(" or ");
  if (schema.type)
    return schema.format && schema.format !== schema.type
      ? `${schema.type} (${schema.format})`
      : schema.type;
  if (schema.properties) return "object";
  const options = schema.oneOf ?? schema.anyOf;
  if (options) {
    // "number (double) or string": say which types are allowed.
    const labels = options.map((option) => typeLabel(normalize(option).schema));
    return [...new Set(labels)].join(" or ");
  }
  return "any";
}

/**
 * Anchor id for one oneOf shape of a field: `<field>--<label>`. The double
 * dash keeps it apart from the field's own children (`<field>-<child>`).
 */
export const variantId = (field: string, label: string) =>
  `${field}-${fieldId(`-${label}`)}`;

/**
 * Anchor id for a field: `<prefix>-<path>`, built like the schema deep links
 * (getFragmentId), then made safe for an id: variant labels can hold spaces.
 */
export const fieldId = (...parts: string[]) =>
  getFragmentId(...parts).replace(/[^A-Za-z0-9_-]/g, "_");

/** The success response: the first 2xx code. */
export function successCode(
  responses: Record<string, Response>,
): string | undefined {
  return Object.keys(responses).find((code) => code.startsWith("2"));
}

export const jsonOf = (response?: Response) =>
  response?.content?.["application/json"];

/** Named examples of a response, in order. */
export function examplesOf(
  response?: Response,
): { name: string; summary: string; value: unknown }[] {
  const json = jsonOf(response);
  if (!json) return [];
  if (json.examples) {
    return Object.entries(json.examples).map(([name, example]) => ({
      name,
      summary: example.summary ?? name,
      value: example.value,
    }));
  }
  return json.example !== undefined
    ? [{ name: "example", summary: "Example", value: json.example }]
    : [];
}

const STATUS_TEXT: Record<string, string> = {
  "200": "OK",
  "201": "Created",
  "204": "No content",
  "400": "Bad request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Not found",
  "409": "Conflict",
  "415": "Unsupported media type",
  "422": "Unprocessable",
  "423": "Locked",
  "429": "Too many requests",
  "500": "Server error",
  "503": "Unavailable",
  "504": "Timed out",
};

export const statusText = (code: string) => STATUS_TEXT[code] ?? "";

// A run of `<li>` items, with or without `<br>` between them; an item ends
// at its own `</li>`, never past the next `<li>`.
const ITEM = /<li>((?:(?!<li>)[\s\S])*?)<\/li>/g;
const LIST_ITEMS =
  /(?:<br\s*\/?>\s*)*((?:<li>(?:(?!<li>)[\s\S])*?<\/li>\s*(?:<br\s*\/?>\s*)*)+)/g;
// A description with a real list keeps its HTML as written. Bare `<li>` runs
// next to a real list are left too (none in the spec today): they would still
// be invalid HTML.
const HAS_LIST = /<(?:ul|ol)\b/i;

/**
 * Makes a description render as intended:
 * - An admonition (`:::info`) can sit straight under a line of text. The
 *   Markdown renderer only sees one when its `:::` lines are paragraphs of
 *   their own, so every `:::` line gets blank lines around it.
 * - The spec lists enum values as bare `<li>` items ("Available Values:<br>
 *   <li>…</li><br><li>…</li>"). Without a list around them they end up inside
 *   a paragraph, which is invalid HTML (a hydration error), so they become a
 *   Markdown list (which keeps their `code`).
 */
export function forMarkdown(text: string): string {
  const spaced = text.replace(/^(:::.*)$/gm, "\n$1\n");
  if (HAS_LIST.test(spaced)) return spaced;
  return spaced.replace(
    LIST_ITEMS,
    (_, items: string) =>
      `\n\n${[...items.matchAll(ITEM)]
        // One line each: a line break inside an item would end the list item.
        .map(([, item]) => `- ${item.trim().replace(/\s*\n\s*/g, " ")}`)
        .join("\n")}\n\n`,
  );
}
