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
  mdiOpenInNew,
  mdiPlay,
} from "@mdi/js";
import ApiPanel from "@site/src/components/ApiPanel";
import {
  SUBSCRIPTIONS,
  holdSession,
  createSubscription,
  findGateway,
  getSession,
  newAutoPayRequest,
  patchSession,
  readResult,
  rememberSubscription,
  sessionEpoch,
  resetSession,
  send,
  subscribe,
  watchPayment,
  type ExecuteResult,
  type Session,
} from "./session";
import { LANGUAGES, snippet, type SnippetRequest } from "./snippets";
import { isoDate } from "@site/src/utils/autoPayRequest";
import styles from "./styles.module.css";

export type EndpointKey =
  | "create"
  | "list"
  | "retrieve"
  | "cancel"
  | "cycles"
  | "page-link"
  | "regenerate-page-token";

type Method = "GET" | "POST";

/** One call, as built, shown (snippets.ts) and sent. */
type PreparedRequest = SnippetRequest;

type StepId = "gateway" | "subscription";

const STEPS: Record<StepId, { title: string; method: Method; path: string }> = {
  gateway: {
    title: "Find an auto-debit gateway",
    method: "POST",
    path: "/b/pbl/v2/payment-methods/",
  },
  subscription: {
    title: "Create a subscription",
    method: "POST",
    path: "/b/checkout/v1/pymt-txn/",
  },
};

const subscriptionPath = (session: Session, suffix = "") =>
  `${SUBSCRIPTIONS}/${session.subscriptionId ?? "<SUBSCRIPTION_ID>"}/${suffix}`;

const ENDPOINTS: Record<
  EndpointKey,
  { needs: StepId[]; request: (session: Session) => PreparedRequest }
> = {
  create: {
    needs: ["gateway"],
    request: (session) => ({
      method: "POST",
      path: STEPS.subscription.path,
      body: newAutoPayRequest(session.pgCodes ?? ["<AUTO_DEBIT_PG_CODE>"]),
    }),
  },
  // Filtered to this visit's customer: the sandbox merchant is shared.
  list: {
    needs: ["gateway", "subscription"],
    request: (session) => ({
      method: "POST",
      path: `${SUBSCRIPTIONS}/`,
      body: { customer_id: session.customerId ?? "<CUSTOMER_ID>", limit: 10 },
    }),
  },
  retrieve: {
    needs: ["gateway", "subscription"],
    request: (session) => ({ method: "GET", path: subscriptionPath(session) }),
  },
  cancel: {
    needs: ["gateway", "subscription"],
    request: (session) => ({
      method: "POST",
      path: subscriptionPath(session, "cancel/"),
      body: { mode: "immediate" },
      idempotent: true,
    }),
  },
  cycles: {
    needs: ["gateway", "subscription"],
    request: (session) => ({
      method: "GET",
      path: subscriptionPath(session, "cycles/"),
    }),
  },
  "page-link": {
    needs: ["gateway", "subscription"],
    request: (session) => ({
      method: "GET",
      path: subscriptionPath(session, "page-link/"),
    }),
  },
  "regenerate-page-token": {
    needs: ["gateway", "subscription"],
    request: (session) => ({
      method: "POST",
      path: subscriptionPath(session, "regenerate-page-token/"),
      idempotent: true,
    }),
  },
};

// A test subscription in a final state (canceled on the Cancel tab, setup
// failed after an abandoned checkout, expired) no longer counts: the other
// calls need a working one, so Run sets up a new one.
const FINAL_STATES = new Set(["canceled", "setup_failed", "expired"]);
const isDone = (step: StepId, session: Session) =>
  step === "gateway"
    ? Boolean(session.pgCodes)
    : Boolean(session.subscriptionId) &&
      !FINAL_STATES.has(session.subscriptionStatus ?? "");

type StepState = "pending" | "running" | "done" | "failed";

function Prerequisites({
  steps,
  onDone,
  onClose,
}: {
  steps: StepId[];
  onDone: () => void;
  onClose: () => void;
}) {
  const [states, setStates] = useState<Partial<Record<StepId, StepState>>>({});
  const [responses, setResponses] = useState<Partial<Record<StepId, unknown>>>(
    {},
  );
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
      if (isDone(step, getSession())) {
        setStates((prev) => ({ ...prev, [step]: "done" }));
        continue;
      }
      setStates((prev) => ({ ...prev, [step]: "running" }));
      try {
        const response =
          step === "gateway"
            ? await findGateway()
            : await createSubscription(getSession().pgCodes ?? []);
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
  }, [steps]);

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
                  <div className={styles.stepTitle}>{STEPS[step].title}</div>
                  <code className={styles.stepPath}>
                    {STEPS[step].method} {STEPS[step].path}
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

export function SubscriptionBar() {
  const session = useSyncExternalStore(subscribe, getSession, getSession);

  if (!session.subscriptionId) return null;
  return (
    <div className={styles.subscription}>
      <span>
        Test subscription <code>{session.subscriptionId}</code>{" "}
        <strong>{session.subscriptionStatus}</strong>
        {session.watchingPayment && (
          <span className={styles.note}> · waiting for the payment</span>
        )}
      </span>
      <span className={styles.subscriptionActions}>
        {session.checkoutUrl &&
          session.subscriptionStatus === "pending_setup" && (
            <a
              href={session.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={watchPayment}
            >
              Pay the first charge <Icon path={mdiOpenInNew} size={0.55} />
            </a>
          )}
        {session.pageUrl && (
          <a href={session.pageUrl} target="_blank" rel="noopener noreferrer">
            Open customer page <Icon path={mdiOpenInNew} size={0.55} />
          </a>
        )}
        <button className={styles.linkBtn} onClick={resetSession}>
          Start over
        </button>
      </span>
    </div>
  );
}

const utcDay = () => isoDate(new Date());

// The request and the response share the sticky column: each code box takes
// at most half of what is left below the navbar once the box heads, language
// tabs, hint and buttons (about 420px) are counted, so the column fits.
const CODE_HEIGHT =
  "max(140px, calc((100vh - var(--ifm-navbar-height) - 420px) / 2))";

/** Documented examples per status code, from the endpoint's OpenAPI responses. */
export type ResponseExamples = {
  code: string;
  examples: { name: string; summary: string; value: unknown }[];
}[];

export default function ApiExecuteInner({
  endpoint,
  examples = [],
}: {
  endpoint: EndpointKey;
  examples?: ResponseExamples;
}) {
  const session = useSyncExternalStore(subscribe, getSession, getSession);
  const { needs, request } = ENDPOINTS[endpoint];
  useEffect(() => holdSession(), []);
  const [askPrerequisites, setAskPrerequisites] = useState(false);
  // Start over (a new session epoch): drop the old run's response and error.
  const epochNow = sessionEpoch();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecuteResult>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    setResult(undefined);
    setError(undefined);
  }, [epochNow]);
  // Which documented example the response box shows until the reader runs the call.
  const [shown, setShown] = useState(
    () => `${examples[0]?.code}:${examples[0]?.examples[0]?.name}`,
  );

  // The next request: what the code box shows, what Copy copies and what Run
  // sends. Rebuilt only when a value it uses changes, so it stays put while
  // the reader reads it. After a Create run, `fresh` gives the next one new
  // random ids (order_no and customer_id must not repeat).
  const [fresh, setFresh] = useState(0);
  const { pgCodes, subscriptionId, customerId } = session;
  // What this request is built from: Create only needs the gateway, so a
  // subscription made on another tab does not change its code.
  const inputs =
    endpoint === "create"
      ? String(pgCodes)
      : `${pgCodes}|${subscriptionId}|${customerId}`;
  // Create's start_date is relative to today: rebuild on a new (UTC) day.
  const day = utcDay();
  const prepared = useMemo(
    () => request(getSession()),
    [request, inputs, fresh, day],
  );
  const preparedRef = useRef(prepared);
  preparedRef.current = prepared;
  const dayRef = useRef(day);
  dayRef.current = day;
  // Built once per request, not on every render.
  const snippets = useMemo(
    () =>
      LANGUAGES.map((option) => ({
        ...option,
        code: snippet(option.value, prepared),
      })),
    [prepared],
  );
  const missing = needs.filter((step) => !isDone(step, session));

  const execute = useCallback(async () => {
    const current = getSession();
    // A new UTC day since the code was built: Create's start_date is stale.
    const call =
      dayRef.current === utcDay() ? preparedRef.current : request(getSession());
    const startedIn = sessionEpoch();
    setBusy(true);
    setError(undefined);
    setResult(undefined); // never show an older run's response next to this one
    try {
      const response = await send(call.method, call.path, {
        body: call.body,
        headers: call.idempotent
          ? { "Idempotency-Key": crypto.randomUUID() }
          : undefined,
      });
      // Start over during the call: this response belongs to the old session.
      if (sessionEpoch() !== startedIn) {
        if (endpoint === "create")
          rememberSubscription(
            call.body as { customer_id: string },
            readResult(response),
            startedIn,
          ); // cancels the subscription it created
        return;
      }
      setResult(response);
      // Keeping the test subscription up to date is bookkeeping: if it fails,
      // the reader still sees the response they asked for.
      try {
        const data = readResult(response);
        // Only about the subscription the call was for, and only while the
        // session still holds it: a Create elsewhere may have replaced it.
        const { subscriptionId } = current;
        const stillCurrent =
          Boolean(subscriptionId) &&
          getSession().subscriptionId === subscriptionId;
        if (endpoint === "create") {
          rememberSubscription(
            call.body as { customer_id: string },
            data,
            startedIn,
          );
        } else if (stillCurrent) {
          const patch: Partial<Session> = {};
          if (data.pageUrl) patch.pageUrl = data.pageUrl;
          // A status in the body is the subscription's only when it is.
          if (data.id === subscriptionId && data.status) {
            patch.subscriptionStatus = data.status;
            patch.live = getSession().live && !FINAL_STATES.has(data.status);
          }
          if (Object.keys(patch).length > 0) patchSession(patch);
        }
      } catch (err) {
        console.warn("ApiExecute: could not update the test subscription", err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      if (endpoint === "create") setFresh((n) => n + 1);
    }
  }, [endpoint, request]);

  const onExecute = () => {
    if (missing.length > 0) setAskPrerequisites(true);
    else execute();
  };

  const onPrerequisitesDone = useCallback(() => {
    setAskPrerequisites(false);
    execute();
  }, [execute]);

  const closePrerequisites = useCallback(() => setAskPrerequisites(false), []);

  const options = examples.flatMap(({ code, examples: list }) =>
    list.map((example) => ({
      key: `${code}:${example.name}`,
      code,
      ...example,
    })),
  );
  const example = options.find((option) => option.key === shown) ?? options[0];

  // What the response box shows. The documented examples only show when
  // nothing ran, so they are never mistaken for the sandbox's answer.
  const mode = busy
    ? "running"
    : error
      ? "error"
      : result
        ? "live"
        : "examples";
  // Ids that only exist once the prerequisites ran (not the API key, which
  // the reader always supplies).
  const needsIds = /<(?!YOUR_API_KEY>)[A-Z_]+>/.test(
    `${prepared.path} ${JSON.stringify(prepared.body ?? {})}`,
  );
  const showExamples = () => {
    setResult(undefined);
    setError(undefined);
  };

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
          {mode === "examples" && options.length > 0 && (
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
          )}
          {mode === "running" && (
            <span className={styles.liveTag}>Running…</span>
          )}
          {mode === "live" && result && (
            <span className={styles.liveTag}>
              Live · {result.status} · {result.ms} ms
              <button className={styles.linkBtn} onClick={showExamples}>
                Show examples
              </button>
            </span>
          )}
          {mode === "error" && (
            <span className={styles.liveTag}>
              <button className={styles.linkBtn} onClick={showExamples}>
                Show examples
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
            <ApiPanel
              label="JSON"
              data={example.value}
              maxHeight={CODE_HEIGHT}
              className={styles.boxPanel}
            />
          ) : (
            <p className={styles.note}>Run the request to see the response.</p>
          ))}
      </div>

      {askPrerequisites && (
        <Prerequisites
          steps={needs}
          onDone={onPrerequisitesDone}
          onClose={closePrerequisites}
        />
      )}
    </div>
  );
}
