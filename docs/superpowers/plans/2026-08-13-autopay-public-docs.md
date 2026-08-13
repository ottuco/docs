# AutoPay Public Documentation — Plan

**Epic:** [#158909](https://orbit.ottu.com/issues/158909) · **Started:** 2026-08-13
Design: `docs/superpowers/specs/2026-08-13-autopay-public-docs-design.md`

Six child tickets, four owners. This plan covers the three owned by Ankit Kundariya — #158910, #158912,
#158915 — and tracks the three it depends on.

---

## Ownership

| Ticket | Work | Owner | Status |
|---|---|---|---|
| #158910 | Developer section `/developers/payments/autopay/` | Ankit | In Progress |
| #158911 | Checkout API, webhook payload, HMAC v2 | Yamen | **New — not started** |
| #158912 | Business section `/business/autopay/` | Ankit | In Progress |
| #158913 | Screenshot and UI asset pass | Junaid / Menna | In Progress — 22 delivered |
| #158914 | Remotion video pipeline and clips | Junaid | In Progress — decoupled |
| #158915 | Publish, QA, go live | Ankit | In Progress — gated on all of the above |

---

## Execution

### Lane 0 — scaffold (done)

Commit `08749a4` on `epic/158909`, 26 files, +154.

- `sidebars.ts` — both Pattern-A anchor categories, developer and business
- skeleton pages pinning every heading id the sidebar links to
- 22 screenshots into `static/img/business/autopay/`
- `static/img/developers/autopay/.gitkeep`

Its only job is to remove `sidebars.ts` — the single file both child tickets need — from the critical
path, so the two lanes below share zero files and cannot conflict.

Baseline after this commit: `npm run typecheck` passes, `npm run build` succeeds.

### Lane A — #158910 developer, worktree `../docs-158910`, branch `docs/158910`

| | File | Requirement |
|---|---|---|
| A1 | `docs/developers/payments/autopay/index.mdx` | mandated section order, `hide_table_of_contents: true`, no `sidebar_position`/`id` |
| A2 | `src/diagrams/AutoPayFlowDiagram.tsx` | inline theme-aware SVG matching `WalletFlowDiagram.tsx` / `RecurringFlow.tsx` |
| A3 | `docs/developers/payments/index.md` | AutoPay card + "Choose Your Path" row |
| A4 | `src/data/glossary-terms.ts` | subscription, billing cycle, dunning |
| A5 | `docs/developers/cards-and-tokens/recurring-payments.mdx` | reverse half of the deconfliction cross-link |

### Lane B — #158912 business, worktree `../docs-158912`, branch `docs/158912`

| | File | Requirement |
|---|---|---|
| B1 | `docs/business/autopay/index.md` | eleven sections, explicit anchor ids, right-hand ToC kept, **zero code** |
| B2 | `docs/business/index.mdx` | Quick Navigation row |

### Integration

Each lane opens a PR into `epic/158909`. No lane merges without review. `epic/158909 → dev` is a separate
decision and deploys to docs.ottu.dev, where QA (#158915) happens before `dev → main`.

### File allowlist

Anything a lane produces outside its table above is reverted, not debated — specifically any new
`src/components/*`, any `.css`, and any edit to `sidebars.ts`. The one permitted addition is
`src/data/autopay-scenarios.tsx`, and only if it mirrors the existing `src/data/wallet-scenarios.tsx`.
Reuse of an established pattern is fine; minting a new one is not.

---

## Blocked, and how each is handled

| Blocked item | Blocked by | Handling |
|---|---|---|
| `## API Reference` / `<ApiDocEmbed>` | `core_backend` PR 121 | Heading kept, one `:::note`, no fabricated embed. Verified: `static/Ottu_API.yaml` has zero `autopay` occurrences. |
| Merchant-facing base path for the six endpoints | `core_backend` PR 121 (proxy) | **Open question for Yamen.** `autopay.ottu.dev` is the internal service behind Keycloak S2S; merchants reach the endpoints through a Connect proxy whose path is not in this repo, not in the committed spec, and not in memory. cURL samples have no verified base path until answered. |
| Add-card flow screenshot | design team | Behaviour written as prose; no image referenced. Request is out. |
| Merchant dashboard screens | does not exist | **Cut.** REST-API-only this phase, confirmed by Dacian 2026-08-13. Business page notes a dashboard as a later phase. |
| Remotion clips | #158914 | Decoupled. No `<video>`, no placeholder. |
| #158915 sign-off | #158911 still `New` | Carries a breaking webhook HMAC rewrite affecting every merchant, AutoPay or not. Nudge required. |

---

## Verified facts

Read from source at `/Users/ankitkundariya/Ottu/Code/autopay/autopay/autopay/`, or confirmed live.
No behavioural claim on either page may contradict these.

| Fact | Source |
|---|---|
| Seven states: `pending_setup`, `trialing`, `active`, `past_due`, `canceled`, `expired`, `setup_failed` | `subscriptions/enums.py:24-31` |
| `canceled` / `expired` terminal; `setup_failed` has a path back to `pending_setup` | `subscriptions/models.py` FSM |
| Four total attempts (`retry_count` default 3), one hour apart, flat | `subscriptions/models.py:111` |
| Reminders — monthly `[2]`, yearly `[30, 10, 3]` | `subscriptions/tasks/_tenant_processors.py:36` |
| `frequency` is `monthly` or `yearly` only | `subscriptions/enums.py:49-51` |
| Six merchant endpoints, paths confirmed | `subscriptions/api.py` router decorators |
| `extra.autopay.subscription_id` on the 201 | betabulk, 2026-08-13, HTTP 201 |

### Endpoint paths (confirmed against router decorators)

```
POST  /                                       list — a POST that reads; filters in body so
                                              customer_id never lands in access logs
GET   /{subscription_id}/                     retrieve
POST  /{subscription_id}/cancel/              cancel — immediate, or at end of current period
POST  /{subscription_id}/regenerate-page-token/
GET   /{subscription_id}/page-link/
GET   /{subscription_id}/cycles/
```

AutoPay mounts NinjaAPI at the Django root — no `/api`, no `/v1` prefix. These are the service's own
paths; the merchant-facing proxy path is the open question above.

### Facts the tickets do not carry

Found while verifying. All belong in the docs.

1. **The `autopay` request block is write-only.** Not echoed in the 201. `extra.autopay.subscription_id`
   is the merchant's only handle.
2. **`customer_email` is required** for `payment_type=auto_pay`. Omitting it makes AutoPay's internal
   schema 422 at bind time, surfaced by Connect as
   `400 {"autopay":["AutoPayClient rejected request (422)"]}` — reads like an agreement-shape error, isn't.
3. **`page-link` and `regenerate-page-token` are different operations.** `page-link` returns the link as it
   stands and does not rotate the token — use it to re-send a lost link. `regenerate-page-token` revokes.
   A merchant reaching for regenerate when they meant re-send silently breaks the customer's working link,
   with no notification to that customer.
4. **The customer page lives on the Connect host**, not `autopay.ottu.dev`:
   `https://<ottu-domain>/<lang>/subscription/<token>`. Language is in the path.
5. **The page token is signed, not encrypted.** `django.core.signing.dumps` format —
   `base64url({"m": merchant, "c": customer_uuid, "s": subscription_id, "n": nonce}) : timestamp : signature`.
   Anyone holding the link can decode the payload. The signature prevents forgery, not reading. Treat the
   link like a password. **Never publish a real token in the docs.**
6. **The nonce is why revocation works.** `signing.dumps` is deterministic to the second, so re-signing an
   identical payload would yield an identical token; `n` guarantees a fresh string, and the endpoint
   compares the URL token against the stored one.

---

## Baseline

`npm run build` on `epic/158909` succeeds with pre-existing broken-anchor warnings on
`/business/payment-management/transaction-states/`, `/developers/cards-and-tokens/tokenization/`,
`/developers/payments/wallet/` and `/developers/reference/payment-states/`. None are AutoPay. Any new
warning naming an AutoPay path is a regression from this epic.

`onBrokenLinks` is `"warn"`, so a broken anchor does not fail the build — it silently stops scrolling.
Anchors are checked by hand. A green build is not evidence that navigation works.
