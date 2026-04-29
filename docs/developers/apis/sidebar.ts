import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "developers/apis/ottu-api",
    },
    {
      type: "category",
      label: "Reports API",
      items: [
        {
          type: "doc",
          id: "developers/apis/list-reports",
          label: "List Transaction Reports",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/download-report",
          label: "Download Transaction Report File",
          className: "api-method get",
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
          id: "developers/apis/retrieve-payment-transaction-checkout",
          label: "Retrieve Payment Transaction",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/apis/full-update-payment-transaction-checkout",
          label: "Update Payment Transaction",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "developers/apis/partial-update-payment-transaction-checkout",
          label: "Partially Update Payment Transaction",
          className: "api-method patch",
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
  ],
};

export default sidebar.apisidebar;
