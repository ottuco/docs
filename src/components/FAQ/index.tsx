import React, { useState } from "react";
import styles from "./styles.module.css";

function parseQuestion(text: string): React.ReactNode {
  // Split on **bold** and `code` spans, preserving delimiters via capture groups
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  if (tokens.length === 1) return text;
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={i}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={i}>{token.slice(1, -1)}</code>;
    }
    return token;
  });
}

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.item} ${open ? styles.open : ""}`}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={styles.question}>{parseQuestion(question)}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      {open && <div className={styles.answer}>{children}</div>}
    </div>
  );
}

interface FAQProps {
  children: React.ReactNode;
}

export default function FAQ({ children }: FAQProps) {
  return <div className={styles.faq}>{children}</div>;
}
