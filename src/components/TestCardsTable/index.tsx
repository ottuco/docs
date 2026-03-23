import React from "react";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway } from "@site/src/types/gateway";
import styles from "./styles.module.css";

const gatewayMap = new Map(
  (gatewaysData as Gateway[]).map((gw) => [gw.slug, gw])
);

function copyToClipboard(text: string) {
  const clean = text.replace(/\s/g, "");
  navigator.clipboard?.writeText(clean).catch(() => {});
}

interface TestCardsTableProps {
  gateway: string;
}

export default function TestCardsTable({
  gateway,
}: TestCardsTableProps): React.JSX.Element | null {
  const gw = gatewayMap.get(gateway);
  if (!gw) return null;
  if (gw.testCards.length === 0 && !gw.testCardNotes) return null;

  const hasNote = gw.testCards.some((c) => c.note);

  return (
    <div className={styles.section}>
      {gw.testCardNotes && (
        <div className={styles.notes}>{gw.testCardNotes}</div>
      )}

      {gw.testCards.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Card Number</th>
              <th>Expiry</th>
              <th>CVV / PIN</th>
              <th>Brand</th>
              <th>Status</th>
              {hasNote && <th>Note</th>}
            </tr>
          </thead>
          <tbody>
            {gw.testCards.map((card, i) => (
              <tr key={i}>
                <td>
                  <span
                    className={styles.cardNumber}
                    onClick={() => copyToClipboard(card.cardNumber)}
                    title="Click to copy"
                  >
                    {card.cardNumber}
                  </span>
                </td>
                <td className={styles.mono}>{card.expiry}</td>
                <td className={styles.mono}>{card.cvv}</td>
                <td>{card.brand}</td>
                <td>
                  <span
                    className={
                      card.status === "success"
                        ? "badge-success"
                        : "badge-declined"
                    }
                  >
                    {card.statusLabel}
                  </span>
                </td>
                {hasNote && <td>{card.note ?? ""}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {gw.docsUrl && (
        <a
          href={gw.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.docsLink}
        >
          View official documentation ↗
        </a>
      )}
    </div>
  );
}
