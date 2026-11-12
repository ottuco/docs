// The request as copy-paste code, in the languages the docs use everywhere:
// cURL, Python, Node.js, PHP (root CLAUDE.md, "Multi-language code tabs").
// The host readers copy, as in every code sample (root CLAUDE.md).
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";

export type Language = "curl" | "python" | "node" | "php";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "curl", label: "cURL" },
  { value: "python", label: "Python" },
  { value: "node", label: "Node.js" },
  { value: "php", label: "PHP" },
];

/** A request as ApiExecute builds and sends it. */
export type SnippetRequest = {
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
  idempotent?: boolean;
};

/** The fixed headers; an idempotent call also gets a fresh key (per language). */
function headersOf({ body }: SnippetRequest): [string, string][] {
  const headers: [string, string][] = [
    ["Authorization", "Api-Key {your_api_key}"],
  ];
  if (body) headers.push(["Content-Type", "application/json"]);
  return headers;
}

const indent = (text: string, spaces: number) =>
  text.replace(/\n/g, `\n${" ".repeat(spaces)}`);

// Run points webhook_url at the docs' own relay, so the page can show the
// webhook. Code the reader copies must send their webhooks to their server.
const READER_WEBHOOK = "https://merchant.example.com/ottu/webhook";

function forCopy(body?: Record<string, unknown>) {
  return body && "webhook_url" in body
    ? { ...body, webhook_url: READER_WEBHOOK }
    : body;
}

export function snippet(language: Language, sent: SnippetRequest): string {
  const request = { ...sent, body: forCopy(sent.body) };
  const url = `${OTTU_CONNECT_BASE_URL}${request.path}`;
  const headers = headersOf(request);
  const json = request.body ? JSON.stringify(request.body, null, 2) : undefined;
  // Each run needs a new Idempotency-Key, so the code makes one: copy-paste
  // ready with only the API key to fill in.
  const keyed = request.idempotent;

  switch (language) {
    case "curl": {
      const lines = [`curl -X ${request.method} '${url}'`];
      for (const [name, value] of headers)
        lines.push(`  -H '${name}: ${value}'`);
      if (keyed) lines.push(`  -H "Idempotency-Key: $(uuidgen)"`);
      // Inside '…' a quote is written '\'' (close, escaped quote, reopen).
      if (json) lines.push(`  -d '${json.replace(/'/g, "'\\''")}'`);
      // A POST without a body still sends Content-Length: 0, as browsers do.
      else if (request.method === "POST") lines.push("  -d ''");
      return lines.join(" \\\n");
    }
    case "python": {
      const lines = [
        ...(keyed ? ["import uuid", ""] : []),
        "import requests",
        "",
        `response = requests.${request.method.toLowerCase()}(`,
        `    "${url}",`,
        "    headers={",
        ...headers.map(([name, value]) => `        "${name}": "${value}",`),
        ...(keyed ? ['        "Idempotency-Key": str(uuid.uuid4()),'] : []),
        "    },",
      ];
      if (request.body)
        lines.push(`    json=${literal(request.body, PYTHON, 1)},`);
      lines.push(")", "print(response.status_code, response.json())");
      return lines.join("\n");
    }
    case "node": {
      // Inside an async function: top-level await only works in ES modules,
      // and a plain `node index.js` is CommonJS.
      const lines = [
        // Imported: `crypto` is not a global in CommonJS on Node 18.
        ...(keyed
          ? ['const { randomUUID } = require("node:crypto");', ""]
          : []),
        "async function main() {",
        `  const response = await fetch("${url}", {`,
        `    method: "${request.method}",`,
        "    headers: {",
        ...headers.map(([name, value]) => `      "${name}": "${value}",`),
        ...(keyed ? ['      "Idempotency-Key": randomUUID(),'] : []),
        "    },",
      ];
      if (json) lines.push(`    body: JSON.stringify(${indent(json, 4)}),`);
      lines.push(
        "  });",
        "  console.log(response.status, await response.json());",
        "}",
        "",
        "main();",
      );
      return lines.join("\n");
    }
    case "php": {
      const lines = [
        "<?php",
        ...(keyed
          ? [
              "// A random UUID v4 for the Idempotency-Key header.",
              "$b = random_bytes(16);",
              "$b[6] = chr(ord($b[6]) & 0x0f | 0x40); // version 4",
              "$b[8] = chr(ord($b[8]) & 0x3f | 0x80); // RFC 4122 variant",
              "$key = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));",
              "",
            ]
          : []),
        `$ch = curl_init(${phpString(url)});`,
        "curl_setopt_array($ch, [",
        `    CURLOPT_CUSTOMREQUEST => ${phpString(request.method)},`,
        "    CURLOPT_RETURNTRANSFER => true,",
        "    CURLOPT_HTTPHEADER => [",
        ...headers.map(
          ([name, value]) => `        ${phpString(`${name}: ${value}`)},`,
        ),
        ...(keyed ? ["        'Idempotency-Key: ' . $key,"] : []),
        "    ],",
      ];
      if (json)
        lines.push(
          `    CURLOPT_POSTFIELDS => json_encode(${indent(literal(request.body, PHP), 4)}),`,
        );
      // A POST without a body still sends Content-Length: 0.
      else if (request.method === "POST")
        lines.push("    CURLOPT_POSTFIELDS => '',");
      lines.push("]);", "$response = curl_exec($ch);", "echo $response;");
      return lines.join("\n");
    }
  }
}

/** How one language writes JSON values as a literal. */
type Syntax = {
  string: (text: string) => string;
  open: string; // object
  close: string;
  pair: string; // between key and value
  emptyObject: string;
  null: string;
  true: string;
  false: string;
};

/** A PHP single-quoted string: no `$` interpolation; only `\` and `'` are escaped. */
const phpString = (text: string) =>
  `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

const PHP: Syntax = {
  string: phpString,
  open: "[",
  close: "]",
  pair: " => ",
  emptyObject: "new stdClass()",
  null: "null",
  true: "true",
  false: "false",
};

const PYTHON: Syntax = {
  string: (text) => JSON.stringify(text),
  open: "{",
  close: "}",
  pair: ": ",
  emptyObject: "{}",
  null: "None",
  true: "True",
  false: "False",
};

/** A JSON value as a literal in `syntax`, indented four spaces per level. */
function literal(value: unknown, syntax: Syntax, depth = 0): string {
  const pad = "    ".repeat(depth + 1);
  const end = "    ".repeat(depth);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map(
      (item) => `${pad}${literal(item, syntax, depth + 1)}`,
    );
    return `[\n${items.join(",\n")},\n${end}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return syntax.emptyObject;
    const items = entries.map(
      ([key, item]) =>
        `${pad}${syntax.string(key)}${syntax.pair}${literal(item, syntax, depth + 1)}`,
    );
    return `${syntax.open}\n${items.join(",\n")},\n${end}${syntax.close}`;
  }
  if (value === null || value === undefined) return syntax.null;
  if (value === true) return syntax.true;
  if (value === false) return syntax.false;
  if (typeof value === "string") return syntax.string(value);
  return JSON.stringify(value);
}
