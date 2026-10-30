import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Icon from "@mdi/react";
import { mdiAlertCircleOutline, mdiCheck, mdiClose, mdiLoading, mdiOpenInNew, mdiPlay } from "@mdi/js";
import { ACTIVE_CONNECT } from "@site/src/utils/sandbox";
import ApiPanel from "@site/src/components/ApiPanel";
import {
  SUBSCRIPTIONS,
  cancelLiveSubscription,
  createSubscription,
  findGateway,
  getSession,
  newAutoPayRequest,
  patchSession,
  rememberSubscription,
  resetSession,
  send,
  subscribe,
  watchPayment,
  type ExecuteResult,
  type Session,
} from "./session";
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

interface PreparedRequest {
  method: Method;
  path: string;
  body?: Record<string, unknown>;
  idempotent?: boolean;
}

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
    request: (session) => ({ method: "GET", path: subscriptionPath(session, "cycles/") }),
  },
  "page-link": {
    needs: ["gateway", "subscription"],
    request: (session) => ({ method: "GET", path: subscriptionPath(session, "page-link/") }),
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

const isDone = (step: StepId, session: Session) =>
  step === "gateway" ? Boolean(session.pgCodes) : Boolean(session.subscriptionId);

function toCurl({ method, path, body, idempotent }: PreparedRequest): string {
  const lines = [
    `curl -X ${method} '${ACTIVE_CONNECT.connectBaseUrl}${path}'`,
    `  -H 'Authorization: Api-Key <YOUR_API_KEY>'`,
  ];
  if (body) lines.push(`  -H 'Content-Type: application/json'`);
  if (idempotent) lines.push(`  -H 'Idempotency-Key: <UNIQUE_KEY>'`);
  if (body) lines.push(`  -d '${JSON.stringify(body, null, 2)}'`);
  return lines.join(" \\\n");
}

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
  const [responses, setResponses] = useState<Partial<Record<StepId, unknown>>>({});
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
          step === "gateway" ? await findGateway() : await createSubscription(getSession().pgCodes ?? []);
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
              This call depends on other objects. Create them in the sandbox first?
            </p>
          </div>
          <button
            className={styles.primaryBtn}
            onClick={finished ? onDone : runAll}
            disabled={running}
          >
            <Icon path={running ? mdiLoading : mdiPlay} size={0.7} spin={running} />
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
                  {state === "running" && <Icon path={mdiLoading} size={0.65} spin />}
                  {state === "failed" && <Icon path={mdiAlertCircleOutline} size={0.65} />}
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
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <Icon path={mdiClose} size={0.8} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function SubscriptionBar() {
  const session = useSyncExternalStore(subscribe, getSession, getSession);

  useEffect(() => {
    window.addEventListener("pagehide", cancelLiveSubscription);
    return () => {
      window.removeEventListener("pagehide", cancelLiveSubscription);
      cancelLiveSubscription();
    };
  }, []);

  if (!session.subscriptionId) return null;
  return (
    <div className={styles.subscription}>
      <span>
        Test subscription <code>{session.subscriptionId}</code>{" "}
        <strong>{session.subscriptionStatus}</strong>
        {session.watchingPayment && <span className={styles.note}> · waiting for the payment</span>}
      </span>
      <span className={styles.subscriptionActions}>
        {session.checkoutUrl && session.subscriptionStatus === "pending_setup" && (
          <a href={session.checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={watchPayment}>
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

export default function ApiExecuteInner({ endpoint }: { endpoint: EndpointKey }) {
  const session = useSyncExternalStore(subscribe, getSession, getSession);
  const { needs, request } = ENDPOINTS[endpoint];
  const [askPrerequisites, setAskPrerequisites] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecuteResult>();
  const [error, setError] = useState<string>();

  const prepared = useMemo(() => request(session), [request, session]);
  const missing = needs.filter((step) => !isDone(step, session));

  const execute = useCallback(async () => {
    const current = getSession();
    const call = request(current);
    setBusy(true);
    setError(undefined);
    try {
      const response = await send(call.method, call.path, {
        body: call.body,
        headers: call.idempotent ? { "Idempotency-Key": crypto.randomUUID() } : undefined,
      });
      setResult(response);
      const data = response.body as any;
      if (data?.page_url) patchSession({ pageUrl: data.page_url });
      if (endpoint === "create") {
        rememberSubscription(call.body as { customer_id: string }, data);
      } else if (data?.id === current.subscriptionId && data?.status) {
        patchSession({
          subscriptionStatus: data.status,
          live: current.live && data.status !== "canceled",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
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

  return (
    <div className={styles.execute} data-api-execute={endpoint}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.method} data-method={prepared.method}>
            {prepared.method}
          </span>
          <code className={styles.path}>{prepared.path}</code>
        </div>
        <button className={styles.primaryBtn} onClick={onExecute} disabled={busy}>
          <Icon path={busy ? mdiLoading : mdiPlay} size={0.7} spin={busy} />
          Execute
        </button>
      </div>
      <p className={styles.note}>Runs on the Ottu sandbox with a public test key.</p>

      <details className={styles.details}>
        <summary>Request</summary>
        <ApiPanel label="cURL" data={toCurl(prepared)} />
      </details>

      {error && <p className={styles.error}>{error}</p>}
      {result && <ApiPanel label={`Response ${result.status} · ${result.ms} ms`} data={result.body} />}

      {askPrerequisites && (
        <Prerequisites steps={needs} onDone={onPrerequisitesDone} onClose={closePrerequisites} />
      )}
    </div>
  );
}
