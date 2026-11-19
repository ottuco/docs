// Pure helpers for the "Set up prerequisites" dialog (ApiExecuteInner.tsx).

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
 * the way a diff highlights a change. A value matches as a whole JSON string
 * (`"cybersource-autopay"`) or, for numbers and booleans, as a whole value
 * after a key, never as part of a longer value.
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

function holds(line: string, value: string): boolean {
  if (line.includes(JSON.stringify(value))) return true;
  // A bare number or boolean: `"count": 3,` holds "3", `"amount": 30` does not.
  const bare = line.match(/:\s*([^"\s,][^,]*?)\s*,?\s*$/);
  return bare !== null && bare[1] === value;
}
