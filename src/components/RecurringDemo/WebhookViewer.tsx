import React, { useEffect, useState, useRef } from "react";
import { getWebhookRelayUrl } from "@site/src/utils/sandbox";
import styles from "./styles.module.css";

interface WebhookEvent {
  payload: any;
  receivedAt: string;
}

interface WebhookViewerProps {
  orderId: string;
  label?: string;
  onEvent?: (event: WebhookEvent) => void;
}

const POLL_INTERVAL_MS = 1500;

export default function WebhookViewer({ orderId, label, onEvent }: WebhookViewerProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "reconnecting">("connecting");
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!orderId) return;

    const url = `${getWebhookRelayUrl()}/webhook/${orderId}/events.json`;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cursor = -1;
    let hasSucceeded = false;

    const poll = async () => {
      try {
        const res = await fetch(`${url}?since=${cursor}`, { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { events: Array<WebhookEvent & { id: number }>; lastId: number } = await res.json();
        if (cancelled) return;
        if (data.events.length > 0) {
          setEvents((prev) => [...prev, ...data.events]);
          data.events.forEach((e) => onEventRef.current?.(e));
          cursor = data.lastId;
        }
        hasSucceeded = true;
        setStatus("connected");
      } catch {
        if (cancelled) return;
        setStatus(hasSucceeded ? "reconnecting" : "connecting");
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };
    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  return (
    <div className={styles.webhookViewer}>
      <div className={styles.webhookHeader}>
        <span className={styles.webhookTitle}>
          {label || "Webhook Notifications"}
        </span>
        <span
          className={`${styles.webhookStatus} ${status === "connected" ? styles.webhookConnected : ""}`}
        >
          <span className={styles.webhookDot} />
          {status === "connected"
            ? events.length > 0
              ? "Received"
              : "Listening..."
            : status === "reconnecting"
              ? "Reconnecting..."
              : "Connecting..."}
        </span>
      </div>
      <div className={styles.webhookBody}>
        {events.length === 0 && (
          <div className={styles.webhookEmpty}>
            Waiting for webhook notifications...
          </div>
        )}
        {events.map((event, i) => (
          <div key={i} className={styles.webhookEvent}>
            <div className={styles.webhookEventHeader}>
              <span className={styles.webhookTimestamp}>
                {new Date(event.receivedAt).toLocaleTimeString()}
              </span>
            </div>
            <pre className={styles.webhookPayload}>
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Extract the token string from a CIT webhook payload */
export function extractTokenFromWebhook(events: WebhookEvent[]): string | null {
  for (const event of events) {
    const p = event.payload;
    if (p?.token?.token) return p.token.token;
    if (p?.token && typeof p.token === "string") return p.token;
  }
  return null;
}
