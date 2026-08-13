# AutoPay Public Documentation — Design

**Epic:** [#158909](https://orbit.ottu.com/issues/158909) · **Date:** 2026-08-13 · **Lead:** Ankit Kundariya

Companion plan: `docs/superpowers/plans/2026-08-13-autopay-public-docs.md`
Precedent: the M-Wallet pair (`2026-05-11-wallet-public-docs-design.md` / `-wallet-public-docs.md`) — this
epic runs the identical pipeline and every ticket names M-Wallet as the reference model.

---

## The problem

AutoPay is a built, working recurring-payments product. It is completely undocumented in public. A merchant
who wants subscriptions has no page to read, and a merchant who finds the existing recurring-payments page
lands on the wrong product.

## The product, in one distinction

Everything on both pages hangs off one sentence:

> With `payment_type=auto_debit`, the **merchant** owns the billing schedule, retries, dunning and customer
> comms. With `payment_type=auto_pay`, **AutoPay** owns them.

A merchant makes one checkout call. After that AutoPay generates cycles one at a time, charges the saved
card, retries on failure, emails the customer, and hosts a per-subscription page where the customer manages
their own subscription.

## Audience split

The root `CLAUDE.md` split is a hard rule and is the main way these pages can fail review.

| | Developer page | Business page |
|---|---|---|
| Path | `/developers/payments/autopay/` | `/business/autopay/` |
| Reader | integrating engineer | merchant admin / ops |
| Content | code-first, API contracts | feature-and-benefit |
| Screenshots | none | yes |
| Code samples | yes | **zero** |
| Table of contents | `hide_table_of_contents: true` | right-hand ToC kept |

---

## Scope

**In:** the developer section, the business section, the flow diagram, sidebar navigation for both,
glossary terms, the deconfliction against the existing recurring-payments page, and the screenshot pass.

**Out, with reasons:**

- **Arabic translation.** The docs site is English-only — `docusaurus.config.ts` declares `locales: ["en"]`
  and there is no `i18n/` directory. AutoPay itself ships en/ar, but that creates no docs-site work.
- **Internal architecture.** Celery topology, tenant schemas, the internal subscription-create endpoint and
  the E2E simulate endpoint are internal-only. Docs cover the merchant-facing contract.
- **Merchant dashboard UI.** It does not exist. AutoPay is REST-API-only on the merchant side in this
  phase — confirmed by Dacian on Mattermost, 2026-08-13: *"thats not yet added, its only via rest api."*
  Both merchant-side screenshots requested by #158913 are cut; the business page documents merchant setup
  as API-only and notes a dashboard view as a later phase.
- **Video.** Remotion (#158914) is a from-scratch pipeline with an unmade hosting decision. Decoupled from
  the business page; clips land in a later PR.

---

## Architecture of the change

### Branch topology

```
main
 └── dev
      └── epic/158909                      integration branch for the whole epic
           ├── (scaffold commit, direct)   sidebars.ts + skeleton pages + screenshots
           ├── docs/158910 ──PR──▶ epic    developer page      [worktree ../docs-158910]
           └── docs/158912 ──PR──▶ epic    business page       [worktree ../docs-158912]

epic/158909 ──PR──▶ dev ──▶ docs.ottu.dev ──▶ QA #158915 ──▶ dev ──▶ main ──▶ docs.ottu.com
```

Branch names follow `<task-type>/<ticket-number>` with no descriptive slug. Both child tickets are tracker
`Documentation`, hence `docs/`.

`origin/dev` and `origin/main` have diverged — main is ahead by 12 commits, dev by 32, across 71 files. The
final `dev → main` merge is a real merge, not a fast-forward. Everything here is based on `origin/dev`.

### Why a scaffold commit exists

`sidebars.ts` is the only file both child tickets need to edit. Rather than let two parallel lanes fight
over it, one scaffold commit lands first on `epic/158909` carrying:

- both Pattern-A anchor categories (developer after the M-Wallet block, business after the M-Wallet block)
- skeleton pages whose headings pin every anchor id the sidebar links to
- the 22 screenshots

After that commit the two lanes share **zero files** and can run fully parallel with no merge risk.

The skeletons matter for a second reason: `onBrokenLinks` is `"warn"`, so a sidebar anchor pointing at a
heading that does not exist will not fail the build — it will silently stop scrolling. Pinning the ids in
the scaffold makes drift a visible edit rather than an invisible regression.

### Sidebar pattern

Both sections use **Pattern A** — a `type: "category"` whose `link` is the single long doc, with one
`type: "link"` child per `##` heading. This matches M-Wallet on both sides. Business headings carry explicit
`{#anchor-id}` so renaming the visible text cannot break navigation.

### Flow diagram

`src/diagrams/AutoPayFlowDiagram.tsx` — inline theme-aware SVG via the `svg-diagram` skill, matching
`WalletFlowDiagram.tsx` and `RecurringFlow.tsx`. Not Mermaid; Mermaid is legacy in this repo.

---

## Content sources

Nothing on either page is invented. Every behavioural claim traces to one of:

| Claim | Source |
|---|---|
| Seven subscription states | `autopay/subscriptions/enums.py:24-31` |
| Terminal states, `setup_failed` retry path | `autopay/subscriptions/models.py` FSM transitions |
| Six merchant endpoints; `list` is a POST that reads | `autopay/subscriptions/api.py` |
| Four total attempts (`retry_count` default 3) | `autopay/subscriptions/models.py:111` |
| Reminders — monthly `[2]`, yearly `[30, 10, 3]` | `autopay/subscriptions/tasks/_tenant_processors.py:36` |
| Overview, auth table, error table, pagination | `autopay/config/api.py:16-204` — reused, not rewritten |
| Per-endpoint request/response JSON | docstrings already on every endpoint in `subscriptions/api.py` |
| `extra.autopay.subscription_id` on the 201 | verified live on betabulk, 2026-08-13, HTTP 201 |

### Three facts the tickets do not carry

Found while verifying, and material to the developer page:

1. **The `autopay` request block is write-only.** It is not echoed in the 201 response.
   `extra.autopay.subscription_id` is the merchant's only handle on the subscription.
2. **`customer_email` is required** for `payment_type=auto_pay`. Omitting it makes AutoPay's internal
   schema 422 at bind time, which Connect surfaces as
   `400 {"autopay":["AutoPayClient rejected request (422)"]}` — which reads like an agreement-shape error
   and is not. This belongs in error handling.
3. **`list` is a POST that reads.** Filters live in the request body deliberately, so `customer_id` never
   lands in access logs. Worth calling out; it surprises people.

---

## Deconfliction with recurring-payments

`docs/developers/cards-and-tokens/recurring-payments.mdx` documents `payment_type=auto_debit` CIT/MIT with
its own demo and flow diagram. It is the closest existing analog, and search traffic will send readers to
the wrong page.

Both pages get an explicit "use this when" cross-link pointing at the other, carrying the ownership
distinction stated above. A one-directional link is not sufficient — the reader arriving at the wrong page
is the failure being fixed.

---

## Blocked work and how it is handled

| Blocked | Owner | Handling |
|---|---|---|
| `## API Reference` — `<ApiDocEmbed>` for the six endpoints | Yamen, `core_backend` PR 121 | Heading kept, one `:::note`, no fabricated embed. The endpoints are documented as prose plus cURL under `## Guide`. Verified: `static/Ottu_API.yaml` contains zero occurrences of `autopay`. |
| Add-card flow screenshot | design team | Behaviour written as prose; no image referenced. Lands in a later pass. |
| Merchant dashboard screens | — | Cut from scope. Documented as API-only with a later-phase note. |
| Remotion clips | Junaid, #158914 | Decoupled. No `<video>`, no placeholder. |

The release gate #158915 additionally depends on #158911, which carries a **breaking** webhook HMAC signing
rewrite affecting every merchant, including merchants who never touch AutoPay. That ticket was still `New`
as of 2026-08-13 14:30 IST.

---

## Acceptance

Per ticket, unchanged from Redmine:

**#158910** — mandated section order; every sidebar anchor scrolls to a real heading; `npm run typecheck`
and `npm run build` pass; recurring-payments cross-link exists in both directions; no hardcoded base URL in
any code block.

**#158912** — right-hand ToC intact; every `##` heading has an explicit anchor id with a matching sidebar
entry; no code samples anywhere; past-due-never-auto-cancels and customer-cancel-at-period-end both stated
explicitly; every `<StepGuide>` step resolves to a real image.

**#158915** — full QA checklist passes on docs.ottu.dev; four reviewers signed off; both sections live on
docs.ottu.com; no broken anchors, images or links.

Anchors are checked **by hand**. A green build is not evidence that navigation works.

---

## Known-good baseline

`npm run build` on `epic/158909` succeeds. It emits pre-existing broken-anchor warnings on
`/business/payment-management/transaction-states/`, `/developers/cards-and-tokens/tokenization/`,
`/developers/payments/wallet/` and `/developers/reference/payment-states/`. None are AutoPay. Any new
warning naming an AutoPay path is a regression introduced by this epic.
