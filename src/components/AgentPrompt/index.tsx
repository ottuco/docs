// A ready prompt the reader copies into their coding agent (Claude Code,
// Cursor, Copilot), with the prompt itself one click away to read first.
//
// Usage in MDX:
//   import AgentPrompt from "@site/src/components/AgentPrompt";
//   <AgentPrompt topic="webhooks" />
//   <AgentPrompt topic="webhooks" compact />   one slim row: label, Copy prompt, View prompt
import React, { useState } from "react";
import Icon from "@mdi/react";
import { mdiRobotOutline } from "@mdi/js";
import { WEBHOOKS_PROMPT } from "./prompts/webhooks";
import { AUTOPAY_PROMPT } from "./prompts/autopay";
import styles from "./styles.module.css";

const PROMPTS = {
  webhooks: {
    title: "Building with a coding agent?",
    text: "Copy a ready prompt that tells Claude Code, Cursor or Copilot how to build your Ottu webhook receiver: signature check, de-duplication, every event, and tests.",
    prompt: WEBHOOKS_PROMPT,
  },
  autopay: {
    title: "Building with a coding agent?",
    text: "Copy a ready prompt that tells Claude Code, Cursor or Copilot how to build your AutoPay integration: create, access from status, events, cancel, and tests.",
    prompt: AUTOPAY_PROMPT,
  },
} as const;

export default function AgentPrompt({
  topic,
  compact = false,
}: {
  topic: keyof typeof PROMPTS;
  /** One slim row (label, Copy prompt, View prompt) instead of the box. */
  compact?: boolean;
}): React.JSX.Element {
  const { title, text, prompt } = PROMPTS[topic];
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  if (compact) {
    return (
      <div className={styles.compact}>
        <div className={styles.row}>
          <Icon path={mdiRobotOutline} size={0.75} className={styles.rowIcon} />
          <span className={styles.rowLabel}>{title}</span>
          <button type="button" className={styles.rowButton} onClick={copy}>
            {copied ? "Copied" : "Copy prompt"}
          </button>
          <button
            type="button"
            className={styles.rowButton}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "Hide prompt" : "View prompt"}
          </button>
        </div>
        {open && <pre className={styles.rowPrompt}>{prompt}</pre>}
      </div>
    );
  }
  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">🤖</span>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.text}>{text}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? "Copied ✓" : "Copy prompt"}
        </button>
      </div>
      <details className={styles.preview}>
        <summary>See the prompt</summary>
        <pre>{prompt}</pre>
      </details>
    </div>
  );
}
