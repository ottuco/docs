/**
 * CSPGenerator — interactive Content-Security-Policy builder for the Web Checkout SDK.
 *
 * FOP-to-origins mapping lives in the `FOPS` constant below.
 * When a new Form of Payment is added to the SDK, add an entry here.
 * Cross-check origins against:
 *   - The FOP's official developer documentation (Apple Pay, Google Pay, etc.)
 *   - Network requests logged in DevTools while exercising the payment flow
 *   - docs/developers/payments/checkout-sdk/web.mdx (formsOfPayment list)
 */

import React, { useState, useCallback } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./CSPGenerator.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyDirectives {
  defaultSrc: string[];
  scriptSrc: string[];
  frameSrc: string[];
  connectSrc: string[];
  imgSrc: string[];
  styleSrc: string[];
  fontSrc: string[];
}

interface FOPNote {
  type: "info" | "warning";
  text: string;
  linkText?: string;
  linkHref?: string;
}

interface FOPDefinition {
  id: string;
  label: string;
  badge: string;
  logoSrc: string;
  logoAlt: string;
  additions: Partial<PolicyDirectives>;
  notes: FOPNote[];
}

type Env = "sandbox" | "production";

// ─── Base policies ────────────────────────────────────────────────────────────

const BASE: Record<Env, PolicyDirectives> = {
  sandbox: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'", "https://assets.ottu.net"],
    frameSrc:   ["'self'", "https://sandbox.ottu.net"],
    connectSrc: ["'self'", "https://sandbox.ottu.net"],
    imgSrc:     ["'self'", "https://assets.ottu.net", "data:", "blob:"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    fontSrc:    ["'self'", "data:"],
  },
  production: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'", "https://assets.ottu.net"],
    frameSrc:   ["'self'", "https://*.ottu.net", "https://*.ottu.com"],
    connectSrc: ["'self'", "https://*.ottu.net", "https://*.ottu.com"],
    imgSrc:     ["'self'", "https://assets.ottu.net", "data:", "blob:"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    fontSrc:    ["'self'", "data:"],
  },
};

// ─── FOP definitions ─────────────────────────────────────────────────────────

const FOPS: FOPDefinition[] = [
  {
    id:      "apple_pay",
    label:   "Apple Pay",
    badge:   "os-apple",
    logoSrc: "/img/developers/APPLE.svg",
    logoAlt: "Apple Pay",
    additions: {
      scriptSrc: ["https://applepay.cdn-apple.com"],
      connectSrc: [
        "https://apple-pay-gateway.apple.com",
        "https://cn-apple-pay-gateway.apple.com",
      ],
    },
    notes: [
      {
        type: "warning",
        text: "Your domain must be registered with Apple and verified via domain association files before Apple Pay will function. The SDK handles merchant validation automatically.",
        linkText: "Apple Pay setup",
        linkHref: "#apple-pay",
      },
    ],
  },
  {
    id:      "onsite_credit_card",
    label:   "Credit Card",
    badge:   "onsite_ottu_pg",
    logoSrc: "/img/developers/MASTERCARD.svg",
    logoAlt: "Mastercard",
    additions: {},
    notes: [
      {
        type: "info",
        text: "The onsite card form renders inside a PCI-compliant iframe hosted by Ottu. All required origins are already covered by the base Ottu entries — no extra CSP directives needed.",
        linkText: "Onsite Checkout docs",
        linkHref: "#onsite-checkout",
      },
    ],
  },
];

// ─── Policy helpers ───────────────────────────────────────────────────────────

function mergeUniq(...arrays: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const arr of arrays) {
    for (const item of arr) {
      if (!seen.has(item)) { seen.add(item); result.push(item); }
    }
  }
  return result;
}

function buildPolicy(env: Env, selectedIds: Set<string>): PolicyDirectives {
  const base = BASE[env];
  const p: PolicyDirectives = {
    defaultSrc: [...base.defaultSrc],
    scriptSrc:  [...base.scriptSrc],
    frameSrc:   [...base.frameSrc],
    connectSrc: [...base.connectSrc],
    imgSrc:     [...base.imgSrc],
    styleSrc:   [...base.styleSrc],
    fontSrc:    [...base.fontSrc],
  };
  for (const fop of FOPS) {
    if (!selectedIds.has(fop.id)) continue;
    const { additions } = fop;
    if (additions.scriptSrc)  p.scriptSrc  = mergeUniq(p.scriptSrc,  additions.scriptSrc);
    if (additions.frameSrc)   p.frameSrc   = mergeUniq(p.frameSrc,   additions.frameSrc);
    if (additions.connectSrc) p.connectSrc = mergeUniq(p.connectSrc, additions.connectSrc);
    if (additions.imgSrc)     p.imgSrc     = mergeUniq(p.imgSrc,     additions.imgSrc);
    if (additions.styleSrc)   p.styleSrc   = mergeUniq(p.styleSrc,   additions.styleSrc);
    if (additions.fontSrc)    p.fontSrc    = mergeUniq(p.fontSrc,    additions.fontSrc);
  }
  return p;
}

function policyToHeaderValue(p: PolicyDirectives): string {
  return [
    `default-src ${p.defaultSrc.join(" ")}`,
    `script-src ${p.scriptSrc.join(" ")}`,
    `frame-src ${p.frameSrc.join(" ")}`,
    `connect-src ${p.connectSrc.join(" ")}`,
    `img-src ${p.imgSrc.join(" ")}`,
    `style-src ${p.styleSrc.join(" ")}`,
    `font-src ${p.fontSrc.join(" ")}`,
  ].join(";\n") + ";";
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

// ─── Payment method row ───────────────────────────────────────────────────────

interface MethodRowProps {
  fop: FOPDefinition;
  checked: boolean;
  onToggle: () => void;
}

function MethodRow({ fop, checked, onToggle }: MethodRowProps) {
  const logoSrc = useBaseUrl(fop.logoSrc);

  return (
    <div className={`${styles.methodRow} ${checked ? styles.methodRowSelected : ""}`}>
      <button className={styles.methodHeader} onClick={onToggle} aria-pressed={checked}>
        {/* Checkbox */}
        <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ""}`}>
          {checked && <CheckIcon />}
        </span>
        <span className={styles.methodLabel}>{fop.label}</span>
        <img src={logoSrc} alt={fop.logoAlt} className={styles.methodLogo} draggable={false} />
      </button>

      {/* Inline card fields — only for credit card when checked */}
      {checked && fop.id === "onsite_credit_card" && (
        <div className={styles.cardFields}>
          <div className={styles.cardFieldIcon}><CardIcon /></div>
          <div className={styles.cardFieldNumber}>
            <span className={styles.cardFieldPlaceholder}>Number</span>
          </div>
          <div className={styles.cardFieldDivider} />
          <div className={styles.cardFieldExpiry}>
            <span className={styles.cardFieldPlaceholder}>MM/YY</span>
          </div>
          <div className={styles.cardFieldDivider} />
          <div className={styles.cardFieldCvv}>
            <span className={styles.cardFieldPlaceholder}>CVV</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function CSPGenerator() {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>Loading CSP generator…</div>}>
      {() => <CSPGeneratorInner />}
    </BrowserOnly>
  );
}

function CSPGeneratorInner() {
  const [env, setEnv]       = useState<Env>("production");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["apple_pay"])
  );
  const [copied, setCopied] = useState(false);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const policy = buildPolicy(env, selected);
  const output = policyToHeaderValue(policy);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, [output]);

  const activeNotes = FOPS.filter((f) => selected.has(f.id)).flatMap((f) => f.notes);

  return (
    <div className={styles.generator}>

      {/* ── Environment toggle — full width ───────────────── */}
      <div className={styles.envRow}>
        <span className={styles.envLabel}>Environment</span>
        <div className={styles.envToggle} role="group" aria-label="Environment">
          {(["sandbox", "production"] as Env[]).map((e) => (
            <button
              key={e}
              className={`${styles.envBtn} ${env === e ? styles.envBtnActive : ""}`}
              onClick={() => setEnv(e)}
              aria-pressed={env === e}
            >
              {e === "sandbox" ? "Sandbox" : "Production"}
            </button>
          ))}
        </div>
        <span className={styles.envHint}>
          {env === "sandbox"
            ? <><code>sandbox.ottu.net</code> — tighter scope for testing</>
            : <><code>*.ottu.net</code> wildcard — covers all Ottu payment pages</>}
        </span>
      </div>

      {/* ── Two-column body ───────────────────────────────── */}
      <div className={styles.twoCol}>

        {/* Left: Step 1 — FOP selector */}
        <div className={styles.colLeft}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>1</span>
            <span className={styles.stepTitle}>Select your Form of Payment</span>
          </div>
          <p className={styles.stepHint}>
            Base Ottu SDK entries are always included. Pick the payment method
            you're enabling to add its specific origins.
          </p>

          <div className={styles.methodList}>
            {FOPS.map((fop) => (
              <MethodRow
                key={fop.id}
                fop={fop}
                checked={selected.has(fop.id)}
                onToggle={() => toggle(fop.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Step 2 — policy output */}
        <div className={styles.colRight}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>2</span>
            <span className={styles.stepTitle}>Copy your policy</span>
          </div>

          <div className={styles.outputBox}>
            <pre className={styles.outputPre}>{output}</pre>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
              onClick={copy}
              aria-label="Copy policy to clipboard"
            >
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          </div>

          <p className={styles.outputHint}>
            Set as the <code>Content-Security-Policy</code> HTTP response header
            on every page that loads the Checkout SDK.
          </p>
        </div>
      </div>

      {/* ── Notes — full width ────────────────────────────── */}
      {activeNotes.length > 0 && (
        <div className={styles.notes}>
          {activeNotes.map((note, i) => (
            <div key={i} className={`${styles.note} ${note.type === "warning" ? styles.noteWarn : styles.noteInfo}`}>
              <span className={styles.noteIcon}>{note.type === "warning" ? "⚠" : "ℹ"}</span>
              <span>
                {note.text}
                {note.linkText && note.linkHref && <>{" — "}<a href={note.linkHref}>{note.linkText}</a></>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Disclaimer — full width ───────────────────────── */}
      <div className={styles.disclaimer}>
        <strong>Starting point, not a guarantee.</strong> This generator covers known Ottu SDK and payment-gateway origins. Your application may load additional third-party resources (analytics, fonts, chat widgets) that need their own entries. Always test with <code>Content-Security-Policy-Report-Only</code> before enforcing in production.
      </div>
    </div>
  );
}
