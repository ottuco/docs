# AutoPay asset manifest (#158913 / #158914)

Business page: `docs/business/autopay/index.md` (authored by Ankit in PR #169).
This file records how the **assets** map onto that page. Paths are site-root.

## Screenshots

The 20 customer-portal + notification screenshots (from Menna) shipped in **#169**
and are wired into Ankit's StepGuides. This lane adds one more:

| Image | Wired into (section) | Role |
|-------|----------------------|------|
| cards-02-add-card.png | The customer self-service page → Managing saved cards | The add-card secure checkout (betabulk, John Doe). Fills the "no add-card screenshot" gap noted in #169. |

## Videos (#158914) — Remotion clips, poster-first `<VideoEmbed>`

| Clip | Wired into (section) |
|------|----------------------|
| setup-subscription.mp4    | How it works |
| self-service-tour.mp4     | The customer self-service page |
| add-card-flow.mp4         | The customer self-service page → Managing saved cards |
| retry-to-recovery.mp4     | Retries and dunning |
| notification-emails.mp4   | Notifications |

## Not applicable / deferred (with reason)

| Item | Reason |
|------|--------|
| Merchant: subscription as merchant sees it | No merchant dashboard for AutoPay — REST-API-only this phase (confirmed by Dacian 2026-08-13, and stated on the business page). |
| Merchant: subscription list with filters | Same — no merchant dashboard. |
| Add-card confirm state (cards-03) | Needs a test-card entry (a human action); deferred to Menna. |

## Known issue flagged in #169 — portal-01 recapture

`portal-01-summary-active.png` is a mockup that contradicts the real product
(shows an invoice Download column AutoPay has no invoices for, a Pay Now on an
*active* subscription, adrift dates). Ankit flagged it for @Junaid / @Menna:
recut or straight-recapture from betabulk (John Doe portal is seedable). Highest-
value screenshot task remaining.
