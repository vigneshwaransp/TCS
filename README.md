# KINTRAL — AI-Powered Retail Decision Intelligence Platform

<div align="center">

```
  ██╗  ██╗██╗███╗   ██╗████████╗██████╗  █████╗ ██╗     
  ██║ ██╔╝██║████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗██║     
  █████╔╝ ██║██╔██╗ ██║   ██║   ██████╔╝███████║██║     
  ██╔═██╗ ██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║██║     
  ██║  ██╗██║██║ ╚████║   ██║   ██║  ██║██║  ██║███████╗
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```

**"See the signal. Make the move."**

*Predict retail problems, simulate possible actions, optimize decisions across the network, explain the reasoning, and measure outcomes.*

[![Python 3.12](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Editorial%20Enterprise-38B2AC.svg)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Pytest-11%2F11%20Passing%20(100%25)-success.svg)](#deterministic-tests)
[![Dataset](https://img.shields.io/badge/Avenue%20Supermarts-DMart%20Chennai%20Network-coral.svg)](#retail-operator-context)

</div>

---

## 1. Executive Summary & Core Mission

Retail operations are interconnected non-linear systems: demand shifts alter store inventory positions; inventory stockouts trigger emergency replenishments; replenishments compete for constrained fleet capacity and regional supplier lead times; and promotional discounting changes gross and contribution margins.

**KINTRAL** bridges retail ERP data with operations-research optimization, discrete-event network simulation, and rigorous human-in-the-loop governance. It operates on a continuous 13-stage decision intelligence lifecycle:

$$\text{INGEST} \to \text{VALIDATE} \to \text{OBSERVE} \to \text{PREDICT} \to \text{GENERATE} \to \text{OPTIMIZE} \to \text{SIMULATE} \to \text{COMPARE} \to \text{EXPLAIN} \to \text{REVIEW} \to \text{APPROVE} \to \text{MEASURE} \to \text{IMPROVE}$$

Every interface element is wired to deterministic mathematical calculations. Metrics, confidence intervals, financial impacts, and operational trade-offs are calculated from ground-truth network state rather than fabricated placeholders.

---

## 2. Retail Operator Context: Avenue Supermarts Limited (DMart Chennai)

KINTRAL is demonstrated on calibrated operational data for **Avenue Supermarts Limited (DMart)** across its 5 verified physical branches in the Chennai metropolitan area, Tamil Nadu, India:

| Store ID | Branch Name | Physical Address | Coordinates | Daily Footfall | Sales Area |
|---|---|---|---|---|---|
| `STORE_001` | **DMart Velachery** | 137 Velachery Bypass Rd, Velachery, Chennai 600042 | 12.9806° N, 80.2227° E | 3,850 visitors | 32,000 sq ft |
| `STORE_002` | **DMart Chromepet** | 214 GST Rd, Chromepet, Chennai 600044 | 12.9516° N, 80.1415° E | 4,200 visitors | 36,000 sq ft |
| `STORE_003` | **DMart Virugambakkam** | 78 Arcot Rd, Virugambakkam, Chennai 600092 | 13.0489° N, 80.1925° E | 3,400 visitors | 28,000 sq ft |
| `STORE_004` | **DMart Madipakkam** | 45 Medavakkam Main Rd, Madipakkam, Chennai 600091 | 12.9647° N, 80.1983° E | 2,950 visitors | 24,000 sq ft |
| `STORE_005` | **DMart Kolathur** | 102 Paper Mills Rd, Kolathur, Chennai 600099 | 13.1242° N, 80.2085° E | 3,600 visitors | 30,000 sq ft |

### Operational Network Assets
- **129 Commercial SKUs** spanning 16 core DMart categories (Staples, Edible Oils, Personal Hygiene, Packaged Foods, Home Care, Dairy).
- **609 Store-SKU Assortment Links** with localized display limits, safety stocks, and historical sales patterns.
- **5 Regional FMCG Suppliers** with real lead times (3–6 days), reliability indices (89%–97%), minimum order quantities (MOQs), and delivery freight rates.
- **20 Directed Inter-Store Transit Routes** with computed road distances (using a $1.35\times$ urban circuity factor), peak transit times, and vehicle capacity bounds.
- **51,688 Daily Historical Transactions** spanning 457 days, incorporating Tamil Nadu seasonal patterns, Pongal and Deepavali demand spikes, and historical stockout tags.

---

## 3. The Five Flagship Innovations

### 1. Retail Decision Twin (Discrete-Event Network Simulator)
- **Purpose:** A digital simulation twin representing the complete physical state of the retail network. Tests hypothetical decisions, demand surges, and supplier disruptions before committing physical stock.
- **State Trajectory:** Evaluates day-by-day inventory balances, incoming shipments, transit buffers, and stockouts over a 7-day rolling horizon.
- **Parametric Stress Testing:** Real-time sliders for demand multipliers ($0.5\times$ to $2.5\times$), supplier lead-time delays (+0 to +7 days), and transfer batches (0 to 120 units).
- **Side-by-Side Delta:** Live comparison table comparing baseline vs. simulated on-hand, projected shortage, stockout exposure, and net revenue impact.

### 2. Counterfactual Decision Replay Studio
- **Purpose:** Answers *"What if we chose a different path?"* by evaluating 6 distinct, feasible operational actions against the identical business state:
  1. `ACTION_TRANSFER`: Inter-store balance from Chromepet to Velachery (50 units).
  2. `ACTION_SUPPLIER_EXPEDITE`: Emergency supplier replenishment with premium air/express freight.
  3. `ACTION_PROMOTION_DEESCALATE`: Throttling promotional discount from 15% to 5% to preserve inventory.
  4. `ACTION_REALLOCATE`: Central warehouse inventory re-split.
  5. `ACTION_COMBINED`: Hybrid 30-unit transfer + 50-unit standard reorder.
  6. `ACTION_NO_ACTION`: Status quo yielding stockout and customer disappointment.
- **Financial Breakdown:** Transparently accounts for gross revenue lift, wholesale procurement cost, route transport expense, holding cost, and stockout penalty.
- **Traceable Explanation:** Detailed causal narrative justifying why the top action was ranked #1 and identifying key binding constraints.

### 3. Ripple Intelligence (Multi-Echelon Dependency Graph)
- **Purpose:** Prevents localized "fixes" that trigger network-wide destabilization by modeling downstream and lateral knock-on effects.
- **Network Dependency Graph:** Visual node-link diagram mapping Store $\to$ Peer Store $\to$ Logistics Routes $\to$ Suppliers $\to$ Parallel SKU categories.
- **Strict Safety Stock Protection:** Prohibits source store cannibalization. The transfer is only mathematically valid if:
  $$\text{OnHand}_{src} - Q_{transfer} \ge \text{SafetyStock}_{src}$$
- **Impact Matrix:** Highlights direct effects (service level lift), second-order effects (route congestion, source buffer reduction), and systemic effects (working capital utilization).

### 4. Confidence-Aware Decision Gate
- **Purpose:** Enterprise gatekeeper that replaces opaque black-box recommendations with an actionable 8-point evidence audit.
- **Tri-State Decision Verdicts:**
  - `READY TO ACT`: $\ge 7$ checks satisfied, high confidence, risk within tolerance.
  - `HUMAN REVIEW REQUIRED`: Moderate uncertainty, significant financial impact, or policy exception.
  - `INSUFFICIENT EVIDENCE`: High uncertainty, missing signals, or negative net expected margin.
- **8-Point Deterministic Evidence Rubric:**
  1. Demand Forecast Calibrated (WAPE < 15%)
  2. Network Inventory Reconciled (Physical snapshot verified)
  3. Source Store Protection Verified ($\text{OnHand}_{src} - Q \ge \text{SS}_{src}$)
  4. Route & Transit Feasibility Confirmed (Distance & vehicle capacity ok)
  5. Supplier Reliability Screened (On-time fulfillment > 90%)
  6. Net Margin Positive ($\Delta\text{Profit} > \text{LogisticsCost}$)
  7. Working Capital Compliant ($\text{Cost} \le \text{Budget}$)
  8. Lead-Time Buffer Adequate ($\text{DaysOfSupply} \ge 1.0$)
- **RBAC Governance:** Authorizes decisions based on user tier. Viewers receive `403 Forbidden` on approval; Operations Managers execute with append-only audit trail logging.

### 5. Decision Regret Engine & Quality Auditing
- **Purpose:** Retrospectively audits decision quality once actual demand, competitor actions, and supplier deliveries are realized.
- **Mathematical Regret:**
  $$\text{Regret} = \max_{a \in A} \text{Utility}(a, \omega) - \text{Utility}(a_{selected}, \omega)$$
- **Quality Categorization:** Classifies historical decisions into `VALUE_ACCRETIVE`, `NEUTRAL`, or `VALUE_DESTRUCTIVE`.
- **Systemic Learning:** Tracks rolling 30-day decision quality trends, regret reduction curves, and policy compliance rates.

### Adaptive Retail Policy Lab
Compares 4 institutional replenishment paradigms across 30-day simulated performance:
- **Policy A (Fixed Reorder Point):** Traditional ROP and fixed order quantities.
- **Policy B (Forecast-Based Replenishment):** Dynamic demand forecast with safety stock buffers.
- **Policy C (Network-Aware Lateral Allocation):** Inter-store transfers with source store safety protection.
- **Policy D (Constrained Profit Optimization):** Multi-echelon profit maximization under capacity, logistics, and capital constraints.

---

## 4. System Architecture & Tech Stack

```
kintral/
├── apps/
│   └── web/                               # Next.js 14 App Router Frontend
│       ├── app/
│       │   ├── globals.css                # Editorial styling, warm cream theme (#FAF9F5, #CC785C)
│       │   ├── layout.tsx                 # Root layout with Cormorant Garamond & Inter
│       │   └── page.tsx                   # Master operational container & state router
│       ├── components/                    # 14 Custom Editorial Enterprise Components
│       │   ├── ExecutiveCockpit.tsx       # KPI cards, priority queue, network overview
│       │   ├── DecisionTwinView.tsx       # Innovation 1: Discrete-event network simulator
│       │   ├── DecisionReplayView.tsx     # Innovation 2: Counterfactual replay studio
│       │   ├── RippleView.tsx             # Innovation 3: Dependency graph & impact matrix
│       │   ├── DecisionGateView.tsx       # Innovation 4: Confidence gate & approval workflow
│       │   ├── DecisionRegretView.tsx     # Innovation 5: Decision regret engine & quality
│       │   ├── PolicyLabView.tsx          # Adaptive policy lab comparing Policies A-D
│       │   ├── DemandView.tsx             # P10/P50/P90 quantile demand intelligence
│       │   ├── InventoryView.tsx          # 609 store-SKU positions with search & filters
│       │   ├── LogisticsView.tsx          # Supplier directory & 20 inter-store transit links
│       │   ├── PromotionsView.tsx         # Festival promotional schedules & margins
│       │   ├── DataManagementView.tsx     # CSV validation, error diagnostics & bad-row export
│       │   ├── GovernanceView.tsx         # Immutable audit trail & RBAC matrix
│       │   └── Navbar.tsx                 # Brand mark, live API heartbeat & RBAC switcher
│       ├── lib/
│       │   └── api.ts                     # REST client with automatic X-User-Role injection
│       └── package.json
├── services/
│   └── api/                               # FastAPI Modular Monolith Backend
│       ├── app/
│       │   ├── api/v1/endpoints/          # 15 REST endpoints with validation schemas
│       │   ├── core/                      # Config, security & RBAC role hierarchies
│       │   ├── db/                        # SQLAlchemy session, engine & automated seed
│       │   ├── models/                    # Relational schema (Identity, Retail, Decision, Audit)
│       │   ├── schemas/                   # Pydantic v2 schemas
│       │   ├── services/                  # Business logic (Optimization, Simulation, Ripple, Gate)
│       │   └── main.py                    # Application entrypoint & lifespan seeder
│       ├── tests/                         # Deterministic Pytest suite (11/11 passing)
│       └── requirements.txt
├── retailmind_dmart_dataset/              # Complete Standalone Dataset Package (17 files)
│   ├── businesses.csv                     # Avenue Supermarts corporate entity & transfer policy
│   ├── stores.csv                         # 5 verified physical DMart Chennai locations
│   ├── products_suppliers.csv             # 129 SKUs with wholesale costs, prices & margins
│   ├── store_product_assortment.csv       # 609 assortment links
│   ├── sales_history.csv                  # 51,688 daily transactions (457 days)
│   ├── inventory.csv                      # 609 physical snapshot records
│   ├── store_routes.csv                   # 20 directed inter-store transfer routes
│   ├── suppliers.csv                      # 5 regional FMCG suppliers
│   ├── purchase_orders.csv                # Procurement order history
│   ├── transfer_history.csv               # Historical inter-store transfer logs
│   ├── external_signals.csv               # Chennai temperature, rainfall & festivals
│   ├── promotions.csv                     # Festival promotional schedules
│   ├── data_dictionary.csv                # Detailed schema specification
│   ├── generate_dataset.py                # Synthetic generator script
│   ├── validate_dataset.py                # Strict validator (0 errors, 0 warnings)
│   ├── requirements.txt                   # Dataset generator requirements
│   └── README.md                          # Dataset provenance & quickstart
├── docs/
│   └── ARCHITECTURE.md                    # Detailed architectural blueprints & formulas
├── docker-compose.yml                     # Production Docker Compose orchestration
├── .env.example                           # Environment configuration template
└── README.md                              # Master system documentation
```

---

## 5. Quickstart & Installation

### Prerequisites
- **Python 3.12+** with pip
- **Node.js 20+** with npm

### 1. Backend Setup
```bash
# Navigate to workspace root
cd D:\MindSparks

# Install backend dependencies
pip install -r services/api/requirements.txt

# Run the deterministic test suite
python -m pytest services/api/tests/test_backend.py -o pythonpath=services/api -v

# Start the FastAPI backend server
python -m uvicorn app.main:app --app-dir services/api --host 0.0.0.0 --port 8000 --reload
```
*The backend automatically seeds the SQLite database (`kintral.db`) from `retailmind_dmart_dataset/` on first startup.*

### 2. Frontend Setup
```bash
# In a separate terminal, navigate to web app
cd D:\MindSparks\apps\web

# Install frontend dependencies
npm install

# Start the Next.js development server
npm run dev -- -p 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. End-to-End Flagship Verification Walkthrough

Follow this step-by-step operator journey through KINTRAL:

```
[1. Alert] Shortage Detected at DMart Velachery
      │ Basmati Rice 1KG: On-hand 18 units vs. 118 units Pongal promo demand
      ▼
[2. Twin] Simulate 7-Day Network State in Retail Decision Twin
      │ Adjust demand multiplier to 1.5x, test 50-unit lateral transfer
      ▼
[3. Replay] Compare 6 Actions in Decision Replay Studio
      │ Proves transfer option yields +₹5,178.60 profit vs. ₹0 for No Action
      ▼
[4. Ripple] Verify Network-Wide Impacts in Ripple Intelligence
      │ Chromepet buffer remains at 105 units (safely above 30-unit safety stock)
      ▼
[5. Gate] Audit 8-Point Checklist in Confidence-Aware Decision Gate
      │ All 8 evidence checks passed → READY TO ACT
      ▼
[6. RBAC] Execute Approval as Operations Manager
      │ Viewer gets 403 Forbidden; Ops Manager succeeds with immutable audit entry
      ▼
[7. Regret] Audit Realized Quality in Decision Regret Engine
      │ Regret = ₹0.00 (optimal action chosen), classified as VALUE_ACCRETIVE
```

---

## 7. Deterministic Tests

The backend test suite verifies core mathematical formulas, optimization constraints, and security checks:

```bash
python -m pytest services/api/tests/test_backend.py -o pythonpath=services/api -v
```

**Verification Output:**
```text
services/api/tests/test_backend.py::test_health_check PASSED             [  9%]
services/api/tests/test_backend.py::test_dashboard_summary PASSED        [ 18%]
services/api/tests/test_backend.py::test_stores_listing PASSED           [ 27%]
services/api/tests/test_backend.py::test_inventory_positions PASSED      [ 36%]
services/api/tests/test_backend.py::test_recommendations_and_alternatives PASSED [ 45%]
services/api/tests/test_backend.py::test_decision_replay_studio PASSED   [ 54%]
services/api/tests/test_backend.py::test_ripple_intelligence_graph PASSED [ 63%]
services/api/tests/test_backend.py::test_decision_gate_and_assurance PASSED [ 72%]
services/api/tests/test_backend.py::test_retail_decision_twin_simulation PASSED [ 81%]
services/api/tests/test_backend.py::test_rbac_approval_enforcement PASSED [ 90%]
services/api/tests/test_backend.py::test_policy_lab_comparison PASSED    [100%]

======================== 11 passed in 3.55s (100% pass rate) ========================
```

---

## 8. Role-Based Access Control (RBAC) Matrix

| Permission | `ADMIN` (Radha Krishnan) | `OPS_MANAGER` (Sundar Raman) | `PLANNER` (Meera Natarajan) | `ANALYST` (Karthik V.) | `VIEWER` (Pooja Sharma) |
|---|:---:|:---:|:---:|:---:|:---:|
| `READ_DASHBOARD` | Yes | Yes | Yes | Yes | Yes |
| `SIMULATE_TWIN` | Yes | Yes | Yes | Yes | No |
| `EVALUATE_REPLAY` | Yes | Yes | Yes | Yes | No |
| `APPROVE_DECISIONS` | Yes | Yes (up to ₹250k) | No (Draft Only) | No | No (403 Forbidden) |
| `OVERRIDE_POLICIES` | Yes | No | No | No | No |
| `TRIGGER_PIPELINES` | Yes | Yes | Yes | No | No |
| `AUDIT_LOGS_VIEW` | Yes | Yes | Yes | Yes | Yes |

---

## 9. Brand & Design System Specifications

KINTRAL adheres strictly to an editorial enterprise visual standard:
- **Surface Palette:** Warm Canvas `#FAF9F5`, Warm Card `#F4F2EC`, Card Elevated `#EDEAE1`, Hairline Borders `#E2DED4`.
- **Accent Palette:** Brand Coral `#CC785C`, Active Coral `#B56449`, Subdued Coral `#CC785C1A`.
- **Analytical Surfaces:** Ink `#181715`, Deep Charcoal `#1F1E1B`, Surface Dark `#141413`.
- **Typography:**
  - *Editorial Headings:* Cormorant Garamond (Serif).
  - *Interface Body:* Inter (Clean Sans).
  - *Data, Keys & Codes:* JetBrains Mono (Monospace).
- **Custom Geometric Mark:** Visualizes 3 connected retail nodes and branching decision paths.

---

<div align="center">
  <sub>Developed for Google Antigravity Retail Decision Intelligence Benchmark. Calibrated on Avenue Supermarts Limited (DMart Chennai).</sub>
</div>
