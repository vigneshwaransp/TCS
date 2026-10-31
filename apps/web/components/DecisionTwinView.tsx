"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Play,
  RotateCcw,
  Sliders,
  TrendingDown,
  TrendingUp,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { api } from "../lib/api";

interface DecisionTwinProps {
  initialStoreId?: string;
  initialSku?: string;
  recId?: string;
  onSelectRecommendation?: (recId: string) => void;
  onOpenReplay?: (recId: string) => void;
  onOpenRipple?: (recId: string) => void;
  onOpenGate?: (recId: string) => void;
}

export const DecisionTwinView: React.FC<DecisionTwinProps> = ({
  initialStoreId = "STORE_001",
  initialSku = "SKU_DM_0001",
  recId,
  onSelectRecommendation,
  onOpenReplay,
  onOpenRipple,
  onOpenGate,
}) => {
  const [storeId, setStoreId] = useState(initialStoreId);
  const [sku, setSku] = useState(initialSku);

  // Scenario Controls
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);
  const [transferQuantity, setTransferQuantity] = useState(50);
  const [sourceStoreId, setSourceStoreId] = useState("STORE_002");
  const [promoDiscountPct, setPromoDiscountPct] = useState(15.0);
  const [procurementBudget, setProcurementBudget] = useState(60000.0);
  const [planningHorizon, setPlanningHorizon] = useState(7);

  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  const runSim = async () => {
    setLoading(true);
    try {
      const data = await api.runSimulation({
        store_id: storeId,
        sku: sku,
        demand_multiplier: demandMultiplier,
        transfer_quantity: transferQuantity,
        source_store_id: sourceStoreId,
        promo_discount_pct: promoDiscountPct,
        procurement_budget_inr: procurementBudget,
        planning_horizon_days: planningHorizon,
      });
      setSimulationData(data);
    } catch (err) {
      console.error("Simulation run error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, [storeId, sku, demandMultiplier, transferQuantity, sourceStoreId, promoDiscountPct, procurementBudget, planningHorizon]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Flagship Innovation 1
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Digital Simulation Environment
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Retail Decision Twin</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Simulate hypothetical retail actions before committing real purchase orders or transfers.
            Adjust demand multipliers, promotion depths, and transfer volumes in real time to observe network-wide inventory trajectories.
          </p>
        </div>

        <button
          onClick={runSim}
          disabled={loading}
          className="bg-primary hover:bg-primary-active text-white px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {loading ? "Simulating..." : "Recalculate Twin"}
        </button>
      </div>

      {/* Visual A: Interactive Retail Network Nodes */}
      <div className="bg-canvas border border-hairline rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual A: Chennai Retail Network Nodes</h2>
            <p className="text-xs text-muted">Select destination and source branches to test rebalancing routes.</p>
          </div>
          <span className="text-xs font-mono text-muted bg-surface-card px-2.5 py-1 rounded border border-hairline">
            Active Product: DMart Premia Basmati Rice (SKU_DM_0001)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              id: "STORE_001",
              name: "DMart Velachery",
              role: "Destination (Deficit)",
              onHand: 18,
              demand: Math.round(118 * demandMultiplier),
              status: "IMMINENT_STOCKOUT",
              isDestination: true,
            },
            {
              id: "STORE_002",
              name: "DMart Chromepet",
              role: "Candidate Source (Surplus)",
              onHand: 155,
              demand: 45,
              status: "HEALTHY_SURPLUS",
              isSource: true,
            },
            {
              id: "STORE_003",
              name: "DMart Virugambakkam",
              role: "Balanced Branch",
              onHand: 62,
              demand: 50,
              status: "HEALTHY",
            },
            {
              id: "STORE_004",
              name: "DMart Madipakkam",
              role: "Nearby Branch (Alt Source)",
              onHand: 78,
              demand: 40,
              status: "SURPLUS_AVAILABLE",
            },
            {
              id: "STORE_005",
              name: "DMart Kolathur",
              role: "Northern Anchor",
              onHand: 90,
              demand: 65,
              status: "HEALTHY",
            },
          ].map((node) => {
            const isSelectedDest = storeId === node.id;
            const isSelectedSrc = sourceStoreId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => {
                  if (node.isSource || node.id === "STORE_002" || node.id === "STORE_004") {
                    setSourceStoreId(node.id);
                  } else {
                    setStoreId(node.id);
                  }
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelectedDest
                    ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                    : isSelectedSrc
                    ? "bg-surface-cream-strong border-primary"
                    : "bg-surface-card border-hairline hover:bg-surface-cream-strong"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className={isSelectedDest ? "text-primary font-bold" : "text-muted"}>{node.id}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${node.status === "IMMINENT_STOCKOUT" ? "bg-status-error" : "bg-status-success"}`} />
                    <span className={node.status === "IMMINENT_STOCKOUT" ? "text-status-error font-semibold" : "text-status-success"}>
                      {node.status.split("_")[0]}
                    </span>
                  </span>
                </div>
                <div className={`font-medium text-xs ${isSelectedDest ? "text-on-dark" : "text-ink"}`}>
                  {node.name}
                </div>
                <div className={`text-[11px] mt-0.5 ${isSelectedDest ? "text-on-dark/70" : "text-muted"}`}>
                  {node.role}
                </div>

                <div className="mt-3 pt-2 border-t border-hairline/40 grid grid-cols-2 gap-1 text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-muted block">Stock</span>
                    <span className={`font-semibold ${isSelectedDest ? "text-on-dark" : "text-ink"}`}>
                      {node.onHand}u
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Demand</span>
                    <span className="text-primary font-semibold">{node.demand}u</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Controls vs Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual C: Scenario Control Panel (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-surface-card border border-hairline rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl font-normal text-ink">Visual C: Scenario Controls</h2>
            </div>
            <button
              onClick={() => {
                setDemandMultiplier(1.0);
                setTransferQuantity(50);
                setPromoDiscountPct(15.0);
                setProcurementBudget(60000.0);
              }}
              className="text-[11px] font-mono text-muted hover:text-ink flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Control 1: Demand Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-body font-medium">Demand Multiplier (Festival Footfall)</span>
              <span className="font-mono text-primary font-bold">{demandMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-hairline rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted">
              <span>0.5x (Subdued)</span>
              <span>1.0x (Normal)</span>
              <span>2.5x (Peak Surge)</span>
            </div>
          </div>

          {/* Control 2: Inter-Store Transfer Quantity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-body font-medium">Transfer Quantity from Chromepet</span>
              <span className="font-mono text-ink font-bold">{transferQuantity} units</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 bg-hairline rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted">
              <span>0 (No Transfer)</span>
              <span>50 (Recommended)</span>
              <span>100 (Max Surplus)</span>
            </div>
          </div>

          {/* Control 3: Promotion Discount */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-body font-medium">Promotion Discount Depth</span>
              <span className="font-mono text-ink font-bold">{promoDiscountPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={promoDiscountPct}
              onChange={(e) => setPromoDiscountPct(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-hairline rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted">
              <span>0% (Regular Price)</span>
              <span>15% (Planned)</span>
              <span>30% (Deep Discount)</span>
            </div>
          </div>

          {/* Control 4: Procurement Budget */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-body font-medium">Procurement Spending Budget</span>
              <span className="font-mono text-ink font-bold">₹{procurementBudget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="100000"
              step="5000"
              value={procurementBudget}
              onChange={(e) => setProcurementBudget(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-hairline rounded-lg cursor-pointer"
            />
          </div>

          {/* Dynamic Policy Advice Callout */}
          <div className="p-3.5 bg-canvas border border-hairline rounded-lg text-xs space-y-1">
            <span className="font-mono text-[10px] uppercase text-primary font-bold">Decision Twin Directive</span>
            <p className="text-body leading-relaxed font-normal">
              {simulationData?.recommended_action_under_scenario ||
                "Calculating operational recommendation under specified constraint parameters..."}
            </p>
          </div>
        </div>

        {/* Visual B: Current vs Simulated State (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-ink">Visual B: Current State vs. Simulated State</h2>
              <p className="text-xs text-muted">Comparative side-by-side delta of operational and financial consequences.</p>
            </div>
            <span className="text-xs font-mono text-primary font-bold">
              {simulationData?.summary_metrics?.stockout_reduction_pct || 0}% Stockout Reduction
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                  <th className="py-2.5 font-medium">Metric</th>
                  <th className="py-2.5 font-medium text-right">Current State</th>
                  <th className="py-2.5 font-medium text-right text-primary">Simulated State</th>
                  <th className="py-2.5 font-medium text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {simulationData?.comparison_table?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-card transition-colors">
                    <td className="py-3 font-medium text-ink">{row.metric_name}</td>
                    <td className="py-3 text-right font-mono text-muted">{row.current_state_val}</td>
                    <td className="py-3 text-right font-mono font-bold text-ink">{row.simulated_state_val}</td>
                    <td className="py-3 text-right font-mono">
                      <span
                        className={`text-xs font-semibold ${
                          row.impact_direction === "POSITIVE"
                            ? "text-status-success"
                            : row.impact_direction === "NEGATIVE"
                            ? "text-status-error"
                            : "text-muted"
                        }`}
                      >
                        {row.delta_val}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual D: Scenario Timeline (Day 1..7 Discrete Event Simulation) */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual D: Scenario Simulation Timeline</h2>
            <p className="text-xs text-muted">Daily inventory balance, consumption, arrivals, and stockouts over planning horizon.</p>
          </div>
          <span className="font-mono text-xs text-muted bg-surface-card px-2.5 py-1 rounded border border-hairline">
            7-Day Discrete Horizon
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2 font-medium">Timeline</th>
                <th className="py-2 font-medium text-right">Start Stock</th>
                <th className="py-2 font-medium text-right">Forecast Demand</th>
                <th className="py-2 font-medium text-right">Arrivals</th>
                <th className="py-2 font-medium text-right">Fulfilled</th>
                <th className="py-2 font-medium text-right text-status-error">Stockouts</th>
                <th className="py-2 font-medium text-right">Ending Stock</th>
                <th className="py-2 font-medium text-right text-primary">Cumulative Profit</th>
                <th className="py-2 font-medium pl-4">Operational Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {simulationData?.timeline?.map((pt: any) => (
                <tr key={pt.day} className="hover:bg-surface-cream-strong transition-colors">
                  <td className="py-3 font-mono font-medium text-ink">
                    Day {pt.day} <span className="text-[10px] text-muted">({pt.date})</span>
                  </td>
                  <td className="py-3 text-right font-mono">{pt.starting_inventory}u</td>
                  <td className="py-3 text-right font-mono font-semibold">{pt.forecast_demand}u</td>
                  <td className="py-3 text-right font-mono text-status-success font-semibold">
                    {pt.arrivals > 0 ? `+${pt.arrivals}u` : "—"}
                  </td>
                  <td className="py-3 text-right font-mono">{pt.consumption}u</td>
                  <td className="py-3 text-right font-mono font-bold text-status-error">
                    {pt.stockouts > 0 ? `${pt.stockouts}u` : "0"}
                  </td>
                  <td className="py-3 text-right font-mono font-bold">{pt.ending_inventory}u</td>
                  <td className="py-3 text-right font-mono font-bold text-primary">
                    ₹{pt.cumulative_profit_inr?.toLocaleString()}
                  </td>
                  <td className="py-3 pl-4 text-xs text-body font-normal">{pt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
