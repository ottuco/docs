import React from "react";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway, TestCard } from "@site/src/types/gateway";
import styles from "./styles.module.css";

const gatewayMap = new Map(
  (gatewaysData as Gateway[]).map((gw) => [gw.slug, gw])
);

function copyToClipboard(text: string) {
  const clean = text.replace(/\s/g, "");
  navigator.clipboard?.writeText(clean).catch(() => {});
}

function LinkIcon() {
  return (
    <svg
      className={styles.headingLinkIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.06 10.94a5.74 5.74 0 0 0-8.12 0l-1.71 1.72a5.75 5.75 0 0 0 8.12 8.12l.88-.88"
        stroke="#6b7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.94 13.06a5.74 5.74 0 0 0 8.12 0l1.71-1.72a5.75 5.75 0 0 0-8.12-8.12l-.88.88"
        stroke="#6b7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Inline component for use inside MDX headings: renders link icon + gateway logo */
export function GatewayBadge({ gateway, logo }: { gateway?: string; logo?: string }): React.JSX.Element | null {
  const gw = gateway ? gatewayMap.get(gateway) : null;
  const logoSrc = gw?.logo ? `/img/gateways/${gw.logo}` : logo ?? null;

  return (
    <span className={styles.headingBadge}>
      <LinkIcon />
      {logoSrc && (
        <img
          src={logoSrc}
          alt=""
          className={styles.headingLogo}
        />
      )}
    </span>
  );
}

interface TestCardsTableProps {
  /** Look up cards from the shared gateway catalog by slug. */
  gateway?: string;
  /** Or pass an explicit card set (e.g. the Ottu Sandbox cards) to reuse this UI without a catalog entry. */
  cards?: TestCard[];
  /** Optional note rendered above the table. */
  notes?: string;
}

export default function TestCardsTable({
  gateway,
  cards,
  notes,
}: TestCardsTableProps): React.JSX.Element | null {
  const gw = gateway ? gatewayMap.get(gateway) : undefined;
  const testCards = cards ?? gw?.testCards ?? [];
  const testCardNotes = notes ?? gw?.testCardNotes;
  const docsUrl = gw?.docsUrl;

  if (testCards.length === 0 && !testCardNotes) return null;

  const hasNote = testCards.some((c) => c.note);

  return (
    <div className={styles.section}>
      {testCardNotes && (
        <div className={styles.notes}>{testCardNotes}</div>
      )}

      {testCards.length > 0 && (
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
            {testCards.map((card, i) => (
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

      {docsUrl && (
        <a
          href={docsUrl}
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
