// Ottu-Signature v2 in the browser, for a developer wiring up a receiver:
//   Sign    a body with a key, and see the exact header Ottu would send;
//   Check   a header Ottu sent against a body and a key, step by step, so the
//           failing step is named (missing part, stale t, wrong key or body);
//   Send    a ready curl that posts that signed body to the developer's own URL,
//           to test a local receiver with no Ottu account involved.
// Everything runs in the page with Web Crypto: the key never leaves the browser.
//
// Usage in MDX: <SignatureLab />
import React, { useEffect, useMemo, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import paid from "@site/src/components/EventObject/examples/payment.paid.json";
import styles from "./styles.module.css";

const TOLERANCE_SECONDS = 300;
// The published test vector (verify-signatures, Test vectors).
const VECTOR = {
  key: "pu9MpX3yPR",
  t: "1792417440",
  body: '{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}',
  header: "t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e",
};

/** Why HMAC cannot run here, or null when it can: Web Crypto needs a secure context, and HMAC a non-empty key. */
function cannotSign(key: string): string | null {
  if (typeof crypto === "undefined" || !crypto.subtle) return "Your browser blocks Web Crypto on this page (it needs HTTPS or localhost).";
  if (!key) return "Enter the HMAC key.";
  return null;
}

/** Quote a value for a single-quoted shell argument. */
const shellQuote = (value: string) => value.replace(/'/g, "'\\''");

async function hmacHex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseHeader(header: string): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const part of header.split(",")) {
    const at = part.indexOf("=");
    if (at > 0) parts[part.slice(0, at).trim()] = part.slice(at + 1).trim();
  }
  return parts;
}

type Step = { ok: boolean; text: string };

async function check(header: string, body: string, key: string, now: number): Promise<Step[]> {
  const steps: Step[] = [];
  if (!header.trim()) return [{ ok: false, text: "No header: paste the Ottu-Signature value." }];
  const parts = parseHeader(header);
  if (!parts.t || !parts.v2) {
    return [{ ok: false, text: `The header needs both t and v2; found ${Object.keys(parts).join(", ") || "nothing"}. Every webhook format sends t=…,v2=….` }];
  }
  if (!/^\d+$/.test(parts.t)) return [{ ok: false, text: `t is "${parts.t}", not a Unix time in seconds. A receiver rejects it.` }];
  steps.push({ ok: true, text: `Read t = ${parts.t} and v2 by name.` });
  const problem = cannotSign(key);
  if (problem) return [...steps, { ok: false, text: problem }];
  const age = Math.abs(now - Number(parts.t));
  steps.push(
    age <= TOLERANCE_SECONDS
      ? { ok: true, text: `t is ${Math.round(age)} s from your clock (limit ${TOLERANCE_SECONDS} s).` }
      : { ok: false, text: `t is ${Math.round(age)} s from your clock, over the ${TOLERANCE_SECONDS} s limit: a receiver rejects it as a replay. (Untick "use my clock" to check an old header, such as the test vector.)` },
  );
  const expected = await hmacHex(key, `${parts.t}.${body}`);
  // Compared exactly, as the published verifiers do: Ottu sends lowercase hex.
  if (parts.v2 !== parts.v2.toLowerCase()) {
    steps.push({ ok: false, text: "v2 has uppercase letters. Ottu sends lowercase hex, and the reference verifiers compare it exactly." });
    return steps;
  }
  steps.push(
    expected === parts.v2
      ? { ok: true, text: "HMAC-SHA256(key, t + \".\" + body) matches v2. The signature is valid." }
      : {
          ok: false,
          text: `HMAC-SHA256(key, t + "." + body) is ${expected}, not the v2 sent. Either the key is not this account's HMAC key, or the body is not the exact bytes Ottu sent (parsed and re-encoded, trimmed, or a different charset).`,
        },
  );
  return steps;
}

function Lab(): React.JSX.Element {
  const [mode, setMode] = useState<"sign" | "check">("sign");
  const [key, setKey] = useState(VECTOR.key);
  // Pretty-printed so the curl reads well. The signature is over these exact
  // bytes, so it stays valid; Ottu itself sends the body compact.
  const [body, setBody] = useState(JSON.stringify(paid, null, 2));
  const [t, setT] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [header, setHeader] = useState(VECTOR.header);
  const [useClock, setUseClock] = useState(true);
  const [url, setUrl] = useState("http://localhost:8000/webhooks/ottu");
  const [signature, setSignature] = useState("");
  const [signError, setSignError] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  // Each effect ignores a result that arrives after its inputs changed, so a slow HMAC never overwrites a newer one.
  useEffect(() => {
    if (mode !== "sign") return;
    let current = true;
    const problem = cannotSign(key);
    if (problem) {
      setSignature("");
      setSignError(problem);
      return;
    }
    hmacHex(key, `${t}.${body}`)
      .then((value) => current && (setSignature(value), setSignError("")))
      .catch((error: Error) => current && (setSignature(""), setSignError(error.message)));
    return () => {
      current = false;
    };
  }, [mode, key, t, body]);

  useEffect(() => {
    if (mode !== "check") return;
    let current = true;
    const now = useClock ? Date.now() / 1000 : Number(parseHeader(header).t ?? 0);
    check(header, body, key, now)
      .then((result) => current && setSteps(result))
      .catch((error: Error) => current && setSteps([{ ok: false, text: error.message }]));
    return () => {
      current = false;
    };
  }, [mode, header, body, key, useClock]);

  const signedHeader = `t=${t},v2=${signature}`;
  const curl = useMemo(() => {
    const quoted = shellQuote(body);
    const id = (() => {
      try {
        return (JSON.parse(body) as { id?: string }).id ?? "";
      } catch {
        return "";
      }
    })();
    return [
      `curl -i -X POST '${shellQuote(url)}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -H 'Ottu-Signature: ${signedHeader}' \\`,
      ...(id ? [`  -H 'Idempotency-Key: ${shellQuote(String(id))}' \\`] : []),
      `  --data-binary '${quoted}'`,
    ].join("\n");
  }, [url, signedHeader, body]);

  const loadVector = () => {
    setKey(VECTOR.key);
    setBody(VECTOR.body);
    setT(VECTOR.t);
    setHeader(VECTOR.header);
    setUseClock(false);
  };

  return (
    <div className={styles.lab}>
      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={mode === "sign"} className={mode === "sign" ? styles.active : ""} onClick={() => setMode("sign")}>
          Sign a body
        </button>
        <button type="button" role="tab" aria-selected={mode === "check"} className={mode === "check" ? styles.active : ""} onClick={() => setMode("check")}>
          Check a header
        </button>
        <button type="button" className={styles.vector} onClick={loadVector}>
          Load the test vector
        </button>
      </div>

      <label className={styles.label}>
        HMAC key <span className={styles.hint}>stays in your browser</span>
        <input className={styles.input} value={key} onChange={(event) => setKey(event.target.value)} spellCheck={false} />
      </label>
      <label className={styles.label}>
        Raw body <span className={styles.hint}>the exact bytes, not re-formatted</span>
        <textarea className={styles.textarea} value={body} onChange={(event) => setBody(event.target.value)} spellCheck={false} rows={8} />
      </label>

      {mode === "sign" ? (
        <>
          <label className={styles.label}>
            t <span className={styles.hint}>Unix seconds</span>
            <span className={styles.row}>
              <input className={styles.input} value={t} onChange={(event) => setT(event.target.value.replace(/\D/g, ""))} />
              <button type="button" className={styles.small} onClick={() => setT(String(Math.floor(Date.now() / 1000)))}>
                Now
              </button>
            </span>
          </label>
          <p className={styles.label}>Ottu-Signature</p>
          {signError ? <p className={`${styles.steps} ${styles.fail}`}>{signError}</p> : <pre className={styles.out}>{signedHeader}</pre>}
          <label className={styles.label}>
            Your receiver's URL <span className={styles.hint}>to test it with a signed request</span>
            <input className={styles.input} value={url} onChange={(event) => setUrl(event.target.value)} spellCheck={false} />
          </label>
          <div className={styles.row}>
            <p className={styles.label}>curl</p>
            <button type="button" className={styles.small} onClick={() => navigator.clipboard?.writeText(curl).catch(() => {})}>
              Copy
            </button>
          </div>
          <pre className={`${styles.out} ${styles.curl}`}>{curl}</pre>
          <p className={styles.note}>
            The body is pretty-printed here to read easily, and the signature is computed over exactly these bytes. Ottu sends it compact; your receiver must not care either way, because it verifies the raw bytes it got.
          </p>
          <p className={styles.note}>
            Your receiver should answer 2xx. Send it again: the same id must not be processed twice. Change one character of the body: it must answer 401.
          </p>
        </>
      ) : (
        <>
          <label className={styles.label}>
            Ottu-Signature header
            <input className={styles.input} value={header} onChange={(event) => setHeader(event.target.value)} spellCheck={false} />
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={useClock} onChange={(event) => setUseClock(event.target.checked)} /> use my clock for the {TOLERANCE_SECONDS} s check
          </label>
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.text} className={step.ok ? styles.ok : styles.fail}>
                {step.ok ? "✓" : "✗"} {step.text}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export default function SignatureLab(): React.JSX.Element {
  return <BrowserOnly fallback={<p>The signature lab runs in your browser.</p>}>{() => <Lab />}</BrowserOnly>;
}
