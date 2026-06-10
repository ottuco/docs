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
  formsOfPayment?: string[];
}

let embedCounter = 0;

export default function CheckoutSDKEmbed({
  sessionId,
  onReady,
  onError,
  callbacks,
  setupPreload,
  formsOfPayment,
}: CheckoutSDKEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(() => `checkout-sdk-embed-${++embedCounter}`);
  const initedForSession = useRef<string | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const callbacksRef = useRef(callbacks);
  const setupPreloadRef = useRef(setupPreload);
  const formsOfPaymentRef = useRef(formsOfPayment);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;
  callbacksRef.current = callbacks;
  setupPreloadRef.current = setupPreload;
  formsOfPaymentRef.current = formsOfPayment;

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
          formsOfPayment: formsOfPaymentRef.current,
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
    /* The Checkout SDK injects its own card-style frame (rounded border) into
       #ottu-checkout-shadow-wrapper, so this wrapper stays borderless to avoid
       a duplicated outer edge. minHeight gives the demo a stable footprint
       while the SDK is loading. */
    <div style={{ minHeight: 380, marginTop: 16 }}>
      <div id={containerId} ref={containerRef} />
    </div>
  );
}
