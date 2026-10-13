# AutoPay asset manifest (#158913 / #158914)

Business page: `docs/business/autopay/index.md` (authored by Ankit). This records the
asset → page mapping and which images are **real betabulk captures** vs Menna's mockups.

## Screenshots — real betabulk captures (John Doe subs)

| Image | Source state | Slider / section |
|-------|--------------|------------------|
| portal-01-summary-active.png | Active sub | Self-service → What it looks like (**replaces the wrong mockup**) |
| portal-02-trialing.png | Trialing sub | Self-service → What it looks like |
| portal-03-canceled-pending-reactivation.png | Cancellation-pending sub (canceled-at-period-end) | Self-service → What it looks like |
| portal-04-expired.png | Expired sub | Self-service → What it looks like (**newly wired — step was image-less**) |
| portal-05-no-cards.png | Setup-failed sub (no card) | Self-service → What it looks like |
| recovery-01-past-due.png | Past-due sub | Retries and dunning |
| states-03-magic-link-invalid.png | Corrupted token | If a link stops working |
| cards-02-add-card.png | Add-card checkout | Managing saved cards |

## Screenshots — still Menna's mockups (kept, per review)

| Image | Why not a real capture |
|-------|------------------------|
| reactivation-01-confirm.png, cancellation-01-confirm.png, cancellation-02-reason-options.png | **Modal dialogs.** Ankit provided a cancellation-pending sub (portal-03 captured from it ✓), but the dialogs need an interactive click on the live portal, and interactive browser automation isn't viable in this environment (CDP `Page.captureScreenshot` times out; the extension viewport is capped at 360px). **Capture via Menna or a follow-up session** — the sub URLs are ready. |
| recovery-02-payment-confirmed.png | Needs a completed payment (card entry) — kept as mockup per review. |
| states-01-loading.png, states-02-magic-link-expired.png, states-04-network-error.png | Transient / can't forge a validly-signed-but-expired token / needs offline sim — kept per review. |
| notifications-01…06 | Email templates, not reachable from a subscription URL — kept per review. |

## Videos (#158914) — rebuilt from the REAL screenshots

Clips now sequence the real betabulk screenshots via the `Reel` component (see
`remotion/`), not synthetic mockups. `<VideoEmbed>` in `docs/business/autopay/index.md`:

| Clip | Section | Screens used |
|------|---------|--------------|
| setup-subscription | How it works | portal-01, notifications-01 |
| self-service-tour | Self-service page | portal-01, cards-02, recovery-01 |
| add-card-flow | Managing saved cards | portal-01, cards-02 |
| retry-to-recovery | Retries and dunning | recovery-01, recovery-02 (mockup) |
| notification-emails | Notifications | notifications-01/03/05 (mockups) |

## N/A (no dashboard this phase)

Merchant-side R3 screens (subscription as merchant sees it, list with filters) — AutoPay
is REST-API-only, no merchant dashboard (confirmed by Dacian 2026-08-13).
