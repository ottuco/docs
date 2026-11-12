// Puts "N min read" under each doc's title: counts the words a reader reads
// (text, inline code, the text inside components such as FAQ answers; not
// code blocks) and inserts <ReadingTime minutes={N} /> after the page's H1,
// or at the top when the title comes from the front matter.
//
// Pages in `skipDir` (the generated API pages, mostly components with little
// prose) and partials (`_name.mdx`) get none.
import path from "node:path";

type Estree = Record<string, unknown>;
type Node = {
  type: string;
  name?: string | null;
  depth?: number;
  value?: string;
  attributes?: unknown[];
  children?: Node[];
  data?: { estree: Estree };
};

/** Words a minute: a common rate for technical reading. */
const WORDS_PER_MINUTE = 200;
const IMPORT_AS = "__ReadingTime";
const REQUEST = "@site/src/components/ReadingTime";

function words(node: Node): number {
  if (node.type === "code" || node.type === "mdxjsEsm") return 0;
  if (node.type === "text" || node.type === "inlineCode")
    return (node.value ?? "").split(/\s+/).filter(Boolean).length;
  return (node.children ?? []).reduce((sum, child) => sum + words(child), 0);
}

const identifier = (name: string): Estree => ({ type: "Identifier", name });

export default function readingTime({ skipDir }: { skipDir: string }) {
  return (tree: Node, file: { path?: string }) => {
    const filePath = file.path ?? "";
    if (
      filePath.startsWith(skipDir + path.sep) ||
      path.basename(filePath).startsWith("_")
    )
      return;
    const children = tree.children ?? [];
    const minutes = Math.max(1, Math.round(words(tree) / WORDS_PER_MINUTE));
    const element: Node = {
      type: "mdxJsxFlowElement",
      name: IMPORT_AS,
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "minutes",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: String(minutes),
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: { type: "Literal", value: minutes },
                  },
                ],
              },
            },
          },
        },
      ],
      children: [],
    };
    // Docusaurus wraps the page's H1 in a <header> before this runs.
    const title = children.findIndex(
      (node) =>
        (node.type === "heading" && node.depth === 1) ||
        (node.type === "mdxJsxFlowElement" && node.name === "header"),
    );
    // After the H1; otherwise first, under the title Docusaurus renders.
    children.splice(title + 1, 0, element);
    children.unshift({
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
                {
                  type: "ImportDefaultSpecifier",
                  local: identifier(IMPORT_AS),
                },
              ],
              source: { type: "Literal", value: REQUEST },
            },
          ],
        },
      },
    });
    tree.children = children;
  };
}
