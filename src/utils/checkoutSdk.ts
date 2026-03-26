/**
 * Shared Checkout SDK configuration and utilities.
 *
 * Single source of truth for CDN URL, themes, and init config.
 * Used by: CheckoutDemo, PaymentJourney, RecurringDemo.
 */

import { SANDBOX_MERCHANT_ID, SANDBOX_API_KEY } from "./sandbox";

/**
 * Checkout SDK script URL.
 * Currently pointing to Amplify preview with unreleased SDK changes.
 * Switch to https://assets.ottu.net/checkout/v3/checkout.min.js when released.
 */
export const CHECKOUT_SDK_CDN_URL =
  "https://150330.dd33t4o2i3w1b.amplifyapp.com/checkout/v3/checkout.min.js";

/** Default forms of payment shown in demos. */
export const CHECKOUT_SDK_FORMS_OF_PAYMENT = [
  "applePay",
  "tokenPay",
  "ottuPG",
  "redirect",
  "googlePay",
  "stcPay",
];

/** Minimal theme — just system-ui fonts for readability. */
export const CHECKOUT_SDK_THEME_MINIMAL: Record<string, any> = {
  "title-text": { "font-family": "system-ui" },
  amount: { "font-family": "system-ui" },
  "pay-button": { "font-family": "system-ui" },
  "payment-method-name": { "font-family": "system-ui" },
};

/** Full branded theme used in the CheckoutDemo on the SDK docs page. */
export const CHECKOUT_SDK_THEME: Record<string, any> = {
  main: { padding: "0px", width: "100%" },
  "title-text": {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "20px",
    "font-weight": "600",
  },
  "secondary-text": {
    color: "#4a4a4a",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-weight": "400",
  },
  "pay-button": {
    color: "#FFFFFF",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-style": "normal",
    "font-weight": "500",
    background: "#0053A4",
    border: "#0053A4",
  },
  "reject-button": {
    "font-family": "Poppins",
    "font-size": "16px",
    "font-style": "normal",
    "font-weight": "500",
    "background-color": "#fafafa",
    color: "#B00020",
    "border-width": "0px",
    "text-decoration": "underline",
  },
  "terms-container": { margin: "0px 0px 0px 0px" },
  "checkbox-label": {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-weight": "400",
  },
  "terms-link": {
    color: "#0053A4",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-weight": "700",
  },
  "view-toggle": {
    color: "#0053A4",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-weight": "700",
  },
  "pci-disclaimer": {
    color: "#4A4A4A",
    "font-family": "Poppins",
    "font-size": "14px",
    "font-weight": "400",
  },
  "pci-logos": { gap: "12px", margin: "20px 0px 0px 0px" },
  "wallet-buttons": { margin: "12px 0px -6px 0px" },
  methods: {
    border: "#DADADA",
    "border-style": "solid",
    "border-width": "1px",
    "border-radius": "8px",
  },
  "selected-method": { border: "#0053A4" },
  border: { display: "none" },
  "amount-box": {
    padding: "16px 12px",
    margin: "0px 0px 0px 0px",
    "border-color": "#DADADA",
    "border-style": "solid",
    "border-width": "1px",
    "border-radius": "8px",
    "background-color": "#ffffff",
  },
  "amount-label": {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "20px",
    "font-weight": "600",
  },
  amount: {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "20px",
    "font-weight": "600",
  },
  "card-background": {
    "background-color": "#ffffff",
    "border-bottom-radius": "8px",
    "border-color": "#0053A4",
    border: "solid",
  },
  "card-input-border": { "border-radius": "8px" },
  "card-input-fields": {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "16px",
    "font-weight": "400",
    "background-color": "#ffffff",
  },
  "cvv-input": {
    color: "#1A1A1A",
    "font-family": "Poppins",
    "font-size": "16px",
  },
  "field-error-border": { "border-color": "#dc3545" },
  "error-message": {
    color: "#dc3545",
    "font-family": "Poppins",
    "font-size": "12px",
  },
  "checkbox-knob": {
    "background-color": "#FFFFFF",
    "border-radius": "50%",
    "box-shadow": "0 0 4px rgba(0, 83, 164, 0.4)",
  },
  "selected-checkbox-knob": {
    "background-color": "#FFFFFF",
    "box-shadow": "0 0 4px rgba(0, 83, 164, 0.4)",
  },
  "selected-checkbox": { "background-color": "#0053A4" },
  responsive: {
    450: { "amount-box": { "justify-content": "space-between" } },
  },
};

/**
 * Load the Checkout SDK script. Safe to call multiple times —
 * returns immediately if already loaded, waits if loading in progress.
 */
export function loadCheckoutScript(): Promise<void> {
  if ((window as any).Checkout) return Promise.resolve();
  if (document.querySelector(`script[src="${CHECKOUT_SDK_CDN_URL}"]`)) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if ((window as any).Checkout) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SDK_CDN_URL;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Checkout SDK script"));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error("SDK script load timed out")), 15000);
  });
}

/**
 * Initialize the Checkout SDK. Call after `loadCheckoutScript()` resolves.
 */
export function initCheckout(options: {
  selector: string;
  sessionId: string;
  theme?: Record<string, any>;
  formsOfPayment?: string[];
  displayMode?: string;
  setupPreload?: any;
}): void {
  (window as any).Checkout.init({
    selector: options.selector,
    merchant_id: SANDBOX_MERCHANT_ID,
    session_id: options.sessionId,
    apiKey: SANDBOX_API_KEY,
    ...(options.displayMode && { displayMode: options.displayMode }),
    ...(options.formsOfPayment && {
      formsOfPayment: options.formsOfPayment,
    }),
    ...(options.setupPreload && { setupPreload: options.setupPreload }),
    theme: options.theme ?? CHECKOUT_SDK_THEME_MINIMAL,
  });
}
