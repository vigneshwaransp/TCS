"use client";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Sliders,
  Check,
  X,
  RefreshCw,
  Info,
} from "lucide-react";
import { api } from "../lib/api";

interface ReplayProps {
  recId?: string;
  onOpenGate: (recId: string) => void;
  onOpenRipple: (recId: string) => void;
}

export const DecisionReplayView: React.FC<ReplayProps> = ({
  recId = "REC_001",
  onOpenGate,
  onOpenRipple,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);

  // Scenario modifiers
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);
  const [budgetLimit, setBudgetLimit] = useState(60000.0);
  const [transferCost, setTransferCost] = useState<number | undefined>(undefined);

  const fetchReplay = async () => {
    setLoading(true);
    try {
      const res = await api.getDecisionReplay(recId, demandMultiplier, budgetLimit, transferCost);
      setData(res);
    } catch (err) {
      console.error("Failed to load decision replay:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplay();
  }, [recId, demandMultiplier, budgetLimit, transferCost]);

  const selectedAlternative = data?.alternatives?.[selectedActionIndex] || data?.selected_best_action;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Flagship Innovation 2
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Counterfactual Decision Replay Studio
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Decision Replay Studio</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Compare multiple possible actions under identical starting conditions, lead times, and cost structures.
            Answer: <em>What would happen if the retailer chose a different action?</em>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenGate(recId)}
            className="bg-primary hover:bg-primary-active text-white px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Decision Assurance Gate
          </button>
          <button
            onClick={() => onOpenRipple(recId)}
            className="bg-surface-card hover:bg-surface-cream-strong border border-hairline text-ink px-3.5 py-2 rounded-md text-xs font-medium transition"
          >
            Inspect Ripple Effects
          </button>
        </div>
      </div>

      {/* Visual A: Decision Comparison Cards (All 6 Alternatives) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual A: Feasible Decision Alternatives</h2>
            <p className="text-xs text-muted">Ranked by expected contribution profit under operational constraints.</p>
          </div>
          <span className="font-mono text-xs text-muted">Select a card to inspect its detailed trajectory below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {data?.alternatives?.map((alt: any, idx: number) => {
            const isSelected = selectedActionIndex === idx;
            const isPreferred = alt.is_preferred;
            const isFeasible = alt.feasibility_status === "FEASIBLE";

            return (
              <div
                key={idx}
                onClick={() => setSelectedActionIndex(idx)}
                className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                    : isPreferred
                    ? "bg-surface-cream-strong border-primary"
                    : isFeasible
                    ? "bg-surface-card border-hairline hover:bg-surface-cream-strong"
                    : "bg-surface-card border-hairline opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        isPreferred
                          ? "bg-primary text-white"
                          : isFeasible
                          ? "bg-canvas border border-hairline text-status-success font-medium"
                          : "bg-canvas border border-hairline text-status-error font-medium"
                      }`}
                    >
                      {isPreferred ? "OPTIMAL" : isFeasible ? "FEASIBLE" : "INFEASIBLE"}
                    </span>
                    <span className={isSelected ? "text-primary font-bold" : "text-muted"}>Alt #{idx + 1}</span>
                  </div>

                  <h3 className={`font-serif text-sm font-medium leading-snug line-clamp-2 ${isSelected ? "text-on-dark" : "text-ink"}`}>
                    {alt.action_title}
                  </h3>

                  <div className="mt-3 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Profit:</span>
                      <span className={`font-bold ${isSelected ? "text-primary" : "text-ink"}`}>
                        ₹{alt.expected_contribution_profit_inr?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Cost:</span>
                      <span className={isSelected ? "text-on-dark" : "text-body"}>
                        ₹{alt.incremental_cost_inr?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Shortage:</span>
                      <span className={alt.projected_stockout_exposure > 0 ? "text-status-error font-bold" : "text-status-success font-semibold"}>
                        {alt.projected_stockout_exposure}u
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Service:</span>
                      <span className={isSelected ? "text-on-dark font-bold" : "text-ink font-semibold"}>
                        {alt.service_level_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {alt.infeasibility_reason ? (
                  <div className="mt-3 pt-2 border-t border-hairline/40 text-[10px] text-status-error line-clamp-2">
                    {alt.infeasibility_reason}
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-hairline/40 text-[10px] text-muted line-clamp-2 font-mono">
                    {alt.proposed_quantity > 0 ? `${alt.proposed_quantity} units proposed` : "0 units dispatch"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual D: Decision Replay Timeline (Horizontal Pipeline) */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-normal text-ink">Visual D: Decision Replay Timeline Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            {
              step: "1. Initial State",
              desc: "On-hand 18u at Velachery; Surge demand 118u",
              badge: "Audited Snapshot",
            },
            {
              step: "2. Proposed Action",
              desc: selectedAlternative?.action_title || "Transfer Dispatch",
              badge: `${selectedAlternative?.proposed_quantity || 50} units`,
            },
            {
              step: "3. Inventory Movement",
              desc: "14.2 km via GST Road (52 min arterial transit)",
              badge: "Tata Ace LCV",
            },
            {
              step: "4. Demand Fulfilment",
              desc: `${selectedAlternative?.service_level_pct || 95}% consumer orders met`,
              badge: "Pongal Promo",
            },
            {
              step: "5. Projected Outcome",
              desc: `Contribution Profit: ₹${selectedAlternative?.expected_contribution_profit_inr?.toLocaleString()}`,
              badge: "Net Margin Protected",
            },
          ].map((s, i) => (
            <div key={i} className="bg-surface-card border border-hairline rounded-lg p-3.5 relative">
              <div className="text-[10px] font-mono text-primary font-bold uppercase">{s.step}</div>
              <div className="text-xs font-medium text-ink mt-1">{s.desc}</div>
              <span className="inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded bg-canvas border border-hairline text-muted">
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual B: Financial Outcome Breakdown & Visual E: Traceable Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual B: Financial Outcome Comparison Table (Left 6 Cols) */}
        <div className="lg:col-span-6 bg-surface-card border border-hairline rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-ink">Visual B: Financial Outcome Comparison</h2>
              <p className="text-xs text-muted">Expected profit vs incremental operational dispatch costs.</p>
            </div>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                  <th className="py-2.5 font-medium">Candidate Action</th>
                  <th className="py-2.5 font-medium text-right">Profit (INR)</th>
                  <th className="py-2.5 font-medium text-right">Cost (INR)</th>
                  <th className="py-2.5 font-medium text-right">Shortage</th>
                  <th className="py-2.5 font-medium text-right">Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {data?.financial_comparison?.map((row: any, i: number) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedActionIndex(i)}
                    className={`cursor-pointer transition-colors ${
                      row.is_preferred ? "bg-surface-cream-strong font-semibold" : "hover:bg-surface-cream-strong"
                    }`}
                  >
                    <td className="py-3 text-ink flex items-center gap-1.5">
                      {row.is_preferred && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      <span className="line-clamp-1">{row.action}</span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-primary">
                      ₹{row.profit?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-muted">
                      ₹{row.cost?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {row.stockout_units > 0 ? (
                        <span className="text-status-error font-semibold">{row.stockout_units}u</span>
                      ) : (
                        <span className="text-status-success font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-ink">{row.service_level}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual E: Traceable Recommendation Explanation (Right 6 Cols) */}
        <div className="lg:col-span-6 bg-canvas border border-hairline rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-ink">Visual E: Traceable Explanation</h2>
              <p className="text-xs text-muted">Auditable reasoning, binding constraints, and trade-off justification.</p>
            </div>
            <Info className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">1. The Problem</span>
              <p className="text-ink font-medium mt-0.5">{data?.traceable_explanation?.what_is_problem}</p>
            </div>

            <div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">2. Why It Matters Now</span>
              <p className="text-body mt-0.5">{data?.traceable_explanation?.why_matters_now}</p>
            </div>

            <div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">3. Recommended Action</span>
              <p className="text-primary font-bold text-sm mt-0.5">{data?.traceable_explanation?.recommended_action}</p>
            </div>

            <div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">4. Why It Is Preferred</span>
              <p className="text-body mt-0.5">{data?.traceable_explanation?.why_preferred}</p>
            </div>

            <div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">5. Key Constraints Respected</span>
              <ul className="mt-1 space-y-1">
                {data?.traceable_explanation?.key_constraints_respected?.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5 text-body">
                    <Check className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
