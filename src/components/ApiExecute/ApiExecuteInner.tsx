import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Icon from "@mdi/react";
import {
  mdiAlertCircleOutline,
  mdiCheck,
  mdiClose,
  mdiLoading,
  mdiPlay,
} from "@mdi/js";
import ApiPanel from "@site/src/components/ApiPanel";
import type { AnyScenario } from "./scenario";
import { runOf, type ScenarioKey } from "./scenarios";
import { send, type ExecuteResult } from "./send";
import { LANGUAGES, snippet } from "./snippets";
import {
  CODE_HEIGHT,
  ExamplePanel,
  useExample,
  type ResponseExamples,
} from "./ResponseExamples";
import styles from "./styles.module.css";

// The run panel, for any API: the calls, the live ids they chain and the
// test objects they leave behind come from the endpoint's scenario
// (scenarios/<name>/, see scenario.ts).

type StepState = "pending" | "running" | "done" | "failed";

function Prerequisites({
  scenario,
  steps,
  onDone,
  onClose,
}: {
  scenario: AnyScenario;
  steps: string[];
  onDone: () => void;
  onClose: () => void;
}) {
  const [states, setStates] = useState<Record<string, StepState>>({});
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [finished, setFinished] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runAll = useCallback(async () => {
    setRunning(true);
    setError(undefined);
    for (const step of steps) {
      if (scenario.steps[step].done(scenario.getState())) {
        setStates((prev) => ({ ...prev, [step]: "done" }));
        continue;
      }
      setStates((prev) => ({ ...prev, [step]: "running" }));
      try {
        const response = await scenario.steps[step].run();
        setResponses((prev) => ({ ...prev, [step]: response }));
        setStates((prev) => ({ ...prev, [step]: "done" }));
      } catch (err) {
        setStates((prev) => ({ ...prev, [step]: "failed" }));
        setError(err instanceof Error ? err.message : "Something went wrong");
        setRunning(false);
        return;
      }
    }
    setRunning(false);
    setFinished(true);
  }, [scenario, steps]);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-execute-prerequisites"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <div>
            <h3 id="api-execute-prerequisites" className={styles.dialogTitle}>
              Set up prerequisites
            </h3>
            <p className={styles.dialogText}>
              This call depends on other objects. Create them in the sandbox
              first?
            </p>
          </div>
          <button
            className={styles.primaryBtn}
            onClick={finished ? onDone : runAll}
            disabled={running}
          >
            <Icon
              path={running ? mdiLoading : mdiPlay}
              size={0.7}
              spin={running}
            />
            {finished ? "Continue" : "Run all"}
          </button>
        </div>
        <ol className={styles.steps}>
          {steps.map((step) => {
            const state = states[step] ?? "pending";
            const { title, method, path } = scenario.steps[step];
            return (
              <li key={step} className={styles.step}>
                <span className={styles.stepIcon} data-state={state}>
                  {state === "done" && <Icon path={mdiCheck} size={0.65} />}
                  {state === "running" && (
                    <Icon path={mdiLoading} size={0.65} spin />
                  )}
                  {state === "failed" && (
                    <Icon path={mdiAlertCircleOutline} size={0.65} />
                  )}
                </span>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>{title}</div>
                  <code className={styles.stepPath}>
                    {method} {path}
                  </code>
                  {responses[step] !== undefined && (
                    <details className={styles.details}>
                      <summary>Response</summary>
                      <ApiPanel label="Response" data={responses[step]} />
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

// One empty list for every panel without examples: a stable default.
const NO_EXAMPLES: ResponseExamples = [];

export default function ApiExecuteInner({
  scenario: scenarioKey,
  endpoint,
  examples = NO_EXAMPLES,
}: {
  scenario: ScenarioKey;
  endpoint: string;
  examples?: ResponseExamples;
}) {
  const { scenario, endpoint: definition } = runOf(scenarioKey, endpoint);
  const { needs, request } = definition;
  const state = useSyncExternalStore(
    scenario.subscribe,
    scenario.getState,
    scenario.getState,
  );
  useEffect(() => scenario.hold?.(), [scenario]);
  const epochOf = useCallback(() => scenario.epoch?.() ?? 0, [scenario]);
  const [askPrerequisites, setAskPrerequisites] = useState(false);
  // Start over (a new epoch): drop the old run's response and error.
  const epochNow = epochOf();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecuteResult>();
  const [error, setError] = useState<string>();
  // The reader looks at the documented examples after a run; the run's
  // response stays, one click away.
  const [browsingExamples, setBrowsingExamples] = useState(false);
  useEffect(() => {
    setResult(undefined);
    setError(undefined);
    setBrowsingExamples(false);
  }, [epochNow]);
  // Which documented example the response box shows until the reader runs the call.
  const { options, example, picker } = useExample(examples);

  // The next request: what the code box shows, what Copy copies and what Run
  // sends. Rebuilt only when what it is built from changes (the endpoint's
  // `inputs`), so it stays put while the reader reads it; `fresh` gives an
  // endpoint with ids that must not repeat a new request after each run.
  const [fresh, setFresh] = useState(0);
  const inputs = definition.inputs(state);
  const prepared = useMemo(
    () => request(scenario.getState()),
    [scenario, request, inputs, fresh],
  );
  const preparedRef = useRef({ request: prepared, inputs });
  preparedRef.current = { request: prepared, inputs };
  // Built once per request, not on every render.
  const snippets = useMemo(
    () =>
      LANGUAGES.map((option) => ({
        ...option,
        code: snippet(option.value, prepared),
      })),
    [prepared],
  );
  const missing = needs.filter((step) => !scenario.steps[step].done(state));

  const execute = useCallback(async () => {
    const before = scenario.getState();
    // What the code was built from changed since it was shown (say, a new
    // day for a date in it): send a request built from the current state.
    const shown = preparedRef.current;
    const call =
      shown.inputs === definition.inputs(before) ? shown.request : request(before);
    const startedIn = epochOf();
    setBusy(true);
    setBrowsingExamples(false);
    setError(undefined);
    setResult(undefined); // never show an older run's response next to this one
    try {
      const response = await send(call.method, call.path, {
        body: call.body,
        headers: call.idempotent
          ? { "Idempotency-Key": crypto.randomUUID() }
          : undefined,
      });
      // Started over during the call: the response belongs to the old
      // session, but the scenario still hears of it (to clean up).
      if (epochOf() === startedIn) setResult(response);
      try {
        scenario.afterRun?.({
          endpoint,
          request: call,
          result: response,
          before,
          startedIn,
        });
      } catch (err) {
        console.warn("ApiExecute: could not update the scenario's state", err);
      }
    } catch (err) {
      // Started over during the call: the failure belongs to the old session.
      if (epochOf() !== startedIn)
        console.warn("ApiExecute: a call of the old session failed", err);
      else
        setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      if (definition.newEachRun) setFresh((n) => n + 1);
    }
  }, [scenario, definition, endpoint, request, epochOf]);

  const onExecute = () => {
    if (missing.length > 0) setAskPrerequisites(true);
    else execute();
  };

  const onPrerequisitesDone = useCallback(() => {
    setAskPrerequisites(false);
    execute();
  }, [execute]);

  const closePrerequisites = useCallback(() => setAskPrerequisites(false), []);

  // What the response box shows. After a run the documented examples show
  // only when the reader asks, so they are never mistaken for the sandbox's
  // answer.
  const ran = Boolean(error || result);
  const mode = busy
    ? "running"
    : browsingExamples || !ran
      ? "examples"
      : error
        ? "error"
        : "live";
  // Ids that only exist once the prerequisites ran (not the API key, which
  // the reader always supplies).
  const needsIds = /<(?!YOUR_API_KEY>)[A-Z_]+>/.test(
    `${prepared.path} ${JSON.stringify(prepared.body ?? {})}`,
  );

  return (
    <div className={styles.panel} data-api-execute={endpoint}>
      <div className={styles.box}>
        <div className={styles.boxHead}>
          <span className={styles.method} data-method={prepared.method}>
            {prepared.method}
          </span>
          <code className={styles.path}>{prepared.path}</code>
        </div>
        {/* The site's language tabs: the choice is shared with every
            groupId="language" code sample, on this page and the others. */}
        <div className={styles.langTabs}>
          <Tabs groupId="language">
            {snippets.map((option) => (
              <TabItem
                key={option.value}
                value={option.value}
                label={option.label}
              >
                <ApiPanel
                  label={option.label}
                  data={option.code}
                  maxHeight={CODE_HEIGHT}
                  className={styles.boxPanel}
                />
              </TabItem>
            ))}
          </Tabs>
        </div>
        {needsIds && (
          <p className={styles.note}>
            Replace the <code>&lt;…&gt;</code> values with your own, or press
            Run to create them on the sandbox first.
          </p>
        )}
        <div className={styles.boxFoot}>
          <span className={styles.note}>
            Runs on the Ottu sandbox with a public test key.
          </span>
          <button
            className={styles.primaryBtn}
            onClick={onExecute}
            disabled={busy}
          >
            <Icon path={busy ? mdiLoading : mdiPlay} size={0.7} spin={busy} />
            Run
          </button>
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.boxHead}>
          <span className={styles.boxTitle}>Response</span>
          {mode === "examples" && picker}
          {mode === "running" && (
            <span className={styles.liveTag}>Running…</span>
          )}
          {mode === "live" && result && (
            <span className={styles.liveTag}>
              <span>
                Live · {result.status} · {result.ms} ms
              </span>
              {options.length > 0 && (
                <button
                  className={styles.linkBtn}
                  onClick={() => setBrowsingExamples(true)}
                >
                  Show examples
                </button>
              )}
            </span>
          )}
          {mode === "error" && (
            <span className={styles.liveTag}>
              {options.length > 0 && (
                <button
                  className={styles.linkBtn}
                  onClick={() => setBrowsingExamples(true)}
                >
                  Show examples
                </button>
              )}
            </span>
          )}
          {mode === "examples" && ran && (
            <span className={styles.liveTag}>
              <button
                className={styles.linkBtn}
                onClick={() => setBrowsingExamples(false)}
              >
                {result
                  ? `Back to response (${result.status})`
                  : "Back to error"}
              </button>
            </span>
          )}
        </div>
        {mode === "running" && (
          <p className={styles.note}>Calling the Ottu sandbox…</p>
        )}
        {mode === "error" && <p className={styles.error}>{error}</p>}
        {mode === "live" && result && (
          <ApiPanel
            label="JSON"
            data={result.body}
            maxHeight={CODE_HEIGHT}
            className={styles.boxPanel}
          />
        )}
        {mode === "examples" &&
          (example ? (
            <ExamplePanel example={example} />
          ) : (
            <p className={styles.note}>Run the request to see the response.</p>
          ))}
      </div>

      {askPrerequisites && (
        <Prerequisites
          scenario={scenario}
          steps={needs}
          onDone={onPrerequisitesDone}
          onClose={closePrerequisites}
        />
      )}
    </div>
  );
}
