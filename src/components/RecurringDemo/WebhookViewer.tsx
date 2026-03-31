import React, { useEffect, useState, useRef } from "react";
import { getWebhookSSEUrl } from "@site/src/utils/sandbox";
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

export default function WebhookViewer({ orderId, label, onEvent }: WebhookViewerProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!orderId) return;

    const baseUrl = getWebhookSSEUrl();
    const url = `${baseUrl}/webhook/${orderId}/events`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const event: WebhookEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);
        onEventRef.current?.(event);
      } catch {
        // ignore malformed events
      }
    };
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [orderId]);

  return (
    <div className={styles.webhookViewer}>
      <div className={styles.webhookHeader}>
        <span className={styles.webhookTitle}>
          {label || "Webhook Notifications"}
        </span>
        <span
          className={`${styles.webhookStatus} ${connected ? styles.webhookConnected : ""}`}
        >
          <span className={styles.webhookDot} />
          {connected
            ? events.length > 0
              ? "Received"
              : "Listening..."
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
    // Token can be at various paths depending on the webhook structure
    if (p?.token?.token) return p.token.token;
    if (p?.token && typeof p.token === "string") return p.token;
  }
  return null;
}
