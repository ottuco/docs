// Gives each <ApiReference api="<slug>" /> in a doc the OpenAPI operation it
// shows, from the generated page docs/developers/apis/<slug>.api.mdx: the doc
// imports that page through apiOperationLoader.cjs (only its `api` and `title`
// front matter) and passes it to the component as `source`.
//
// So any endpoint the generator writes can be shown without code changes; a
// page carries only the operations it shows, each once; and the bundler knows
// the doc depends on the generated page, so a regenerated page rebuilds it.
//
// It also fills <ApiShortcuts /> (the box of endpoint links at the top of an
// API Reference) with every <ApiReference> of the doc, in page order, each
// with the label of the <TabItem> it sits in: the box lists what the page
// shows, under the same names as its tabs, with nothing written twice.
import path from "node:path";

type Estree = Record<string, unknown>;
type Attribute = {
  type: string;
  name?: string;
  value?: unknown;
};
type Node = {
  type: string;
  name?: string | null;
  attributes?: Attribute[];
  children?: Node[];
  value?: string;
  data?: { estree: Estree };
};

const COMPONENT = "ApiReference";
const SHORTCUTS = "ApiShortcuts";
const LOADER = path.join(__dirname, "apiOperationLoader.cjs");

/** Visits every node with its ancestors, nearest last. */
function walk(
  node: Node,
  visit: (node: Node, ancestors: Node[]) => void,
  ancestors: Node[] = [],
): void {
  visit(node, ancestors);
  node.children?.forEach((child) => walk(child, visit, [...ancestors, node]));
}

const isElement = (node: Node, name: string) =>
  (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
  node.name === name;

/** A plain string attribute (`name="value"`), if the element has one. */
const stringAttribute = (node: Node, name: string) => {
  const value = node.attributes?.find(
    (attribute) =>
      attribute.type === "mdxJsxAttribute" && attribute.name === name,
  )?.value;
  return typeof value === "string" ? value : undefined;
};

const identifier = (name: string): Estree => ({ type: "Identifier", name });

/** `import <name> from "<request>";` as an MDX ESM node. */
function importNode(name: string, request: string): Node {
  return {
    type: "mdxjsEsm",
    value: "",
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            attributes: [],
            specifiers: [
              { type: "ImportDefaultSpecifier", local: identifier(name) },
            ],
            source: { type: "Literal", value: request },
          },
        ],
      },
    },
  };
}

/** `{name}` as a JSX attribute value. */
function expression(name: string): Attribute["value"] {
  return {
    type: "mdxJsxAttributeValueExpression",
    value: name,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [{ type: "ExpressionStatement", expression: identifier(name) }],
      },
    },
  };
}

/** One <ApiReference> for <ApiShortcuts>. */
type Shortcut = { api: string; run?: string; label?: string; source: string };

/** `[{api: "…", run: "…", label: "…", source: <name>}, …]` as estree. */
function shortcutsExpression(shortcuts: Shortcut[]): Estree {
  const property = (key: string, value: Estree) => ({
    type: "Property",
    kind: "init",
    method: false,
    shorthand: false,
    computed: false,
    key: identifier(key),
    value,
  });
  const literal = (value: string) => ({ type: "Literal", value });
  return {
    type: "ArrayExpression",
    elements: shortcuts.map(({ api, run, label, source }) => ({
      type: "ObjectExpression",
      properties: [
        property("api", literal(api)),
        ...(run ? [property("run", literal(run))] : []),
        ...(label ? [property("label", literal(label))] : []),
        property("source", identifier(source)),
      ],
    })),
  };
}

export default function apiReferenceData({ apisDir }: { apisDir: string }) {
  return (tree: Node, file: { path?: string }) => {
    const imports = new Map<string, string>(); // slug → local name
    const shortcuts: Shortcut[] = [];
    const boxes: Node[] = [];
    walk(tree, (node, ancestors) => {
      if (isElement(node, SHORTCUTS)) {
        if (node.attributes?.some((attribute) => attribute.name === "endpoints"))
          throw new Error(
            `${file.path}: <${SHORTCUTS}> sets \`endpoints\`; they come from the page's <${COMPONENT}>s, so leave it out.`,
          );
        boxes.push(node);
        return;
      }
      if (!isElement(node, COMPONENT)) return;
      const attributes = node.attributes ?? [];
      const api = stringAttribute(node, "api");
      if (api === undefined || !/^[a-z0-9-]+$/.test(api))
        throw new Error(
          `${file.path}: <${COMPONENT}> needs api="<slug>": a plain string of lowercase letters, digits and dashes, naming a page in ${apisDir}.`,
        );
      if (attributes.some((attribute) => attribute.name === "source"))
        throw new Error(
          `${file.path}: <${COMPONENT} api="${api}"> sets \`source\`; it comes from the generated page, so leave it out.`,
        );
      let name = imports.get(api);
      if (!name) {
        name = `__apiReference${imports.size}`;
        imports.set(api, name);
      }
      node.attributes = [
        ...attributes,
        { type: "mdxJsxAttribute", name: "source", value: expression(name) },
      ];
      // An object block (<ApiReference object={…}>) is not an endpoint: it
      // has its own anchor and stays out of the shortcut box.
      if (attributes.some((attribute) => attribute.name === "object")) return;
      const tab = [...ancestors]
        .reverse()
        .find((ancestor) => isElement(ancestor, "TabItem"));
      const run = stringAttribute(node, "run");
      // The section's anchor (ApiReference's `${run ?? api}-api`) and the
      // shortcut's key: two references with the same one would share an id.
      const anchor = run ?? api;
      if (shortcuts.some((shortcut) => (shortcut.run ?? shortcut.api) === anchor))
        throw new Error(
          `${file.path}: two <${COMPONENT}>s are "${anchor}"; give the second a different run="…" so each section has its own anchor.`,
        );
      shortcuts.push({
        api,
        run,
        label: tab && stringAttribute(tab, "label"),
        source: name,
      });
    });
    if (boxes.length > 0 && shortcuts.length === 0)
      throw new Error(
        `${file.path}: <${SHORTCUTS}> lists the page's <${COMPONENT}>s, and it has none.`,
      );
    boxes.forEach((box) => {
      box.attributes = [
        ...(box.attributes ?? []),
        {
          type: "mdxJsxAttribute",
          name: "endpoints",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: `[${shortcuts
              .map(
                ({ api, run, label, source }) =>
                  `{${[
                    `api: ${JSON.stringify(api)}`,
                    run && `run: ${JSON.stringify(run)}`,
                    label && `label: ${JSON.stringify(label)}`,
                    `source: ${source}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}}`,
              )
              .join(", ")}]`,
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: shortcutsExpression(shortcuts),
                  },
                ],
              },
            },
          },
        },
      ];
    });
    // `!!` runs only this loader: the page is read, not compiled as MDX. A
    // slug with no generated page fails the build as a missing module (and
    // `npm start` recovers once `npm run gen-api` writes it).
    imports.forEach((name, api) =>
      tree.children?.unshift(
        importNode(name, `!!${LOADER}!${path.join(apisDir, `${api}.api.mdx`)}`),
      ),
    );
  };
}
