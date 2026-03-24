---
title: Payment Routing
sidebar_label: Payment Routing
---

# Payment Routing

**Route every card payment to the best path.** Ottu Router evaluates each payment in real time — BIN, country, scheme, amount, recent health, and fees — and sends it through the payment connection most likely to succeed at the best cost, with a safe fallback.

:::note
**Payment Connection** refers to your acquiring/gateway connection used to process a payment.
:::

## Why It Matters

| Benefit | Description |
|---------|-------------|
| **Higher Success** | Routes to the best-performing connection |
| **Cost Efficiency** | Steers to lower-fee connections to cut processing costs |
| **Customer Satisfaction** | Faster, more successful checkouts improve the experience |
| **Scalability** | Adapts to volume spikes and new markets without manual tuning |
| **Risk Mitigation** | Avoids single-point dependence by switching based on real-time health |
| **Market Expansion** | Prefers local connections to improve cross-border approvals |

## How It Works

Ottu Router runs each payment through four clear stages:

> **Payment** → **Blockers** → **Routing Rules** → **Routing Strategies** → *(Chosen Payment Connection | Fallback)* → **Processor**

- **Blockers:** Guardrails that can stop a payment outright
  - Blocks or allows transactions by card BIN range
  - Controls transactions by issuing country
  - Filters by card network (e.g., Visa, Mastercard)
- **Routing Rules:** Decide which payment connections to route the payment through
  - Routes by BIN match
  - Routes by issuing country
  - Routes by card type (Visa, Mastercard)
  - Backup route if no match (fallback)
- **Routing Strategies:** Pick the best payment connection from the eligible set
- **Fallback:** If no payment connection qualifies, route to the default connection

:::warning
The Router always logs its decision: which blockers applied, which connections were eligible, which strategy was used, and why the final connection was chosen.
:::

## Blocker Rules

These rules filter transactions before routing begins.

| Blocker | Description |
|---------|-------------|
| **BIN Access Control** | Allows or blocks transactions based on the card's BIN range |
| **Geographic Restriction** | Restricts or permits transactions based on card-issuing countries |
| **Card Scheme Restriction** | Filters transactions by supported card networks such as Visa or Mastercard |

## Routing Rules

These rules assign valid transactions to the correct payment connection.

| Rule | Description |
|------|-------------|
| **BIN-Based Routing** | Routes a transaction to a specific payment connection based on BIN match |
| **Country-Based Routing** | Directs transactions to payment connections depending on the card's issuing country |
| **Supported Schemes** | Routes based on card type like Visa or Mastercard |
| **Fallback Routing** | Acts as a backup route when no other rule matches |

## Routing Strategies

Once the Router finds valid payment connections, selection strategies decide how to pick the best one.

### Multi-Selection Strategies

These consider several payment connections and select based on rule logic.

| Strategy | Description |
|----------|-------------|
| **Exclude Unavailable** | Removes connections with too many recent errors. Can blacklist for hours or until midnight. Automatically expires after a set time |
| **Transaction Size** | Routes based on transaction value. Each connection can have a minimum and maximum amount |
| **Country Based** | Routes payments based on card country issuer/acquirer |
| **Currency Based** | Routes payments based on acquirer payment connection vs card currency |

### Single-Selection Strategies

These narrow immediately to one best payment connection.

| Strategy | Description |
|----------|-------------|
| **Distribution** | Distributes traffic by fixed percentages across connections. Example: `KNET1` 20%, `KNET2` 50%, `KNET3` 30% |
| **Success Rate** | Picks the connection with the highest recent approval rate |
| **Cost-Optimized** | Picks the connection with the lowest effective fee |
| **Round Robin** | Distributes transactions evenly across connections by cycling through gateways |
| **Fallback** | Acts as a safety net — sends to a default connection if no other options are available |

## FAQ

**What happens when a transaction exceeds the set maximum amount?**
It will be rerouted according to the configured routing rules or fallback option.

**How does Round Robin distribute transactions?**
It distributes transactions evenly across multiple payment connections, ensuring balanced load by sequentially cycling through available gateways.

**What is the purpose of a Fallback option?**
The Fallback option ensures transactions still get processed by sending them to a default payment connection if no other connections are available.

**How does BIN-Based Routing work?**
It directs a transaction to a specific payment connection based on the card's BIN (Bank Identification Number). If a match is found, the transaction is routed accordingly.

**How does Country-Based Routing work?**
It uses the issuing country of the card to determine the payment connection. Transactions are routed to gateways configured for that specific country.

**What happens if no routing rule matches?**
The system triggers the Fallback Routing option to ensure the transaction is processed by a default connection.

## What's Next?

- **[Payment Gateways](/docs/business/payments/gateways)** — Browse all supported gateways
- **[Currencies](/docs/business/payments/currencies)** — Multi-currency exchange configuration
- **[Settings](/docs/business/settings/)** — Configure global settings and webhooks
