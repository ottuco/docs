import React, { useEffect, useRef, useState } from "react";
import {
  loadCheckoutScript,
  initCheckout,
  CHECKOUT_SDK_THEME,
  type CheckoutCallbacks,
} from "@site/src/utils/checkoutSdk";

interface CheckoutSDKEmbedProps {
  sessionId: string;
  onReady?: () => void;
  onError?: (message: string) => void;
  callbacks?: CheckoutCallbacks;
  setupPreload?: any;
}

let embedCounter = 0;

export default function CheckoutSDKEmbed({
  sessionId,
  onReady,
  onError,
  callbacks,
  setupPreload,
}: CheckoutSDKEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(() => `checkout-sdk-embed-${++embedCounter}`);
  const initedForSession = useRef<string | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const callbacksRef = useRef(callbacks);
  const setupPreloadRef = useRef(setupPreload);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;
  callbacksRef.current = callbacks;
  setupPreloadRef.current = setupPreload;

  useEffect(() => {
    if (!sessionId || initedForSession.current === sessionId) return;
    initedForSession.current = sessionId;

    let cancelled = false;

    (async () => {
      try {
        await loadCheckoutScript();
        if (cancelled) return;
        if (containerRef.current) containerRef.current.innerHTML = "";
        initCheckout({
          selector: containerId,
          sessionId,
          callbacks: callbacksRef.current,
          setupPreload: setupPreloadRef.current,
          theme: CHECKOUT_SDK_THEME,
        });
        onReadyRef.current?.();
      } catch (err: any) {
        if (cancelled) return;
        onErrorRef.current?.(err.message || "Failed to load Checkout SDK");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, containerId]);

  return (
    <div style={{ minHeight: 380, marginTop: 16, borderRadius: 10, overflow: "hidden", border: "1px solid var(--ifm-global-border-color)" }}>
      <div id={containerId} ref={containerRef} />
    </div>
  );
}
