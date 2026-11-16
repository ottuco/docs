// A ready prompt the reader copies into their coding agent (Claude Code,
// Cursor, Copilot), with the prompt itself one click away to read first.
//
// Usage in MDX:
//   import AgentPrompt from "@site/src/components/AgentPrompt";
//   <AgentPrompt topic="webhooks" />
import React, { useState } from "react";
import { WEBHOOKS_PROMPT } from "./prompts/webhooks";
import styles from "./styles.module.css";

const PROMPTS = {
  webhooks: {
    title: "Building with a coding agent?",
    text: "Copy a ready prompt that tells Claude Code, Cursor or Copilot how to build your Ottu webhook receiver: signature check, de-duplication, every event, and tests.",
    prompt: WEBHOOKS_PROMPT,
  },
} as const;

export default function AgentPrompt({ topic }: { topic: keyof typeof PROMPTS }): React.JSX.Element {
  const { title, text, prompt } = PROMPTS[topic];
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
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
