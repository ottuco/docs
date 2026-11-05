import React from "react";
import type { Step } from "@site/src/components/StepGuide";

export const walletExportSteps: Step[] = [
  {
    title: "Click Export Entries",
    description: (
      <>
        From any account's detail page, click <strong>Export Entries</strong>{" "}
        next to the Filter button.
      </>
    ),
    image: "/img/business/wallet/reporting-06-ledger-exporting.png",
    imageAlt:
      "Cursor pointing at the Export Entries button on the account detail page",
  },
  {
    title: "Choose filters and format",
    description: (
      <>
        Narrow the rows by Order Number, Session ID, Direction, Entry Type,
        Status, Provider, PG Code, or Date range, pick <strong>CSV</strong> or{" "}
        <strong>XLSX</strong>, then click <strong>Export</strong>.
      </>
    ),
    image: "/img/business/wallet/reporting-06-export.png",
    imageAlt:
      "Export Entries dialog with filter fields and CSV / XLSX file-format options",
  },
  {
    title: "Download from Generated Reports",
    description: (
      <>
        Open <strong>Generated Reports → Wallet Exports</strong>. A green arrow
        means the file is ready to download, a progress circle means it's still
        processing, and an X means generation failed.
      </>
    ),
    image: "/img/business/wallet/reporting-07-export-cursor-step.png",
    imageAlt:
      "Generated Reports → Wallet Exports list with download icons per row",
  },
];
