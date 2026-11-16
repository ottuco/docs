import React, { useMemo, useState } from "react";
import ApiPanel from "@site/src/components/ApiPanel";
import styles from "./styles.module.css";

/** Documented examples per status code, from the endpoint's OpenAPI responses. */
export type ResponseExamples = {
  code: string;
  examples: { name: string; summary: string; value: unknown }[];
}[];

export type ExampleOption = {
  key: string;
  code: string;
  name: string;
  summary: string;
  value: unknown;
};

// The request and the response share the sticky column: each code box takes
// at most half of what is left below the navbar once the box heads, language
// tabs, hint and buttons (about 420px) are counted, so the column fits.
export const CODE_HEIGHT =
  "max(140px, calc((100vh - var(--ifm-navbar-height) - 420px) / 2))";

// The examples box alone has the whole sticky column (less its head).
const ALONE_HEIGHT = "calc(100vh - var(--ifm-navbar-height) - 120px)";

/**
 * The documented examples, one option each in the order of the spec; which one
 * is shown, and the picker that changes it.
 */
export function useExample(examples: ResponseExamples) {
  const options: ExampleOption[] = useMemo(
    () =>
      examples.flatMap(({ code, examples: list }) =>
        list.map((example) => ({
          key: `${code}:${example.name}`,
          code,
          ...example,
        })),
      ),
    [examples],
  );
  const [shown, setShown] = useState(options[0]?.key);
  const example = options.find((option) => option.key === shown) ?? options[0];
  const picker =
    options.length > 0 ? (
      <select
        className={styles.select}
        value={example?.key}
        onChange={(event) => setShown(event.target.value)}
        aria-label="Response example"
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.code} · {option.summary}
          </option>
        ))}
      </select>
    ) : null;
  return { options, example, picker };
}

/** One documented example's JSON, in a box of the run panel's style. */
export function ExamplePanel({
  example,
  maxHeight = CODE_HEIGHT,
}: {
  example: ExampleOption;
  maxHeight?: string;
}): React.JSX.Element {
  return (
    <ApiPanel
      label="JSON"
      data={example.value}
      maxHeight={maxHeight}
      className={styles.boxPanel}
    />
  );
}

/** The documented response examples alone: an endpoint the docs can't run. */
export default function ResponseExamplesBox({
  examples,
}: {
  examples: ResponseExamples;
}): React.JSX.Element | null {
  const { example, picker } = useExample(examples);
  if (!example) return null;
  return (
    <div className={styles.box}>
      <div className={styles.boxHead}>
        <span className={styles.boxTitle}>Response</span>
        {picker}
      </div>
      <ExamplePanel example={example} maxHeight={ALONE_HEIGHT} />
    </div>
  );
}
