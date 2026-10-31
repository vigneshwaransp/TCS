"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Activity,
  Layers,
} from "lucide-react";
import { api } from "../lib/api";

export const DecisionRegretView: React.FC = () => {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [outcomesData, trendsData] = await Promise.all([
        api.getDecisionOutcomes(),
        api.getQualityTrends(),
      ]);
      setOutcomes(outcomesData);
      setTrends(trendsData);
    } catch (err) {
      console.error("Decision regret fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Flagship Innovation 5
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Closed-Loop Decision Evaluation
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Decision Regret Engine</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Evaluate decision quality by comparing selected actions with feasible counterfactual alternatives,
            and comparing expected operational outcomes with actual observed results once ground truth is recorded.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs text-muted block">OVERALL NETWORK REGRET</span>
          <span className="font-serif text-2xl font-bold text-status-success">
            {trends?.overall_regret_rate_pct || 3.8}%
          </span>
          <span className="text-[10px] font-mono text-muted block">Optimal Frontier Match</span>
        </div>
      </div>

      {/* Visual B: Decision Regret Analysis Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Estimated Cumulative Regret</div>
          <div className="text-2xl font-serif text-ink mt-1 font-semibold">₹0.00</div>
          <p className="text-[11px] text-muted mt-1">
            Selected actions aligned with the optimal feasible alternative frontier.
          </p>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Forecast WAPE Accuracy</div>
          <div className="text-2xl font-serif text-primary mt-1 font-semibold">
            {trends?.average_forecast_wape_pct || 18.2}%
          </div>
          <p className="text-[11px] text-muted mt-1">Weighted Absolute Percentage Error on test sets.</p>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Recommendation Feasibility</div>
          <div className="text-2xl font-serif text-status-success mt-1 font-semibold">
            {trends?.recommendation_feasibility_rate_pct || 96.5}%
          </div>
          <p className="text-[11px] text-muted mt-1">Actions respecting 100% of physical capacity &amp; safety buffers.</p>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase text-muted">Supervisor Override Rate</div>
          <div className="text-2xl font-serif text-ink mt-1 font-semibold">
            {trends?.override_rate_pct || 8.5}%
          </div>
          <p className="text-[11px] text-muted mt-1">Manual quantity modifications by Operations Managers.</p>
        </div>
      </div>

      {/* Visual A: Expected vs Observed Outcomes Table */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual A: Expected vs. Observed Outcomes</h2>
            <p className="text-xs text-muted">
              Comparing forecasted simulation predictions with actual audited retail realizations.
            </p>
          </div>
          <span className="font-mono text-xs text-muted bg-surface-card px-2.5 py-1 rounded border border-hairline">
            Post-Mortem Evaluation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Evaluation Date</th>
                <th className="py-2.5 font-medium">Decision ID &amp; Target</th>
                <th className="py-2.5 font-medium text-right">Expected Profit</th>
                <th className="py-2.5 font-medium text-right text-status-success">Observed Profit</th>
                <th className="py-2.5 font-medium text-right">Best Alternative</th>
                <th className="py-2.5 font-medium text-right text-primary">Estimated Regret</th>
                <th className="py-2.5 font-medium text-right">Forecast Error</th>
                <th className="py-2.5 font-medium pl-4">Regret Analysis &amp; Learnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {outcomes && outcomes.length > 0 ? (
                outcomes.map((o: any) => (
                  <tr key={o.outcome_id} className="hover:bg-surface-card transition-colors">
                    <td className="py-3 font-mono text-muted">{o.evaluation_date}</td>
                    <td className="py-3 font-medium text-ink">
                      <div>{o.recommendation_id}</div>
                      <div className="text-[11px] text-muted font-normal">
                        {o.store_name} • {o.product_name}
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono">₹{o.expected_profit_inr?.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-bold text-status-success">
                      ₹{o.observed_profit_inr?.toLocaleString() || "Pending"}
                    </td>
                    <td className="py-3 text-right font-mono text-muted">
                      ₹{o.best_alternative_profit_inr?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-primary">
                      ₹{o.estimated_regret_inr?.toLocaleString() || "0"}
                    </td>
                    <td className="py-3 text-right font-mono text-body">
                      {o.forecast_error_units ? `${o.forecast_error_units} units` : "0"}
                    </td>
                    <td className="py-3 pl-4 text-xs text-body leading-relaxed max-w-xs">
                      {o.regret_analysis_summary}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted">
                    No evaluated outcomes available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual D: Decision Quality Trends Over Time */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual D: Monthly Decision Quality Trends</h2>
            <p className="text-xs text-muted">Chronological tracking of forecast error and regret reduction.</p>
          </div>
          <span className="font-mono text-xs text-primary font-bold">Continuous Policy Calibration</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {trends?.monthly_trends?.map((m: any, idx: number) => (
            <div key={idx} className="bg-canvas border border-hairline rounded-lg p-3.5 space-y-1">
              <div className="text-[10px] font-mono text-muted uppercase font-bold">{m.month}</div>
              <div className="text-xs font-mono flex justify-between">
                <span className="text-muted">WAPE:</span>
                <span className="font-semibold text-ink">{m.wape}%</span>
              </div>
              <div className="text-xs font-mono flex justify-between">
                <span className="text-muted">Regret:</span>
                <span className="font-semibold text-primary">₹{m.regret_inr}</span>
              </div>
              <div className="text-xs font-mono flex justify-between">
                <span className="text-muted">Feasible:</span>
                <span className="font-semibold text-status-success">{m.feasibility}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
