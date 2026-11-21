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
// (f029206) before #161377.
const SANDBOX_BLOCK_SHA256 = "877bfb4b5c0b11f6144ea3940b1e7dd556475c6277758b11ad1002c751654f9a";

test("no KSA dev-server credentials in the frontend", () => {
  // assert.ok with a message, so a failure never prints the file (it holds keys)
  assert.ok(!/export const KSA\b/.test(src), "sandbox.ts still exports KSA");
  assert.ok(!/ksa\.ottu\.dev/.test(src), "sandbox.ts still names ksa.ottu.dev");
});

test("sandbox demo credentials and the active switch are unchanged", () => {
  const block = src.match(/export const SANDBOX: ConnectEnv = \{.*?\n\};\n/s);
  assert.ok(block, "SANDBOX block not found");
  const sha = createHash("sha256").update(block[0]).digest("hex");
  assert.equal(sha, SANDBOX_BLOCK_SHA256, "SANDBOX block changed");
  assert.ok(/export const ACTIVE_CONNECT: ConnectEnv = SANDBOX;/.test(src), "ACTIVE_CONNECT is not SANDBOX");
});
