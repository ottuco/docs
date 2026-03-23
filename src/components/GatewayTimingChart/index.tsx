import React from "react";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway } from "@site/src/types/gateway";
import styles from "./styles.module.css";

const gateways = gatewaysData as Gateway[];
const MAX_MINUTES = 60;

function getTierClass(minutes: number): string {
  if (minutes <= 8) return styles.tierFast;
  if (minutes <= 11) return styles.tierStandard;
  if (minutes <= 20) return styles.tierModerate;
  return styles.tierSlow;
}

interface Tier {
  minutes: number;
  gateways: string[];
  className: string;
}

// Derive tiers from gateways.json
const tiers: Tier[] = (() => {
  const grouped = new Map<number, string[]>();
  for (const gw of gateways) {
    if (gw.inquiryMinutes && gw.inquiryMinutes > 0) {
      const names = grouped.get(gw.inquiryMinutes) ?? [];
      names.push(gw.name);
      grouped.set(gw.inquiryMinutes, names);
    }
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([minutes, names]) => ({
      minutes,
      gateways: names.sort(),
      className: getTierClass(minutes),
    }));
})();

// Gateways with inquiryMinutes === 0 → no inquiry support
const noInquiry = gateways
  .filter((gw) => gw.inquiryMinutes === 0)
  .map((gw) => gw.name)
  .sort();

export default function GatewayTimingChart(): React.JSX.Element {
  return (
    <div className={styles.chart}>
      {tiers.map((tier) => {
        const barWidth = Math.max(20, (tier.minutes / MAX_MINUTES) * 100);
        return (
          <div key={tier.minutes} className={`${styles.tier} ${tier.className}`}>
            <div className={styles.minutes}>
              <span className={styles.minutesValue}>{tier.minutes}</span>
              <span className={styles.minutesUnit}>min</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.bar} style={{ width: `${barWidth}%` }}>
                {tier.gateways.map((gw) => (
                  <span key={gw} className={styles.gateway}>{gw}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className={styles.callout}>
        <span className={styles.calloutIcon}>&#x26A0;&#xFE0F;</span>
        <div>
          <strong>Add 2-3 minutes margin</strong> to these values when scheduling your PSQ call. If you integrate with multiple gateways, use the longest time + margin as your standard. Calling too early means the gateway may not have finalized the status yet.
        </div>
      </div>

      {noInquiry.length > 0 && (
        <div className={styles.noInquiry}>
          <p className={styles.noInquiryLabel}>No inquiry support — handled by Ottu automatically</p>
          <div className={styles.noInquiryGateways}>
            {noInquiry.map((gw) => (
              <span key={gw} className={styles.noInquiryPill}>{gw}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
