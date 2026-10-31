"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api } from "../lib/api";

export const PolicyLabView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState("POL_D_CONSTRAINED_OPTIMIZATION");

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.getPolicyComparison();
      setData(res);
    } catch (err) {
      console.error("Policy lab error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const selectedPolicy = data?.policies?.find((p: any) => p.policy_id === selectedPolicyId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Simulation Lab
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Adaptive Retail Policy Lab
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Policy Comparison Workspace</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Compare alternative retail replenishment and inventory policies under identical historical conditions.
            Evaluate fill rates, stockout exposures, and total contribution profit without lookahead bias.
          </p>
        </div>

        <div className="bg-surface-card border border-hairline px-3 py-1.5 rounded-lg text-xs font-mono">
          <span>Active Benchmark: </span>
          <strong className="text-primary font-bold">Policy D (Constrained Profit)</strong>
        </div>
      </div>

      {/* Summary Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Contribution Profit Lift</div>
          <div className="text-2xl font-serif text-primary mt-1 font-semibold">
            +{data?.comparison_summary?.profit_gain_vs_baseline_pct || 45.3}%
          </div>
          <p className="text-[11px] text-muted mt-1">Versus static Fixed Reorder Point (Policy A).</p>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Stockout Incident Reduction</div>
          <div className="text-2xl font-serif text-status-success mt-1 font-semibold">
            -{data?.comparison_summary?.stockout_reduction_vs_baseline_pct || 92.8}%
          </div>
          <p className="text-[11px] text-muted mt-1">Drops from 42 stockouts down to only 3.</p>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Inventory Working Capital</div>
          <div className="text-2xl font-serif text-ink mt-1 font-semibold">
            -{data?.comparison_summary?.inventory_efficiency_improvement_pct || 31.1}%
          </div>
          <p className="text-[11px] text-muted mt-1">Leaner buffer stocks through network-aware sharing.</p>
        </div>
      </div>

      {/* The 4 Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.policies?.map((policy: any) => {
          const isSelected = selectedPolicyId === policy.policy_id;
          const isKintral = policy.policy_id === "POL_D_CONSTRAINED_OPTIMIZATION";

          return (
            <div
              key={policy.policy_id}
              onClick={() => setSelectedPolicyId(policy.policy_id)}
              className={`p-5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                  : isKintral
                  ? "bg-surface-cream-strong border-primary"
                  : "bg-surface-card border-hairline hover:bg-surface-cream-strong"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      isKintral
                        ? "bg-primary text-white"
                        : "bg-canvas border border-hairline text-muted"
                    }`}
                  >
                    {policy.policy_type}
                  </span>
                  {isSelected && <span className="text-primary font-bold">ACTIVE</span>}
                </div>

                <h3 className={`font-serif text-base font-normal tracking-[-0.02em] ${isSelected ? "text-on-dark" : "text-ink"}`}>
                  {policy.policy_name}
                </h3>

                <p className={`text-xs mt-1 leading-relaxed ${isSelected ? "text-on-dark-soft" : "text-muted"}`}>
                  {policy.description}
                </p>

                <div className="mt-4 pt-3 border-t border-hairline space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Fill Rate:</span>
                    <span className={`font-bold ${policy.fill_rate_pct > 95 ? "text-status-success" : "text-ink"}`}>
                      {policy.fill_rate_pct}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Stockouts:</span>
                    <span className={policy.stockout_incidents > 10 ? "text-status-error font-bold" : "text-ink"}>
                      {policy.stockout_incidents} incidents
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Logistics Cost:</span>
                    <span className={isSelected ? "text-on-dark" : "text-body"}>
                      ₹{policy.total_logistics_cost_inr?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isSelected ? "text-on-dark/60" : "text-muted"}>Contribution Profit:</span>
                    <span className={`font-bold ${isKintral ? "text-primary" : isSelected ? "text-on-dark" : "text-ink"}`}>
                      ₹{policy.total_contribution_profit_inr?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline text-[11px]">
                <div className="text-status-success font-medium">✓ {policy.pros}</div>
                <div className="text-muted mt-1">✗ {policy.cons}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Policy Detail Banner */}
      {selectedPolicy && (
        <div className="bg-canvas border border-hairline rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase font-bold">Policy Deployment Inspection</span>
            <h3 className="font-serif text-xl font-normal text-ink mt-0.5">
              Deploying {selectedPolicy.policy_name} to Chennai Metro DMart Network
            </h3>
            <p className="text-xs text-muted mt-1 max-w-2xl">
              Evaluation dataset: 365 days of historical sales across 5 branches. Changing deployment policy requires explicit Operations Director authorization.
            </p>
          </div>

          <button
            onClick={() => alert(`Policy deployment simulation: ${selectedPolicy.policy_name} staged for authorization.`)}
            className="bg-surface-dark hover:bg-surface-dark-elevated text-on-dark px-4 py-2 rounded-md text-xs font-medium transition self-start md:self-auto"
          >
            Stage Policy for Rollout
          </button>
        </div>
      )}
    </div>
  );
};
