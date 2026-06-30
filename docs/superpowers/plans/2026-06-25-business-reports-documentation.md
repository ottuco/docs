# Business Reports Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a single comprehensive business-audience page documenting Ottu's Reports feature — covering how to generate, export from all sources, find, and download reports — and wire it into the sidebar.

**Architecture:** Single MDX page at `docs/business/reports/index.mdx` using Pattern A (anchor-based sidebar sub-menu), following the same structure as `docs/business/wallet/index.md`. The sidebar entry is added to `businessSidebar` in `sidebars.ts` between "Payment Management" and "Wallet". Image assets live under `static/img/business/reports/` with pre-defined filenames ready to be dropped in when screenshots arrive from Menna Omar.

**Tech Stack:** Docusaurus 3.8.1 MDX, `StepGuide` React component (already used across business docs), standard Docusaurus admonitions (:::note, :::tip, :::warning).

## Global Constraints

- Business audience only — no code, no API calls, no developer jargon
- Plain language; define any Ottu-specific term (e.g., "plugin") on first use with a link to its docs page
- Every `## heading` id in the MDX MUST match the `href` hash in the sidebar entry exactly (Docusaurus lowercases and hyphenates heading text automatically)
- Image paths use `/img/business/reports/<slug>.png` — create the folder, but leave image files as placeholders (they will be provided after Menna Omar annotates screenshots)
- StepGuide image props are required — use the expected final filename so the component is wired up before the images land
- `npm run typecheck` must pass after every commit; `npm run build` must pass after the final commit
- Do NOT edit any file under `docs/developers/apis/` or `static/Ottu_API_enriched.yaml`
- Demo merchant_id must be `ksa.ottu.dev` whenever referenced (not applicable here — no code samples needed)
- Semantic commit messages, `git add` specific files only

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `docs/business/reports/index.mdx` | The single Reports page |
| Create | `static/img/business/reports/.gitkeep` | Reserves the image folder before screenshots arrive |
| Create | `src/data/wallet-export-steps.tsx` | Shared wallet export StepGuide steps (reused in both Reports and M-Wallet pages) |
| Modify | `sidebars.ts` | Add Reports category to `businessSidebar` between Payment Management and Wallet |
| Modify | `docs/business/wallet/index.md` | Import `walletExportSteps` from shared data file; replace inline steps in `## Exporting` |

---

### Task 1: Scaffold — page skeleton + image folder + sidebar entry

**Files:**
- Create: `docs/business/reports/index.mdx`
- Create: `static/img/business/reports/.gitkeep`
- Modify: `sidebars.ts:594-608` (after the Payment Management category block, before the Wallet category block)

**Interfaces:**
- Produces: Route `/business/reports` resolves without 404; sidebar "Reports" link appears in Business nav

- [x] **Step 1: Create the image folder placeholder**

```bash
# Run in repo root
New-Item -ItemType File -Path "static/img/business/reports/.gitkeep" -Force
```

- [x] **Step 2: Create the page skeleton**

Create `docs/business/reports/index.mdx` with this exact content:

```mdx
---
title: Reports
sidebar_label: Reports
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import StepGuide from "@site/src/components/StepGuide";

# Reports

Ottu lets you export and download your payment data at any time. Whether you need a snapshot of today's transactions or a record of wallet activity, the reports system gives you a file you can open in Excel, share with your finance team, or archive for compliance.

This guide covers everything from generating your first export to re-downloading a file you created last week.
```

- [x] **Step 3: Add the sidebar entry**

Open `sidebars.ts`. Find the `Payment Management` category block (around line 592) and the `Wallet` category block that follows it. Insert the new `Reports` category **between** them:

```ts
        {
          type: "category",
          label: "Reports",
          link: { type: "doc", id: "business/reports/index" },
          items: [
            {
              type: "link",
              label: "How it works",
              href: "/business/reports#how-it-works",
            },
            {
              type: "link",
              label: "Generate a Report",
              href: "/business/reports#generate-a-report",
            },
            {
              type: "link",
              label: "Export Sources",
              href: "/business/reports#export-sources",
            },
            {
              type: "link",
              label: "Download Your Reports",
              href: "/business/reports#download-your-reports",
            },
          ],
        },
```

The insertion point in `sidebars.ts` is right after the closing `},` of the `Payment Management` category block and before `{` opening the `Wallet` category block.

- [x] **Step 4: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: `Found 0 errors.` (or only pre-existing warnings unrelated to the new files)

- [x] **Step 5: Commit**

```bash
git add docs/business/reports/index.mdx static/img/business/reports/.gitkeep sidebars.ts
git commit -m "docs(reports): scaffold business Reports page and sidebar entry"
```

---

### Task 2: Write the "How it works" section

**Files:**
- Modify: `docs/business/reports/index.mdx`

**Interfaces:**
- Consumes: Page skeleton from Task 1 (`docs/business/reports/index.mdx` exists)
- Produces: `## How it works` section with the anchor id `how-it-works` (matches sidebar href)

- [x] **Step 1: Append the How it works section**

Add this content after the opening paragraph in `docs/business/reports/index.mdx`:

```mdx
## How it works

When you export data from any screen in Ottu — the Transactions page, wallet activity, or other sections — Ottu queues a file to be generated in the background. This usually takes a few seconds to a few minutes depending on how many records are included.

Once the file is ready, it appears in the **Generated Reports** page, where you can download it at any time. You do not need to wait on the screen where you clicked Export — you can close the browser, come back later, and the file will still be there.

:::note
Generated reports are private to your account. Other staff members on your merchant account can see their own reports but not yours unless they have admin access.
:::

### What gets exported

Every export produces a **CSV file** you can open in Excel, Google Sheets, or any spreadsheet tool.

| What you export | Where you start | What the file contains |
|---|---|---|
| Payment transactions | Transactions page | Payment links, amounts, statuses, gateway info |
| Wallet activity | Wallet reports screen | Wallet credits, debits, and balances |

:::tip
If you need reports delivered automatically on a schedule — for example, a daily CSV emailed to your finance team — see [Transaction Report Configuration](/business/settings/transaction-reports) under Settings.
:::
```

- [x] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: `Found 0 errors.`

- [x] **Step 3: Commit**

```bash
git add docs/business/reports/index.mdx
git commit -m "docs(reports): add How it works section to business Reports page"
```

---

### Task 3: Write the "Generate a Report" section

**Files:**
- Modify: `docs/business/reports/index.mdx`

**Interfaces:**
- Consumes: `## How it works` section present in `index.mdx`
- Produces: `## Generate a Report` section with id `generate-a-report`; references images at `/img/business/reports/transactions-*.png` (placeholders for Menna Omar)

- [x] **Step 1: Append the Generate a Report section**

Add this content after the How it works section:

```mdx
## Generate a Report

The most common way to generate a report is from the **Transactions** page. You apply filters to narrow the data to what you need, then click **Export** to queue the file.

<StepGuide steps={[
  {
    title: "Open the Transactions page",
    description: <>From the Ottu Dashboard, go to <strong>Payment Request</strong> (a <a href="/business/plugins">plugin</a> in the left sidebar) and click <strong>Transactions</strong>. All payment transactions for your account are listed here.</>,
    image: "/img/business/reports/transactions-01-open.png",
    imageAlt: "Ottu Dashboard with Transactions page open under Payment Request plugin",
  },
  {
    title: "Apply filters (optional)",
    description: <>Use the <strong>Filter</strong> button to narrow the data before exporting. You can filter by date range, payment status, payment gateway, amount, and more. Filtering first means your exported file contains only the rows you need — making it faster to generate and easier to work with.<br /><br />Click <strong>Search</strong> after setting your filters to preview the results.</>,
    image: "/img/business/reports/transactions-02-filter.png",
    imageAlt: "Filter panel open on the Transactions page with date range and status selected",
  },
  {
    title: "Click Export",
    description: <>Click the <strong>Export</strong> button (top-right of the transactions table). Ottu queues the report for generation. You will see a confirmation message — the file is not ready instantly.</>,
    image: "/img/business/reports/transactions-03-export.png",
    imageAlt: "Export button highlighted on the Transactions page toolbar",
  },
  {
    title: "Wait for the file to be ready",
    description: <>The report is generated in the background. For small exports (a few hundred rows) this takes seconds. For large exports (thousands of rows), it may take a minute or two. You do not need to stay on this page.</>,
    image: "/img/business/reports/transactions-04-queued.png",
    imageAlt: "Confirmation notification showing the report has been queued for generation",
  },
  {
    title: "Download from Generated Reports",
    description: <>Once ready, your file appears in <strong>Generated Reports</strong>. See <a href="#download-your-reports">Download Your Reports</a> below for the full walkthrough.</>,
    image: "/img/business/reports/transactions-05-ready.png",
    imageAlt: "Generated Reports page showing the newly created report file ready to download",
  },
]} />

:::warning
Exports include **all columns currently visible in your transactions table**. If you have added custom columns via Table Headers, those columns will appear in the export too. To control which columns are exported, adjust your table headers before clicking Export. See [Transaction Insights](/business/payment-management/transaction-insights) for how to manage table columns.
:::
```

- [x] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: `Found 0 errors.`

- [x] **Step 3: Commit**

```bash
git add docs/business/reports/index.mdx
git commit -m "docs(reports): add Generate a Report step-by-step section"
```

---

### Task 4: Write the "Export Sources" section

**Files:**
- Create: `src/data/wallet-export-steps.tsx`
- Modify: `docs/business/reports/index.mdx`
- Modify: `docs/business/wallet/index.md`

**Interfaces:**
- Consumes: `## Generate a Report` section present
- Produces: `## Export Sources` section with id `export-sources`; `### Wallet Reports` reuses confirmed M-Wallet images via shared `walletExportSteps` — no `wallet-export-*.png` placeholders needed

**Architecture decision (2026-06-30):** The M-Wallet `## Exporting` section is confirmed with real screenshots. Rather than duplicate the steps with new placeholder images in Reports, the wallet export StepGuide steps are extracted into `src/data/wallet-export-steps.tsx` and imported in both `wallet/index.md` and `reports/index.mdx`. The `### Wallet Reports` description was updated to accurately describe the ledger export flow (Dashboard → Wallet → Accounts → open account → Export Entries).

- [x] **Step 1: Create shared wallet export steps file**

Create `src/data/wallet-export-steps.tsx` exporting `walletExportSteps: Step[]` with the three steps from M-Wallet `## Exporting` (images from `/img/business/wallet/reporting-06-*.png` and `reporting-07-*.png`).

- [x] **Step 2: Update wallet/index.md**

Add `import { walletExportSteps } from "@site/src/data/wallet-export-steps"` and replace the inline StepGuide steps in `## Exporting` with `<StepGuide steps={walletExportSteps} />`.

- [x] **Step 3: Append the Export Sources section to reports/index.mdx**

Add `import { walletExportSteps } from "@site/src/data/wallet-export-steps"` and use `<StepGuide steps={walletExportSteps} />` for the Wallet Reports sub-section. Wallet Reports description updated to match the actual ledger export flow.

- [x] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: `Found 0 errors.`

- [x] **Step 3: Commit**

```bash
git add docs/business/reports/index.mdx
git commit -m "docs(reports): add Export Sources section covering all export entry points"
```

---

### Task 5: Write the "Download Your Reports" section

**Files:**
- Modify: `docs/business/reports/index.mdx`

**Interfaces:**
- Consumes: `## Export Sources` section present
- Produces: `## Download Your Reports` section with id `download-your-reports`; images at `/img/business/reports/generated-reports-*.png`

- [x] **Step 1: Append the Download Your Reports section**

Add this content after the Export Sources section:

```mdx
## Download Your Reports

All files you have exported — from any screen — are collected in one place: the **Generated Reports** page. You can download them immediately after they are ready, or come back days later to re-download the same file.

<StepGuide steps={[
  {
    title: "Open Generated Reports",
    description: <>From the Ottu Dashboard, click <strong>Generated Reports</strong> in the left sidebar. You will see a list of all reports you have queued, sorted with the most recent at the top.</>,
    image: "/img/business/reports/generated-reports-01-open.png",
    imageAlt: "Generated Reports page showing a list of report files with statuses",
  },
  {
    title: "Check the report status",
    description: <>Each report shows a status badge:<br /><br /><ul><li><strong>Pending</strong> — the file is still being generated, check back in a moment</li><li><strong>Ready</strong> — the file is available to download</li><li><strong>Failed</strong> — generation encountered an error; try exporting again</li></ul></>,
    image: "/img/business/reports/generated-reports-02-statuses.png",
    imageAlt: "Close-up of report status badges: Pending, Ready, and Failed",
  },
  {
    title: "Download the file",
    description: <>Click the <strong>Download</strong> button next to a <em>Ready</em> report. The CSV file saves to your browser's default Downloads folder.</>,
    image: "/img/business/reports/generated-reports-03-download.png",
    imageAlt: "Download button highlighted next to a Ready report",
  },
  {
    title: "Re-download anytime",
    description: <>Ready reports stay in the list indefinitely. You can click <strong>Download</strong> again at any time to get another copy of the same file. Nothing changes between downloads — the file reflects the data at the moment you clicked Export.</>,
    image: "/img/business/reports/generated-reports-04-redownload.png",
    imageAlt: "Generated Reports list showing an older report still available to re-download",
  },
]} />

:::tip
Use your browser's built-in search (Ctrl+F / Cmd+F) on the Generated Reports page to quickly find a specific export by date or name if you have many reports listed.
:::
```

- [x] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: `Found 0 errors.`

- [x] **Step 3: Commit**

```bash
git add docs/business/reports/index.mdx
git commit -m "docs(reports): add Download Your Reports section with Generated Reports walkthrough"
```

---

### Task 6: Polish — What's Next, cross-links, and final build check

**Files:**
- Modify: `docs/business/reports/index.mdx`

**Interfaces:**
- Consumes: All four content sections present
- Produces: Completed page passing `npm run build`; "Reports" link resolves from `business/payment-management/index.md`'s What's Next section

- [x] **Step 1: Append the What's Next section**

Add this as the final section of `docs/business/reports/index.mdx`:

```mdx
---

## What's Next?

- [Transaction Report Configuration](/business/settings/transaction-reports) — Set up scheduled reports delivered by email or SFTP automatically
- [Payment Management](/business/payment-management/) — Search, filter, and inspect individual transactions
- [Wallet](/business/wallet/) — Understand wallet credits, debits, and how wallet activity is reported
- [Plugins](/business/plugins/) — Learn about the Payment Request, E-Commerce, and Bulk plugins that generate the data you export
```

- [x] **Step 2: Add a cross-link from Payment Management index**

Open `docs/business/payment-management/index.md`. Find the existing `## What's Next?` block at the bottom. The block currently links to "Transaction Reports" like this:

```md
- [Transaction Reports](/business/settings/transaction-reports) -- Export and analyze transaction data
```

Replace that line with two lines — one pointing at the new Reports page (the how-to guide) and one pointing at the settings page (the configuration reference):

```md
- [Reports](/business/reports/) -- Generate, export, and download transaction data as CSV files
- [Transaction Report Configuration](/business/settings/transaction-reports) -- Set up scheduled automated reports
```

- [x] **Step 3: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors. Warnings about external links are acceptable; broken internal links are not.

- [x] **Step 4: Verify the page renders correctly**

```bash
npm run serve
```

Open `http://localhost:3000/business/reports/` in a browser and verify:
- The page loads with the correct title "Reports"
- The sidebar shows the "Reports" category with four anchor links
- Clicking each sidebar anchor scrolls to the correct heading
- The StepGuide components render (they will show broken image icons until real screenshots are added — this is expected)
- The What's Next links at the bottom all resolve without 404

- [x] **Step 5: Commit the final polish**

```bash
git add docs/business/reports/index.mdx docs/business/payment-management/index.md
git commit -m "docs(reports): add What's Next section, cross-link from Payment Management index, final build verified"
```

---

## Self-Review Against Ticket #156243

### Acceptance Criteria Coverage

| Acceptance Criterion | Covered by |
|---|---|
| Reports documentation published under the Business section | Task 1 (sidebar entry in `businessSidebar`) |
| "How it works" overview included | Task 2 (## How it works) |
| Generating a report from Transactions page documented step by step | Task 3 (## Generate a Report, 5-step StepGuide) |
| All export sources listed and documented, including wallet reports | Task 4 (## Export Sources — Transactions, Wallet, Bulk, E-Commerce) |
| Finding and downloading reports from Generated Reports page documented | Task 5 (## Download Your Reports, 4-step StepGuide) |
| Every step has a corresponding annotated screenshot or GIF | Image paths pre-wired in all StepGuide components; files to be provided by Menna Omar |
| Content reviewed for clarity for non-technical business audience | No code, plain language throughout, jargon linked on first use |

### Visual Assets Handoff

The following image paths are pre-written into the MDX. Menna Omar needs to produce annotated screenshots and save them to `static/img/business/reports/` with these exact filenames:

**Transactions flow:**
- `transactions-01-open.png`
- `transactions-02-filter.png`
- `transactions-03-export.png`
- `transactions-04-queued.png`
- `transactions-05-ready.png`

**Wallet export flow:**
- `wallet-export-01-open.png`
- `wallet-export-02-filter.png`
- `wallet-export-03-export.png`

**Generated Reports flow:**
- `generated-reports-01-open.png`
- `generated-reports-02-statuses.png`
- `generated-reports-03-download.png`
- `generated-reports-04-redownload.png`

GIFs are mentioned in the ticket but not yet wired into the page. Once Menna Omar provides them, add them as `<img>` or `![alt](path)` inline below the relevant StepGuide sections.

### Visual Assets Status (updated 2026-06-25)

**Transactions flow — DONE ✅ (committed in e839b38)**
- `transactions-01-open.png` ✅
- `transactions-02-filter.png` ✅
- `transactions-03-export.png` ✅
- `transactions-04-queued.png` ✅
- `transactions-05-ready.png` ✅

**Wallet export flow — DONE ✅ (reuses confirmed M-Wallet images via `walletExportSteps`, 2026-06-30)**
- `reporting-06-ledger-exporting.png` ✅ (from `/img/business/wallet/`)
- `reporting-06-export.png` ✅ (from `/img/business/wallet/`)
- `reporting-07-export-cursor-step.png` ✅ (from `/img/business/wallet/`)

**Generated Reports flow — PENDING ⏳**
- `generated-reports-01-open.png` ⏳
- `generated-reports-02-statuses.png` ⏳
- `generated-reports-03-download.png` ⏳
- `generated-reports-04-redownload.png` ⏳

Drop the pending files into `static/img/business/reports/` with these exact names, then commit. No MDX changes needed — the image paths are already wired.

### No Placeholders Scan

No "TBD", "TODO", or "implement later" text in any step. All StepGuide props are fully specified. All image paths use the final expected filenames (not temporary names).

### Type Consistency

- `StepGuide` import path: `@site/src/components/StepGuide` — matches usage in `docs/business/wallet/index.md` and `docs/business/payment-management/search-and-filter.mdx`
- Sidebar `link.id`: `business/reports/index` — matches the file at `docs/business/reports/index.mdx` (Docusaurus strips the extension)
- All sidebar `href` hashes match their corresponding `## Heading` text exactly when lowercased and hyphenated: `how-it-works`, `generate-a-report`, `export-sources`, `download-your-reports`
