import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "developers/apis/ottu-api",
    },
    {
      type: "category",
      label: "Satellite API",
      items: [
        {
          type: "doc",
          id: "developers/apis/compare-metrics",
          label: "Retrieve metrics for txn comparison",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/compare-timestamp",
          label: "Retrieve `created` value of first txn",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Unified UI",
      items: [
        {
          type: "doc",
          id: "developers/apis/api-v-1-unified-ui-invoice-list",
          label: "Retrieve a list of Invoices",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/api-v-1-unified-ui-invoice-retrieve",
          label: "Retrieve an Invoice item",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/get-payment-details",
          label: "Retrieve the payment transaction details",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Checkout SDK",
      items: [
        {
          type: "doc",
          id: "developers/apis/aba-payway-sub-option-submit",
          label: "Submit ABAPayWay",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/post-pay-apple-pay",
          label: "Submit an Apple Pay payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/post-validate-apple-pay-session",
          label: "Validate Apple Pay session",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/sdk-cancel-operation",
          label: "SDK Cancel Operation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/concur-payer-sdk",
          label: "Concur Payer View",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/csuc-payment-execution",
          label: "Execute CSUC Payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/csuc-payment-config-generation",
          label: "Initialize CSUC Payment Flow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/ctp-payment-config-generation",
          label: "Submit Doku",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/post-pay-google-pay",
          label: "Submit a Google Pay payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/initiate-checkout-sdk",
          label: "Retrieve init data",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/stc-pay-checkout-sdk-capture",
          label: "Submit STC Pay OTP",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/stc-pay-checkout-sdk-authorize",
          label: "Submit STC Pay payment method",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/submit-token-payment-method",
          label: "Submit token payment method",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/submit-redirect-payment-method",
          label: "Submit redirect payment method",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/urpay-pay-checkout-sdk-capture",
          label: "Submit URPay Pay OTP",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/urpay-pay-checkout-sdk-authorize",
          label: "Submit URPay Pay payment method",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "PaymentMethods API",
      items: [
        {
          type: "doc",
          id: "developers/apis/get-pre-payment-option",
          label: "Retrieve Pre Payment Check response.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/get-payment-methods",
          label: "Retrieve a list of payment methods based on filter values.",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Checkout API",
      items: [
        {
          type: "doc",
          id: "developers/apis/create-payment-transaction-checkout",
          label: "Create a new Payment Transaction",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/upload-attachment",
          label: "Attachment Upload",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Invoice API",
      items: [
        {
          type: "doc",
          id: "developers/apis/create-invoice",
          label: "Create a new Invoice",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Ottu PG",
      items: [
        {
          type: "doc",
          id: "developers/apis/create-attempt-pymt-txn-for-ottu-pg",
          label: "Fetch Ottu session data",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Payment Operations",
      items: [
        {
          type: "doc",
          id: "developers/apis/auto-debit",
          label: "Native Payment API(Auto Debit)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/cash-payment-acknowledgement",
          label: "Cash Payment Acknowledgement (Deprecated)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/inquiry",
          label: "Check Status-Inquiry",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/public-operations",
          label: "Operations",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/apple-direct-payment",
          label: "Native Payment API(Apple Pay)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/auto-debit-2",
          label: "Native Payment API(Auto Debit)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/cash-payment-acknowledgement-2",
          label: "Cash Payment Acknowledgement (Deprecated)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/google-direct-payment",
          label: "Native Payment API(Google Pay)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "User Cards",
      items: [
        {
          type: "doc",
          id: "developers/apis/get-user-cards",
          label: "Retrieve a list of saved cards for the customer.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/delete-user-cards",
          label: "Delete a saved card for the customer.",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Payment Notifications",
      items: [
        {
          type: "doc",
          id: "developers/apis/message-notifications",
          label: "Message Notifications",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Communication Notifications",
      items: [
        {
          type: "doc",
          id: "developers/apis/send-specific-notification",
          label: "Channel Specific Notifications",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/apis/send-notification",
          label: "Notifications",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Utilities",
      items: [
        {
          type: "doc",
          id: "developers/apis/shorten-url",
          label: "Shorten a URL using Ottu's core URL shortening service.",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
