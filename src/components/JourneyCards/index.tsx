import React, {type ReactNode} from "react";
import styles from "./styles.module.css";

export interface JourneyCard {
  title: string;
  body: ReactNode;
  /** Rendered after the bold "Your part:" label. The value "Nothing" is styled blue. */
  yourPart: ReactNode;
  href: string;
}

export interface JourneyCardsProps {
  steps: JourneyCard[];
  band: JourneyCard;
}

function Card({card, num}: {card: JourneyCard; num?: number}) {
  const nothing = card.yourPart === "Nothing";
  return (
    <>
      <h3 className={styles.title}>
        {num !== undefined && (
          <span className={styles.num} aria-hidden="true">
            {num}
          </span>
        )}
        {card.title}
      </h3>
      <p className={styles.body}>{card.body}</p>
      <hr className={styles.divider} />
      <p className={styles.part}>
        <strong>Your part:</strong>{" "}
        {nothing ? <strong className={styles.nothing}>Nothing</strong> : card.yourPart}
      </p>
      <a className={styles.link} href={card.href}>
        Learn more →
      </a>
    </>
  );
}

export default function JourneyCards({steps, band}: JourneyCardsProps) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.title} className={styles.card}>
            <Card card={s} num={i + 1} />
          </li>
        ))}
      </ol>
      <section className={`${styles.card} ${styles.band}`} aria-label="Always available">
        <p className={styles.eyebrow}>Always available</p>
        <Card card={band} />
      </section>
    </div>
  );
}
