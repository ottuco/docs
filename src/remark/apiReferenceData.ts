// Gives each <ApiReference api="<slug>" /> in a doc the OpenAPI operation it
// shows, from the generated page docs/developers/apis/<slug>.api.mdx: the doc
// imports that page through apiOperationLoader.cjs (only its `api` and `title`
// front matter) and passes it to the component as `source`.
//
// So any endpoint the generator writes can be shown without code changes; a
// page carries only the operations it shows, each once; and the bundler knows
// the doc depends on the generated page, so a regenerated page rebuilds it.
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
const LOADER = path.join(__dirname, "apiOperationLoader.cjs");

function walk(node: Node, visit: (node: Node) => void): void {
  visit(node);
  node.children?.forEach((child) => walk(child, visit));
}

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

export default function apiReferenceData({ apisDir }: { apisDir: string }) {
  return (tree: Node, file: { path?: string }) => {
    const imports = new Map<string, string>(); // slug → local name
    walk(tree, (node) => {
      const isElement =
        node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
      if (!isElement || node.name !== COMPONENT) return;
      const attributes = node.attributes ?? [];
      const api = attributes.find(
        (attribute) =>
          attribute.type === "mdxJsxAttribute" && attribute.name === "api",
      )?.value;
      if (typeof api !== "string" || !/^[a-z0-9-]+$/.test(api))
        throw new Error(
          `${file.path}: <${COMPONENT}> needs api="<slug>": a plain string naming a page in ${apisDir}.`,
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
