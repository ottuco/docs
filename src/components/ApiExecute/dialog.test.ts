// Run with `npm test` (node:test through tsx).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { markExtracted, runButtonLabel } from "./dialog";

describe("runButtonLabel", () => {
  it("says Run for a single prerequisite", () => {
    assert.equal(runButtonLabel(1, false), "Run");
  });
  it("says Run all for two or more", () => {
    assert.equal(runButtonLabel(2, false), "Run all");
    assert.equal(runButtonLabel(5, false), "Run all");
  });
  it("says Continue once the prerequisites are done, whatever their count", () => {
    assert.equal(runButtonLabel(1, true), "Continue");
    assert.equal(runButtonLabel(2, true), "Continue");
  });
});

describe("markExtracted", () => {
  const response = {
    payment_methods: [
      { code: "cybersource-autopay", name: "Card" },
      { code: "cybersource-autopay-kwd", name: "Card KWD" },
    ],
    count: 3,
    amount: 30,
  };

  const marked = (values: string[]) =>
    markExtracted(response, values)
      .filter((line) => line.extracted)
      .map((line) => line.text.trim());

  it("marks the line that holds an extracted string, as a whole value only", () => {
    assert.deepEqual(marked(["cybersource-autopay"]), ['"code": "cybersource-autopay",']);
  });
  it("marks every extracted value", () => {
    assert.deepEqual(marked(["cybersource-autopay", "cybersource-autopay-kwd"]), [
      '"code": "cybersource-autopay",',
      '"code": "cybersource-autopay-kwd",',
    ]);
  });
  it("marks a bare number only when it is the whole value", () => {
    assert.deepEqual(marked(["3"]), ['"count": 3,']);
  });
  it("marks nothing for an empty value or a value that is not there", () => {
    assert.deepEqual(marked([""]), []);
    assert.deepEqual(marked(["sub_missing"]), []);
  });
  it("keeps every line of the printed response, in order", () => {
    const lines = markExtracted(response, []);
    assert.equal(lines.map((line) => line.text).join("\n"), JSON.stringify(response, null, 2));
  });
  it("prints a string response as it is", () => {
    assert.deepEqual(markExtracted("plain text", ["plain text"]), [{ text: "plain text", extracted: false }]);
  });
});
