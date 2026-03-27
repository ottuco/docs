import React, { useEffect, useRef, useCallback, useState } from "react";
import { loadCheckoutScript, initCheckout } from "@site/src/utils/checkoutSdk";

interface CheckoutSDKEmbedProps {
  sessionId: string;
  onReady?: () => void;
  onError?: (message: string) => void;
}

let embedCounter = 0;

export default function CheckoutSDKEmbed({
  sessionId,
  onReady,
  onError,
}: CheckoutSDKEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(() => `checkout-sdk-embed-${++embedCounter}`);
  const initedRef = useRef(false);

  const init = useCallback(async () => {
    if (initedRef.current) return;
    initedRef.current = true;

    try {
      await loadCheckoutScript();
      if (containerRef.current) containerRef.current.innerHTML = "";
      initCheckout({
        selector: containerId,
        sessionId,
      });
      onReady?.();
    } catch (err: any) {
      onError?.(err.message || "Failed to load Checkout SDK");
    }
  }, [sessionId, containerId, onReady, onError]);

  useEffect(() => {
    if (sessionId) init();
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      initedRef.current = false;
    };
  }, [sessionId, init]);

  return (
    <div style={{ minHeight: 380, marginTop: 16, borderRadius: 10, overflow: "hidden", border: "1px solid var(--ifm-global-border-color)" }}>
      <div id={containerId} ref={containerRef} />
    </div>
  );
}
