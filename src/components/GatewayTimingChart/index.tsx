import React from "react";
import styles from "./styles.module.css";

const MAX_MINUTES = 31;

interface Tier {
  minutes: number;
  gateways: string[];
  className: string;
}

const TIERS: Tier[] = [
  { minutes: 6, gateways: ["Amazon Pay"], className: styles.tierFast },
  { minutes: 8, gateways: ["AlRajhi", "Benefit", "Benefit Pay", "Bookey", "CBK", "FSS", "KNET", "MyFatoorah", "nGenius", "OmanNet", "STC Pay", "Tamara"], className: styles.tierFast },
  { minutes: 10, gateways: ["Hesabe", "NBO"], className: styles.tierStandard },
  { minutes: 11, gateways: ["MPGS"], className: styles.tierStandard },
  { minutes: 15, gateways: ["PayU India"], className: styles.tierModerate },
  { minutes: 16, gateways: ["SmartPay"], className: styles.tierModerate },
  { minutes: 20, gateways: ["QPay"], className: styles.tierModerate },
  { minutes: 28, gateways: ["Beyon Money"], className: styles.tierSlow },
  { minutes: 30, gateways: ["Tabby"], className: styles.tierSlow },
  { minutes: 31, gateways: ["HyperPay"], className: styles.tierSlow },
];

const NO_INQUIRY = ["Bambora", "CCAvenue", "Cybersource", "MiGS", "PayPal", "UPG"];

export default function GatewayTimingChart(): React.JSX.Element {
  return (
    <div className={styles.chart}>
      {TIERS.map((tier) => {
        const barWidth = Math.max(20, (tier.minutes / MAX_MINUTES) * 100);
        return (
          <div key={tier.minutes} className={`${styles.tier} ${tier.className}`}>
            <div className={styles.minutes}>
              <span className={styles.minutesValue}>{tier.minutes}</span>
              <span className={styles.minutesUnit}>min</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{ width: `${barWidth}%` }}
              >
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

      <div className={styles.noInquiry}>
        <p className={styles.noInquiryLabel}>No inquiry support — handled by Ottu automatically</p>
        <div className={styles.noInquiryGateways}>
          {NO_INQUIRY.map((gw) => (
            <span key={gw} className={styles.noInquiryPill}>{gw}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
