// Pure helpers for the "Set up prerequisites" dialog (ApiExecuteInner.tsx),
// kept apart so they can be unit tested (dialog.test.ts, `npm test`).

/**
 * The dialog's main button: "Run" for one prerequisite, "Run all" for two or
 * more, "Continue" once they are done (#161111 R16).
 */
export function runButtonLabel(stepCount: number, finished: boolean): string {
  if (finished) return "Continue";
  return stepCount > 1 ? "Run all" : "Run";
}

/**
 * The response as the dialog prints it, one entry per line, each marked when
 * it holds one of the values the step extracted, so they can be highlighted
 * the way a diff highlights a change. A value matches only as a whole JSON
 * string value (`"code": "cybersource-autopay"`), never as part of a longer
 * one or as a bare number, which would mark unrelated fields that happen to
 * hold the same digits.
 */
export function markExtracted(
  response: unknown,
  values: string[],
): { text: string; extracted: boolean }[] {
  const text =
    typeof response === "string" ? response : JSON.stringify(response, null, 2) ?? "";
  const wanted = values.filter((value) => value !== "");
  return text.split("\n").map((line) => ({
    text: line,
    extracted: wanted.some((value) => holds(line, value)),
  }));
}

/** The line is a key/value or array item whose whole string value is `value`. */
function holds(line: string, value: string): boolean {
  const quoted = JSON.stringify(value);
  const item = line.trim().replace(/,$/, "");
  return item === quoted || item.endsWith(`: ${quoted}`);
}
