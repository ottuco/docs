/**
 * The "Prerequisites" step of the API explorer: runs an endpoint's setup chain
 * against the sandbox, shows each setup request and its response, and fills the
 * returned values into the explorer's parameters. The reader then sends the
 * request as usual.
 *
 * Chains live in src/utils/tryItPrerequisites.ts, keyed by operationId.
 */

import React, { useCallback, useState } from "react";
// @ts-ignore - theme alias resolved by Docusaurus at build time
import { setParam } from "@theme/ApiExplorer/ParamOptions/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import ApiPanel from "@site/src/components/ApiPanel";
import {
  fillValue,
  runChain,
  type PrereqChain,
  type PrereqStepResult,
} from "@site/src/utils/tryItPrerequisites";
import styles from "./styles.module.css";

interface Filled {
  name: string;
  value: string;
}

export default function TryItPrerequisites({ chain }: { chain: PrereqChain }): React.JSX.Element {
  const params = useTypedSelector((state: any) => state.params);
  const dispatch = useTypedDispatch();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<PrereqStepResult[]>([]);
  const [filled, setFilled] = useState<Filled[]>([]);
  const [error, setError] = useState<string>();

  const run = useCallback(async () => {
    setBusy(true);
    setResults([]);
    setFilled([]);
    setError(undefined);
    try {
      const ctx = await runChain(chain, (index, result) =>
        setResults((prev) => {
          const next = prev.slice(0, index);
          next[index] = result;
          return next;
        }),
      );
      if (!ctx) return;
      const done: Filled[] = [];
      for (const fill of chain.fills) {
        const param = (params[fill.in] ?? []).find((p: any) => p.name === fill.name);
        const value = fillValue(fill, ctx);
        if (!param || value === undefined) continue;
        dispatch(setParam({ ...param, value }));
        done.push({ name: fill.name, value });
      }
      setFilled(done);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The setup failed.");
    } finally {
      setBusy(false);
    }
  }, [chain, params, dispatch]);

  return (
    <details open={open} className={`openapi-explorer__details-container ${styles.prereqs}`}>
      <summary
        className="openapi-explorer__details-summary"
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        Prerequisites
      </summary>
      <div className={styles.body}>
        <p className={styles.summary}>{chain.summary}</p>
        <ol className={styles.steps}>
          {chain.steps.map((step) => (
            <li key={step.title}>
              <code>{step.method}</code> {step.path} <span className={styles.stepTitle}>{step.title}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="button button--sm button--primary"
          onClick={run}
          disabled={busy}
        >
          {busy ? "Running…" : results.length ? "Run again" : "Run prerequisites"}
        </button>
        <span className={styles.note}>Runs on the sandbox with the demo API key.</span>

        {results.map((r, i) => (
          <div key={i} className={styles.result}>
            <div className={styles.resultTitle}>
              {i + 1}. {r.title}
              {r.status !== undefined ? (
                <span className={r.error ? styles.statusError : styles.statusOk}>{r.status}</span>
              ) : !r.error ? (
                <span className={styles.pending}>…</span>
              ) : null}
            </div>
            <ApiPanel
              label={`Request · ${r.method} ${r.url}`}
              data={r.body === undefined ? `${r.method} ${r.url}` : r.body}
            />
            {r.response !== undefined ? <ApiPanel label={`Response · ${r.status}`} data={r.response} /> : null}
            {r.error ? <div className={styles.error}>{r.error}</div> : null}
          </div>
        ))}

        {error ? <div className={styles.error}>{error}</div> : null}

        {filled.length > 0 ? (
          <div className={styles.filled}>
            Filled in{" "}
            {filled.map((f, i) => (
              <React.Fragment key={f.name}>
                {i > 0 ? ", " : ""}
                <code>{f.name}</code> = <code>{f.value}</code>
              </React.Fragment>
            ))}
            . Now press <strong>Send API Request</strong>.
          </div>
        ) : null}
      </div>
    </details>
  );
}
