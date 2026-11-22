// Guard for the demo credentials in src/utils/sandbox.ts (#161377).
// Run: node --test scripts/sandbox-keys.test.mjs
//
// The repo has no frontend test runner, so this reads the file as text:
// - the unused KSA dev-server key pair stays out of the public bundle;
// - the sandbox.ottu.net demo keys and the ACTIVE_CONNECT switch are exactly
//   as they were on main, compared by hash so no key is printed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/utils/sandbox.ts", import.meta.url), "utf8");

// sha256 of the `export const SANDBOX: ConnectEnv = {...};` block on main
// (f029206) before #161377. It catches a key changed by mistake. When the
// sandbox key is rotated (or the block changed) on purpose, put the new hash
// here in the same PR: the failure message prints it, never the keys.
const SANDBOX_BLOCK_SHA256 = "877bfb4b5c0b11f6144ea3940b1e7dd556475c6277758b11ad1002c751654f9a";

test("no KSA dev-server credentials in the frontend", () => {
  // assert.ok with a message, so a failure never prints the file (it holds keys)
  assert.ok(!/export const KSA\b/.test(src), "sandbox.ts still exports KSA");
  assert.ok(!/ksa\.ottu\.dev/.test(src), "sandbox.ts still names ksa.ottu.dev");
});

test("sandbox demo credentials and the active switch are unchanged", () => {
  const block = src.match(/export const SANDBOX: ConnectEnv = \{.*?\n\};\n/s);
  assert.ok(block, "SANDBOX block not found");
  // Comments are not behavior: drop whole-line `//` comments and trailing
  // `// nosemgrep ...` notes (docs-D1 adds them) before hashing.
  const code = block[0]
    .split("\n")
    .filter((l) => !/^\s*\/\//.test(l))
    .map((l) => l.replace(/\s*\/\/ nosemgrep.*$/, ""))
    .join("\n");
  const sha = createHash("sha256").update(code).digest("hex");
  assert.ok(
    sha === SANDBOX_BLOCK_SHA256,
    "SANDBOX block in src/utils/sandbox.ts changed. If that is on purpose (a rotated " +
      `sandbox key), set SANDBOX_BLOCK_SHA256 in scripts/sandbox-keys.test.mjs to ${sha}`,
  );
  assert.ok(/export const ACTIVE_CONNECT: ConnectEnv = SANDBOX;/.test(src), "ACTIVE_CONNECT is not SANDBOX");
});

// docs-D1 (A): the sandbox.ottu.net keys and the API Explorer demo password
// stay on purpose, as documented public demo values. Each is marked where it
// sits, so the next reader (and Semgrep) sees the reason.
const explorer = readFileSync(
  new URL("../src/theme/ApiExplorer/Authorization/index.tsx", import.meta.url),
  "utf8",
);

test("sandbox demo keys are marked as accepted public demo keys", () => {
  const lines = src.split("\n");
  for (const field of ["connectApiKey", "sdkApiKey"]) {
    const i = lines.findIndex((l) => new RegExp(`^\\s*${field}:\\s*"`).test(l));
    assert.ok(i > 0, `${field} line not found in src/utils/sandbox.ts; if the key was removed on purpose, update this test`);
    // The line just above the key: Semgrep reports one key per run, so each
    // key carries its own marker.
    const above = lines[i - 1];
    assert.ok(/^\s*\/\/ nosemgrep: detected-generic-api-key/.test(above), `no nosemgrep marker above ${field}`);
    assert.ok(/public/i.test(above), `marker above ${field} gives no public demo reason`);
  }
});

test("explorer demo password is documented as a public demo value", () => {
  const lines = explorer.split("\n");
  const i = lines.findIndex((l) => /^const DEFAULT_PASSWORD\s*=/.test(l));
  assert.ok(i > 0, "DEFAULT_PASSWORD line not found in ApiExplorer/Authorization; if it was removed on purpose, drop this test");
  const near = lines.slice(Math.max(0, i - 3), i + 1).join("\n");
  assert.ok(/public demo/i.test(near), "no public-demo comment next to DEFAULT_PASSWORD");
  assert.ok(/nosemgrep/.test(near), "no nosemgrep reason next to DEFAULT_PASSWORD");
});
