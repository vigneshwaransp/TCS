# KINTRAL System Architecture & Algorithmic Foundations

**Product:** KINTRAL  
**Category:** Retail Decision Intelligence  
**Tagline:** See the signal. Make the move.  
**Core Promise:** Predict retail problems, simulate possible actions, optimize decisions across the network, explain the reasoning, and measure outcomes.

---

## 1. System Topology & Data Flow

```
INGEST → VALIDATE → OBSERVE → PREDICT → GENERATE ACTIONS → OPTIMIZE → SIMULATE → COMPARE → EXPLAIN → REVIEW → APPROVE → MEASURE → IMPROVE
```

KINTRAL operates as a cohesive, modular monolith designed for sub-second deterministic decision intelligence. The platform bridges transactional ERP snapshots with operations research models and human governance.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14 App Router)                │
│  Executive Cockpit  |  Decision Twin  |  Replay Studio  |  Ripple Net  │
│  Decision Gate      |  Regret Engine  |  Policy Lab     |  Audit Logs  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON / REST / X-User-Role (RBAC)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (FastAPI)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (/api/v1/*)                         │  │
│  │  /decisions  /simulations  /replay  /ripple  /decision-gate     │  │
│  │  /decision-quality  /policies  /data  /audit-logs  /health       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────▼───────────────────────────────┐  │
│  │                   Decision Intelligence Engines                  │  │
│  │  • Discrete-Event Network Simulator (7-day daily time buckets)   │  │
│  │  • Constrained Optimization Engine (SciPy/OR-Tools linear)       │  │
│  │  • Ripple Intelligence Graph Analyzer (Multi-echelon cascade)    │  │
│  │  • Confidence-Aware Decision Gate (8-point evidence checklist)   │  │
│  │  • Decision Regret Engine (Counterfactual utility loss)          │  │
│  │  • Adaptive Retail Policy Lab (4-way policy comparison)          │  │
│  │  • Quantile Demand Forecaster (P10/P50/P90 + Promo Elasticity)   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────▼───────────────────────────────┐  │
│  │                 Persistence Layer (SQLAlchemy 2.x)               │  │
│  │  Stores | Products | Inventory | Decisions | Audits | Quality    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    kintral.db (SQLite / PG)   │
                      │  DMart Chennai Retail Dataset │
                      │  5 Stores | 129 SKUs | Routes │
                      └───────────────────────────────┘
```

---

## 2. Mathematical Formulations & Optimization

### 2.1 Net Inventory Position
For store $s$ and SKU $k$ at time $t$:
$$\text{NetPosition}_{s,k,t} = \text{OnHand}_{s,k,t} + \text{Incoming}_{s,k,t} - \text{Reserved}_{s,k,t}$$

$$\text{DaysOfSupply}_{s,k,t} = \frac{\text{OnHand}_{s,k,t}}{\bar{D}_{s,k}}$$
where $\bar{D}_{s,k}$ is the forecast mean daily demand over the planning horizon.

### 2.2 Reorder Point (ROP) & Safety Stock
$$\text{SS}_{s,k} = Z_{\alpha} \times \sqrt{\bar{L}_{s,k} \cdot \sigma_D^2 + \bar{D}_{s,k}^2 \cdot \sigma_L^2}$$
$$\text{ROP}_{s,k} = (\bar{D}_{s,k} \times \bar{L}_{s,k}) + \text{SS}_{s,k}$$
where:
- $Z_{\alpha} = 1.645$ (for 95% service level) or $1.96$ (for 97.5% service level).
- $\bar{L}_{s,k}$ is average lead time in days.
- $\sigma_D$ is demand variance; $\sigma_L$ is supplier lead-time variance.

### 2.3 Constrained Multi-Store Optimization Objective
KINTRAL maximizes net expected network margin subject to operational constraints:
$$\max_{\mathbf{x}} \sum_{s \in S} \sum_{k \in K} \left[ \text{Revenue}(x_{s,k}) - \text{ProcurementCost}(x_{s,k}) - \text{LogisticsCost}(x_{s,k}) - \text{HoldingCost}(x_{s,k}) - \text{StockoutPenalty}(x_{s,k}) \right]$$

**Subject to:**
1. **Source Safety Stock Protection:**
   $$\text{OnHand}_{s_{source}, k} - x_{transfer} \ge \text{SafetyStock}_{s_{source}, k}$$
   *No store is permitted to starve its own local buffer to replenish a peer.*
2. **Vehicle Capacity & Minimum Order Quantity:**
   $$x_{transfer} \le \text{MaxVehicleCapacity} \quad (500 \text{ units})$$
   $$x_{supplier} \ge \text{MOQ}_{supplier} \quad (100 \text{ units for SUP\_001})$$
3. **Budget Feasibility:**
   $$\sum \text{UnitCost}_k \times x_{s,k} \le \text{AvailableWorkingCapital}$$
4. **Shelf & Storage Capacity:**
   $$\text{OnHand}_{s,k} + x_{s,k} \le \text{MaxDisplayCapacity}_{s,k}$$

---

## 3. The Five Flagship Innovations

### Innovation 1: Retail Decision Twin
- **Simulation Paradigm:** Discrete-event daily consumption with dynamic replenishment arrivals.
- **State Trajectory:** At day $d \in \{1 \dots 7\}$:
  $$\text{EndingInventory}_d = \max\left(0, \text{StartingInventory}_d + \text{Arrivals}_d - \text{Demand}_d\right)$$
  $$\text{LostSales}_d = \max\left(0, \text{Demand}_d - (\text{StartingInventory}_d + \text{Arrivals}_d)\right)$$
- **Scenario Testing:** Live parametric overrides for demand multipliers ($0.5\times$ to $2.5\times$), lead-time delays (+0 to +7 days), and transfer batches (0 to 120 units).

### Innovation 2: Counterfactual Decision Replay Studio
Compares 6 strictly evaluated alternative actions against the baseline:
1. `ACTION_TRANSFER`: Inter-store balance from Chromepet to Velachery (50 units).
2. `ACTION_SUPPLIER_EXPEDITE`: Emergency supplier reorder with air/express freight.
3. `ACTION_PROMOTION_DEESCALATE`: Throttle Pongal discount from 15% to 5% to suppress demand run-rate.
4. `ACTION_REALLOCATE`: Central warehouse split.
5. `ACTION_COMBINED`: Hybrid 30-unit transfer + 50-unit standard reorder.
6. `ACTION_NO_ACTION`: Status quo yielding stockout and revenue loss.

### Innovation 3: Ripple Intelligence
Multi-echelon causal graph modeling network interdependencies:
- **Direct Impacts:** Destination store inventory uplift, source store buffer decrement.
- **Second-Order Impacts:** Logistics route congestion, vehicle utilization, supplier lead-time elasticity.
- **Third-Order Impacts:** Cross-category cannibalization and promotional spillover.

### Innovation 4: Confidence-Aware Decision Gate
Tri-state decision gating based on an 8-point deterministic rubric:
- `READY TO ACT`: $\ge 7$ checks passed, high confidence, risk within tolerance.
- `HUMAN REVIEW REQUIRED`: Moderate uncertainty, significant financial impact, or policy exception.
- `INSUFFICIENT EVIDENCE`: High uncertainty, missing signals, or negative net expected margin.

**8-Point Evidence Rubric:**
1. Demand Forecast Calibrated (WAPE < 15%)
2. Network Inventory Reconciled (Physical snapshot verified)
3. Source Store Protection Verified ($\text{OnHand}_{src} - Q \ge \text{SS}_{src}$)
4. Route & Transit Feasibility Confirmed (Distance & vehicle capacity ok)
5. Supplier Reliability Screened (On-time fulfillment > 90%)
6. Net Margin Positive ($\Delta\text{Profit} > \text{LogisticsCost}$)
7. Working Capital Compliant ($\text{Cost} \le \text{Budget}$)
8. Lead-Time Buffer Adequate ($\text{DaysOfSupply} \ge 1.0$)

### Innovation 5: Decision Regret Engine
Quantifies decision quality retrospectively:
$$\text{Counterfactual Regret} = \max_{a \in A} \text{Utility}(a, \omega) - \text{Utility}(a_{selected}, \omega)$$
where $\omega$ is the realized state of demand, supplier delays, and competitor prices.
Classifies outcomes as `VALUE_ACCRETIVE`, `NEUTRAL`, or `VALUE_DESTRUCTIVE`.

---

## 4. Security & Role-Based Access Control (RBAC)

| Role | Hierarchy | Permissions | Approval Rights |
|---|---|---|---|
| `ADMIN` | Tier 1 (VP Operations) | Full System Access, All Approvals, Configuration | Unlimited |
| `OPS_MANAGER` | Tier 2 (Store Operations) | Approve Transfers, Reroute Shipments, Override Promotions | $\le$ ₹250,000 |
| `PLANNER` | Tier 3 (Supply Chain Planner) | Generate Directives, Run Simulations, Adjust Baselines | Draft / Propose Only |
| `ANALYST` | Tier 4 (Data Scientist) | Inspect Forecasts, Stress Test, Audit Algorithms | Read + Simulate Only |
| `VIEWER` | Tier 5 (Auditor / Executive) | Read-Only Network Visibility | Read Only (403 on Approve) |

All authorization decisions are cryptographically verified and recorded in the append-only `audit_logs` table with timestamp, user ID, role, action, and JSON payload diff.
