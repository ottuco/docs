import React, { useReducer, useRef, useCallback, useEffect, useState, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiLoading, mdiAlertCircleOutline, mdiChevronDown, mdiChevronRight, mdiChevronLeft } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
  callPaymentStatusQuery,
  getWebhookBaseUrl,
} from "@site/src/utils/sandbox";
import { createDemoCallbacks } from "@site/src/utils/checkoutSdk";
import ApiPanel from "@site/src/components/ApiPanel";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import WebhookViewer from "@site/src/components/RecurringDemo/WebhookViewer";
import { TEST_CARD } from "@site/src/components/TestCardCallout";
import { COUNTRIES, DEFAULT_COUNTRY_INDEX } from "./countries";
import styles from "./styles.module.css";

// ── Types ──────────────────────────────────────────────

type Status =
  | "idle"
  | "step0_country"
  | "step1_calling"
  | "step1_done"
  | "step2_calling"
  | "step2_done"
  | "step3_choose"
  | "step3a_redirect"
  | "step3b_sdk"
  | "step3b_ready"
  | "step3b_success"
  | "step4_webhook"
  | "step4_done"
  | "step5_pgparams"
  | "step6_calling"
  | "step6_done"
  | "complete"
  | "error";

interface State {
  status: Status;
  selectedCountryIndex: number;
  selectedCurrency: string;
  pgCodes: string[];
  sessionId: string;
  checkoutUrl: string;
  checkoutResponse: any;
  paymentMethodsResponse: any;
  webhookPayload: any;
  psqResponse: any;
  orderId: string;
  chosenPath: "redirect" | "sdk" | null;
  errorMessage: string;
}

type Action =
  | { type: "START" }
  | { type: "SELECT_COUNTRY"; index: number }
  | { type: "COUNTRY_CONFIRMED" }
  | { type: "STEP1_DONE"; pgCodes: string[]; response: any }
  | { type: "STEP2_DONE"; sessionId: string; checkoutUrl: string; response: any }
  | { type: "CHOOSE_PATH" }
  | { type: "SELECT_REDIRECT" }
  | { type: "SELECT_SDK" }
  | { type: "SDK_READY" }
  | { type: "PAYMENT_SUCCESS" }
  | { type: "WAITING_WEBHOOK" }
  | { type: "WEBHOOK_RECEIVED"; payload: any }
  | { type: "CONTINUE_PGPARAMS" }
  | { type: "STEP6_CALLING" }
  | { type: "STEP6_DONE"; response: any }
  | { type: "FINISH" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

const initialState: State = {
  status: "idle",
  selectedCountryIndex: DEFAULT_COUNTRY_INDEX,
  selectedCurrency: COUNTRIES[DEFAULT_COUNTRY_INDEX].currency,
  pgCodes: [],
  sessionId: "",
  checkoutUrl: "",
  checkoutResponse: null,
  paymentMethodsResponse: null,
  webhookPayload: null,
  psqResponse: null,
  orderId: "",
  chosenPath: null,
  errorMessage: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState, status: "step0_country", selectedCountryIndex: state.selectedCountryIndex, selectedCurrency: state.selectedCurrency, orderId: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    case "SELECT_COUNTRY":
      return { ...state, selectedCountryIndex: action.index, selectedCurrency: COUNTRIES[action.index].currency };
    case "COUNTRY_CONFIRMED":
      return { ...state, status: "step1_calling" };
    case "STEP1_DONE":
      return { ...state, status: "step1_done", pgCodes: action.pgCodes, paymentMethodsResponse: action.response };
    case "STEP2_DONE":
      return { ...state, status: "step2_done", sessionId: action.sessionId, checkoutUrl: action.checkoutUrl, checkoutResponse: action.response };
    case "CHOOSE_PATH":
      return { ...state, status: "step3_choose" };
    case "SELECT_REDIRECT":
      return { ...state, status: "step3a_redirect", chosenPath: "redirect" };
    case "SELECT_SDK":
      return { ...state, status: "step3b_sdk", chosenPath: "sdk" };
    case "SDK_READY":
      return { ...state, status: "step3b_ready" };
    case "PAYMENT_SUCCESS":
      return { ...state, status: "step3b_success" };
    case "WAITING_WEBHOOK":
      return { ...state, status: "step4_webhook" };
    case "WEBHOOK_RECEIVED":
      return { ...state, status: "step4_done", webhookPayload: action.payload };
    case "CONTINUE_PGPARAMS":
      return { ...state, status: "step5_pgparams" };
    case "STEP6_CALLING":
      return { ...state, status: "step6_calling" };
    case "STEP6_DONE":
      return { ...state, status: "step6_done", psqResponse: action.response };
    case "FINISH":
      return { ...state, status: "complete" };
    case "ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "RESET":
      return initialState;
  }
}

// ── Step metadata ──────────────────────────────────────

const STEPS = [
  { num: 1, title: "Select Country", description: "Choose the customer's country to set the currency for this payment. The selected currency determines which payment methods are available." },
  { num: 2, title: "Discover Payment Methods", description: "Call the Payment Methods API to find available gateways for the selected currency. These update automatically when you add or remove gateways in the control panel." },
  { num: 3, title: "Create Payment Session", description: "Call the Checkout API with the discovered pg_codes to create a payment session. You'll get a session_id and checkout_url." },
  { num: 4, title: "Accept Payment", description: "Choose how the customer pays: redirect to the hosted checkout page, or embed the Checkout SDK directly on your site." },
  { num: 5, title: "Webhook Notification", description: "Ottu posts the payment result to your webhook_url. This is the primary way to confirm payment status server-side." },
  { num: 6, title: "Understand pg_params", description: "The webhook payload includes pg_params — normalized gateway response fields that work consistently across all payment gateways." },
  { num: 7, title: "Payment Status Query", description: "As a fallback when webhooks don't arrive, query the payment status directly. The response mirrors the webhook payload." },
];

// ── Helpers ─────────────────────────────────────────────

function getStepStatus(stepNum: number, state: State): "pending" | "active" | "done" {
  const statusMap: Record<Status, number> = {
    idle: 0,
    step0_country: 1,
    step1_calling: 2, step1_done: 2,
    step2_calling: 3, step2_done: 3,
    step3_choose: 4, step3a_redirect: 4, step3b_sdk: 4, step3b_ready: 4, step3b_success: 4,
    step4_webhook: 5, step4_done: 5,
    step5_pgparams: 6,
    step6_calling: 7, step6_done: 7,
    complete: 8, error: 0,
  };
  const activeStep = statusMap[state.status];
  const isCallingThis = (
    (stepNum === 2 && state.status === "step1_calling") ||
    (stepNum === 3 && state.status === "step2_calling") ||
    (stepNum === 7 && state.status === "step6_calling")
  );
  if (stepNum < activeStep) return "done";
  if (stepNum === activeStep || isCallingThis) return "active";
  return "pending";
}

// ── Country Carousel ────────────────────────────────────

function CountryCarousel({ selectedIndex, onSelect, onConfirm }: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}) {
  const total = COUNTRIES.length;
  const wrap = (i: number) => ((i % total) + total) % total;
  const country = COUNTRIES[selectedIndex];

  const visibleOffsets = [-2, -1, 0, 1, 2];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") onSelect(wrap(selectedIndex - 1));
    else if (e.key === "ArrowRight") onSelect(wrap(selectedIndex + 1));
    else if (e.key === "Enter") onConfirm();
  }, [selectedIndex, onSelect, onConfirm]);

  return (
    <div className={styles.countryCarousel} onKeyDown={handleKeyDown} tabIndex={0}>
      <span className={styles.carouselRegion}>{country.region}</span>

      <div className={styles.carouselViewport}>
        <button
          className={styles.carouselArrow}
          onClick={() => onSelect(wrap(selectedIndex - 1))}
          aria-label="Previous country"
        >
          <Icon path={mdiChevronLeft} size={0.9} />
        </button>

        <div className={styles.carouselTrack}>
          {visibleOffsets.map((offset) => {
            const idx = wrap(selectedIndex + offset);
            const c = COUNTRIES[idx];
            const absOffset = Math.abs(offset);
            const scale = offset === 0 ? 1 : absOffset === 1 ? 0.7 : 0.5;
            const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.5 : 0.25;
            const translateX = offset * 90;

            return (
              <div
                key={`${offset}-${idx}`}
                className={styles.carouselItem}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex: 3 - absOffset,
                }}
                onClick={() => offset !== 0 && onSelect(idx)}
              >
                <div className={`${styles.carouselFlag} ${offset === 0 ? styles.carouselFlagActive : ""}`}>
                  {c.flag}
                </div>
                {offset === 0 && (
                  <>
                    <p className={styles.carouselCountryName}>{c.name}</p>
                    <span className={styles.carouselCurrencyBadge}>{c.currency}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <button
          className={styles.carouselArrow}
          onClick={() => onSelect(wrap(selectedIndex + 1))}
          aria-label="Next country"
        >
          <Icon path={mdiChevronRight} size={0.9} />
        </button>
      </div>

      <div className={styles.carouselConfirm}>
        <button className={styles.primaryBtn} onClick={onConfirm}>
          Continue with {country.currency}
        </button>
        <p className={styles.carouselHint}>Use arrows to browse countries</p>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────

export default function PaymentJourneyInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const webhookCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (webhookCheckRef.current) clearInterval(webhookCheckRef.current);
    };
  }, []);

  useEffect(() => {
    setExpandedSteps(new Set());
  }, [state.status]);

  useEffect(() => {
    if (state.status === "idle" || state.status === "error" || state.status === "complete") return;
    const statusMap: Record<string, number> = {
      step0_country: 1,
      step1_calling: 2, step1_done: 2,
      step2_calling: 3, step2_done: 3,
      step3_choose: 4, step3a_redirect: 4, step3b_sdk: 4, step3b_ready: 4, step3b_success: 4,
      step4_webhook: 5, step4_done: 5,
      step5_pgparams: 6,
      step6_calling: 7, step6_done: 7,
    };
    const activeStep = statusMap[state.status] ?? 0;
    if (activeStep === 0) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-step="${activeStep}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [state.status]);

  const toggleStep = useCallback((stepNum: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  }, []);

  const isStepExpanded = (stepNum: number) =>
    getStepStatus(stepNum, state) === "done" && expandedSteps.has(stepNum);

  // ── Step 1: Payment Methods ─────────────────────────

  const runStep1 = useCallback(async () => {
    dispatch({ type: "COUNTRY_CONFIRMED" });
    try {
      const response = await callPaymentMethods({ currencies: [state.selectedCurrency], plugin: "payment_request", operation: "purchase", type: "sandbox", tags: ["demo"] });
      const pgCodes = response?.payment_methods?.map((m: any) => m.code) ?? response?.pg_codes ?? [];
      dispatch({ type: "STEP1_DONE", pgCodes, response });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message });
    }
  }, [state.selectedCurrency]);

  // ── Step 2: Checkout API ────────────────────────────

  const runStep2 = useCallback(async () => {
    dispatch({ type: "STEP2_DONE", sessionId: "", checkoutUrl: "", response: null }); // temp: show loading
    try {
      const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
      const response = await createSandboxSession({
        pg_codes: state.pgCodes.length > 0 ? state.pgCodes : ["direct-payment"],
        currency_code: state.selectedCurrency,
        customer_id: "sandbox",
        extra: {
          include_sdk_setup_preload: true,
          webhook_url: webhookUrl,
        },
      });
      dispatch({ type: "STEP2_DONE", sessionId: response.session_id, checkoutUrl: (response as any).checkout_url ?? "", response });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message });
    }
  }, [state.pgCodes, state.orderId, state.selectedCurrency]);

  // ── Step 6: PSQ ─────────────────────────────────────

  const runStep6 = useCallback(async () => {
    dispatch({ type: "STEP6_CALLING" });
    try {
      const response = await callPaymentStatusQuery(state.sessionId);
      dispatch({ type: "STEP6_DONE", response });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message });
    }
  }, [state.sessionId]);

  // ── SDK Callbacks ──────────────────────────────────

  const sdkCallbacks = useMemo(
    () => createDemoCallbacks(() => dispatch({ type: "PAYMENT_SUCCESS" })),
    [],
  );

  // ── Render helpers ──────────────────────────────────

  const renderNode = (stepNum: number) => {
    const status = getStepStatus(stepNum, state);
    return (
      <div className={`${styles.node} ${status === "active" ? styles.nodeActive : status === "done" ? styles.nodeDone : styles.nodePending}`}>
        {status === "done" ? <Icon path={mdiCheck} size={0.7} /> :
         status === "active" && (state.status.includes("calling")) ? <Icon path={mdiLoading} size={0.7} /> :
         stepNum}
      </div>
    );
  };

  const renderStep = (stepNum: number, content: React.ReactNode) => {
    const status = getStepStatus(stepNum, state);
    const meta = STEPS[stepNum - 1];
    const isActive = status === "active";
    const isDone = status === "done";
    const isExpanded = isDone && expandedSteps.has(stepNum);
    const showBody = isActive || isExpanded;

    return (
      <div className={styles.step} key={stepNum} data-step={stepNum}>
        {renderNode(stepNum)}
        <div className={`${styles.card} ${isActive ? styles.cardActive : isDone ? (isExpanded ? styles.cardDoneExpanded : styles.cardDone) : ""}`}>
          <div
            className={`${styles.cardHeader} ${isDone ? styles.cardHeaderDone : ""}`}
            onClick={isDone ? () => toggleStep(stepNum) : undefined}
          >
            <div>
              <h3 className={`${styles.cardTitle} ${status === "pending" ? styles.cardTitlePending : ""}`}>
                {meta.title}
              </h3>
              {isActive && <p className={styles.cardSubtitle}>Step {stepNum} of 7</p>}
            </div>
            {isDone && (
              <div className={styles.doneRight}>
                <span className={styles.doneBadge}>
                  <Icon path={mdiCheck} size={0.6} /> Done
                </span>
                <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={0.8} className={styles.chevron} />
              </div>
            )}
          </div>
          {showBody && (
            <div className={styles.cardBody}>
              <p className={styles.cardDescription}>{meta.description}</p>
              {content}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── IDLE STATE ──────────────────────────────────────

  if (state.status === "idle") {
    return (
      <div className={styles.hero}>
        <span className={styles.heroTitle}>Payment Integration Journey</span>
        <p className={styles.heroSubtitle}>
          Walk through a complete Ottu payment integration with live API calls.
          Every step runs against our sandbox — no real charges.
        </p>
        <button className={styles.primaryBtn} onClick={() => dispatch({ type: "START" })}>
          Start Journey
        </button>
      </div>
    );
  }

  // ── ERROR STATE ─────────────────────────────────────

  if (state.status === "error") {
    return (
      <div className={styles.errorCard}>
        <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
        <p className={styles.errorMessage}>{state.errorMessage}</p>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "RESET" })}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE STATE ──────────────────────────────────

  if (state.status === "complete") {
    return (
      <>
        <div className={styles.journey}>
          {STEPS.map((_, i) => renderStep(i + 1, null))}
        </div>
        <div className={styles.completeCard}>
          <span className={styles.completeIcon}>&#x1F389;</span>
          <h3 className={styles.completeTitle}>Journey Complete</h3>
          <p className={styles.completeSubtitle}>
            You've walked through the entire Ottu payment integration flow.
          </p>
          <button className={styles.primaryBtn} onClick={() => dispatch({ type: "RESET" })}>
            Restart Journey
          </button>
        </div>
      </>
    );
  }

  // ── JOURNEY TIMELINE ────────────────────────────────

  return (
    <div className={styles.journey}>

      {/* ── Step 1: Country Selector ──────────────── */}
      {renderStep(1, (
        <>
          {(state.status === "step0_country" || isStepExpanded(1)) && (
            <CountryCarousel
              selectedIndex={state.selectedCountryIndex}
              onSelect={(index) => dispatch({ type: "SELECT_COUNTRY", index })}
              onConfirm={runStep1}
            />
          )}
        </>
      ))}

      {/* ── Step 2: Payment Methods ─────────────── */}
      {renderStep(2, (
        <>
          {state.status === "step1_calling" && (
            <div className={styles.actions}>
              <button className={styles.primaryBtn} disabled>
                <span className={styles.spinner} /> Calling Payment Methods API...
              </button>
            </div>
          )}
          {(state.status === "step1_done" || isStepExpanded(2)) && (
            <>
              <ApiPanel label="POST /b/pbl/v2/payment-methods/" data={{
                plugin: "payment_request",
                operation: "purchase",
                currencies: [state.selectedCurrency],
                type: "sandbox",
                tags: ["demo"],
              }} />
              <ApiPanel label="Response — Payment Methods" data={state.paymentMethodsResponse} />
              {state.status === "step1_done" && (
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={() => { dispatch({ type: "STEP2_DONE", sessionId: "", checkoutUrl: "", response: null }); runStep2(); }}>
                    Continue to Step 3
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ))}

      {/* ── Step 3: Checkout API ────────────────── */}
      {renderStep(3, (
        <>
          {state.status === "step2_calling" || (state.status === "step2_done" && !state.sessionId) ? (
            <div className={styles.actions}>
              <button className={styles.primaryBtn} disabled>
                <span className={styles.spinner} /> Creating payment session...
              </button>
            </div>
          ) : (state.status === "step2_done" || isStepExpanded(3)) && state.sessionId ? (
            <>
              <ApiPanel label="POST /b/checkout/v1/pymt-txn/" data={{
                type: "payment_request",
                pg_codes: state.pgCodes,
                amount: "20",
                currency_code: state.selectedCurrency,
                customer_id: "sandbox",
                webhook_url: `${getWebhookBaseUrl()}/webhook/${state.orderId}`,
              }} />
              <ApiPanel label="Response — Session" data={state.checkoutResponse} />
              {state.status === "step2_done" && (
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={() => dispatch({ type: "CHOOSE_PATH" })}>
                    Continue — Choose Payment Method
                  </button>
                </div>
              )}
            </>
          ) : null}
        </>
      ))}

      {/* ── Step 4: Choose Path ─────────────────── */}
      {renderStep(4, (
        <>
          {state.status === "step3_choose" && (
            <div className={styles.pathSelector}>
              <div className={styles.pathCard} onClick={() => dispatch({ type: "SELECT_REDIRECT" })}>
                <span className={styles.pathIcon}>&#x1F517;</span>
                <p className={styles.pathLabel}>Payment Link</p>
                <p className={styles.pathDescription}>Redirect the customer to Ottu's hosted checkout page</p>
              </div>
              <div className={styles.pathCard} onClick={() => dispatch({ type: "SELECT_SDK" })}>
                <span className={styles.pathIcon}>&#x1F4B3;</span>
                <p className={styles.pathLabel}>On-site Checkout SDK</p>
                <p className={styles.pathDescription}>Embed the payment form directly on your website</p>
              </div>
            </div>
          )}

          {state.status === "step3a_redirect" && (
            <>
              <ApiPanel label="checkout_url" data={state.checkoutUrl} />
              <p className={styles.cardDescription}>
                Open the payment link in a new tab, complete the test payment (use card <strong>{TEST_CARD.number}</strong>, expiry <strong>{TEST_CARD.expiry}</strong>, CVV <strong>{TEST_CARD.cvv}</strong>), then come back here to see the webhook.
              </p>
              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={() => {
                  window.open(state.checkoutUrl, "_blank");
                  dispatch({ type: "WAITING_WEBHOOK" });
                }}>
                  Open Payment Link
                </button>
              </div>
            </>
          )}

          {(state.status === "step3b_sdk" || state.status === "step3b_ready") && (
            <>
              <CheckoutSDKEmbed
                sessionId={state.sessionId}
                onReady={() => dispatch({ type: "SDK_READY" })}
                onError={(message) => dispatch({ type: "ERROR", message })}
                callbacks={sdkCallbacks}
              />
              {state.status === "step3b_ready" && (
                <p className={styles.cardDescription} style={{ marginTop: 16 }}>
                  Enter test card <strong>{TEST_CARD.number}</strong>, expiry <strong>{TEST_CARD.expiry}</strong>, CVV <strong>{TEST_CARD.cvv}</strong>. After payment, the webhook will arrive below.
                </p>
              )}
            </>
          )}

          {state.status === "step3b_success" && (
            <div className={styles.successBanner}>
              <span className={styles.successBannerIcon}>
                <Icon path={mdiCheck} size={0.8} />
              </span>
              <h4 className={styles.successBannerTitle}>Payment Complete</h4>
              <p className={styles.successBannerDescription}>
                The checkout flow finished successfully. In a real integration, the
                customer would be redirected to your confirmation page.
              </p>
              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={() => dispatch({ type: "WAITING_WEBHOOK" })}>
                  Continue — Webhook Notification
                </button>
              </div>
            </div>
          )}

          {isStepExpanded(4) && (
            <>
              {state.chosenPath === "redirect" && (
                <ApiPanel label="checkout_url" data={state.checkoutUrl} />
              )}
              <p className={styles.cardDescription}>
                Payment was completed via <strong>{state.chosenPath === "redirect" ? "Payment Link (redirect)" : "On-site Checkout SDK"}</strong>.
              </p>
            </>
          )}
        </>
      ))}

      {/* ── Step 5: Webhook ─────────────────────── */}
      {renderStep(5, (
        <>
          <WebhookViewer orderId={state.orderId} label="Live Webhook Feed" onEvent={(event) => {
            if (!state.webhookPayload) {
              dispatch({ type: "WEBHOOK_RECEIVED", payload: event.payload });
            }
          }} />
          {!state.webhookPayload && !isStepExpanded(5) && (
            <p className={styles.cardDescription} style={{ marginTop: 12 }}>
              Waiting for the payment to complete. Once Ottu processes the payment, the webhook will appear above in real-time.
            </p>
          )}
          {state.webhookPayload && !isStepExpanded(5) && (
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={() => dispatch({ type: "CONTINUE_PGPARAMS" })}>
                Continue — Understand pg_params
              </button>
            </div>
          )}
        </>
      ))}

      {/* ── Step 6: pg_params ──────────────────── */}
      {renderStep(6, (
        <>
          {state.webhookPayload?.pg_params ? (
            <>
              <div className={styles.pgParamsGrid}>
                {[
                  { name: "result", desc: "Normalized transaction result" },
                  { name: "card_number", desc: "Masked card number (PAN)" },
                  { name: "auth_code", desc: "Authorization code from gateway" },
                  { name: "transaction_id", desc: "Gateway transaction identifier" },
                  { name: "rrn", desc: "Retrieval Reference Number" },
                  { name: "decision", desc: "Gateway's final decision" },
                ].filter(f => state.webhookPayload.pg_params[f.name]).map(field => (
                  <div className={styles.pgParam} key={field.name}>
                    <p className={styles.pgParamName}>{field.name}</p>
                    <p className={styles.pgParamValue}>{
                      typeof state.webhookPayload.pg_params[field.name] === 'object'
                        ? state.webhookPayload.pg_params[field.name]?.value ?? JSON.stringify(state.webhookPayload.pg_params[field.name])
                        : String(state.webhookPayload.pg_params[field.name])
                    }</p>
                    <p className={styles.pgParamDescription}>{field.desc}</p>
                  </div>
                ))}
              </div>
              <p className={styles.cardDescription}>
                Use <code>pg_params</code> instead of parsing raw <code>gateway_response</code>. These fields are normalized across all payment gateways — switching gateways requires zero code changes.
              </p>
            </>
          ) : (
            <p className={styles.cardDescription}>
              The <code>pg_params</code> object normalizes gateway responses into consistent fields like <code>card_number</code>, <code>auth_code</code>, <code>result</code>, and <code>rrn</code> — regardless of which gateway processed the payment.
            </p>
          )}
          {!isStepExpanded(6) && (
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={runStep6}>
                Continue — Payment Status Query
              </button>
            </div>
          )}
        </>
      ))}

      {/* ── Step 7: PSQ ────────────────────────── */}
      {renderStep(7, (
        <>
          {state.status === "step6_calling" && (
            <div className={styles.actions}>
              <button className={styles.primaryBtn} disabled>
                <span className={styles.spinner} /> Querying payment status...
              </button>
            </div>
          )}
          {(state.status === "step6_done" || isStepExpanded(7)) && (
            <>
              <ApiPanel label="POST /b/pbl/v2/inquiry/" data={{ session_id: state.sessionId }} />
              <ApiPanel label="Response — Payment Status" data={state.psqResponse} />
              <p className={styles.cardDescription}>
                The PSQ response has the same structure as the webhook payload. Use this as a fallback when webhooks don't arrive.
              </p>
              {state.status === "step6_done" && (
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={() => dispatch({ type: "FINISH" })}>
                    Complete Journey
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ))}
    </div>
  );
}
