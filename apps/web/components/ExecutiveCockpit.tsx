"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface CockpitProps {
  summary: any;
  priorityDecisions: any[];
  loading?: boolean;
  onOpenReplay?: (recId: string) => void;
  onOpenTwin?: (storeId: string, sku: string) => void;
  onOpenRipple?: (recId: string) => void;
  onOpenGate?: (recId: string) => void;
  onSelectRecommendation?: (recId: string) => void;
  onOpenCopilot?: () => void;
}

export const ExecutiveCockpit: React.FC<CockpitProps> = ({
  summary,
  priorityDecisions,
  loading = false,
  onOpenReplay = () => {},
  onOpenTwin = () => {},
  onOpenRipple = () => {},
  onOpenGate = () => {},
  onSelectRecommendation = () => {},
  onOpenCopilot,
}) => {
  const operatorName = summary?.operator_name || "Active Retail Network";
  const regionName = summary?.network_region || "Operational Region";
  const activeStores = summary?.active_stores || 0;
  const activeSkus = summary?.active_skus || 0;

  // Dynamically select the highest-priority operational directive from the dataset
  const topDirective = priorityDecisions && priorityDecisions.length > 0 ? priorityDecisions[0] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            <span>{operatorName} • {regionName}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-ink">
            Retail Decision Intelligence Cockpit
          </h1>
          <p className="text-sm text-body mt-1 max-w-2xl">
            Live operational state, algorithmic rebalancing directives, and risk surfaces across {activeStores} stores and {activeSkus} SKUs in your active dataset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-muted border-l border-hairline pl-4 hidden md:block">
            <div className="text-ink font-medium">Dataset Connected</div>
            <div className="text-[11px] text-muted">{summary?.total_sales_records ? `${summary.total_sales_records.toLocaleString()} Sales Records` : "Active ERP"}</div>
          </div>
        </div>
      </div>

      {/* Surface Mode: Warm Cards Grid (6 Live KPI Metrics computed from active dataset) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Stockout Shortages",
            value: summary ? summary.products_at_stockout_risk : "—",
            sub: "Critical Store SKUs",
            icon: AlertTriangle,
            highlight: true,
            statusDot: "bg-status-error",
          },
          {
            label: "Inventory Value",
            value: summary?.total_inventory_value_inr != null
              ? `₹${Math.round(summary.total_inventory_value_inr / 100000)}L`
              : "—",
            sub: "Total On-Hand Capital",
            icon: Layers,
            highlight: false,
          },
          {
            label: "Service Level Target",
            value: summary?.network_service_level_pct != null ? `${summary.network_service_level_pct}%` : "—",
            sub: "Empirical Fulfillment",
            icon: CheckCircle2,
            highlight: false,
            statusDot: "bg-status-success",
          },
          {
            label: "Transfer Directives",
            value: summary ? summary.transfer_opportunities_count : "—",
            sub: "Feasible Pairings",
            icon: RefreshCw,
            highlight: false,
          },
          {
            label: "Supplier Lead Risks",
            value: summary ? summary.supplier_delivery_risks : "—",
            sub: "Delivery Alerts",
            icon: ShieldCheck,
            highlight: false,
            statusDot: "bg-status-warning",
          },
          {
            label: "Surplus Items",
            value: summary ? summary.excess_inventory_count : "—",
            sub: "Buffer Candidates",
            icon: Sparkles,
            highlight: false,
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-lg border transition-all ${
                kpi.highlight
                  ? "bg-surface-dark text-on-dark border-surface-dark-elevated"
                  : "bg-surface-card border-hairline"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase tracking-wider ${kpi.highlight ? "text-on-dark-soft" : "text-muted"}`}>
                  {kpi.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${kpi.highlight ? "text-primary" : "text-muted"}`} />
              </div>
              <div className={`text-2xl font-serif font-normal mt-2 tracking-tight ${kpi.highlight ? "text-on-dark" : "text-ink"}`}>
                {kpi.value}
              </div>
              <div className={`text-[11px] mt-1 flex items-center gap-1.5 ${kpi.highlight ? "text-on-dark-soft font-mono" : "text-muted"}`}>
                {kpi.statusDot && <span className={`w-1.5 h-1.5 rounded-full ${kpi.statusDot} inline-block`} />}
                <span>{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surface Mode: Dynamically Grounded Action Callout Card (NO Hardcoding) */}
      {topDirective ? (
        <div className="bg-primary text-on-primary rounded-lg p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-canvas text-primary font-mono text-[11px] font-bold uppercase tracking-wider mb-3 border border-primary/20">
              Top Algorithmic Move • {topDirective.urgency} Urgency
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-on-primary">
              {topDirective.problem}
            </h2>
            <p className="text-on-primary text-xs sm:text-sm mt-2 leading-relaxed opacity-95">
              Affecting <strong>{topDirective.store_name}</strong> ({topDirective.sku} — {topDirective.product_name}).
              Algorithm recommends: <strong>{topDirective.recommended_action.replace(/_/g, " ")}</strong> with quantity of <strong>{topDirective.recommended_quantity} units</strong>.
              Projected net contribution profit impact: <strong>+₹{topDirective.expected_impact_inr?.toLocaleString()}</strong> under Decision Gate status <strong>{topDirective.readiness_status}</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => onSelectRecommendation(topDirective.recommendation_id)}
                className="bg-canvas hover:bg-surface-card text-ink px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 shadow-sm"
              >
                <span>Inspect in Decision Twin</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
              <button
                onClick={() => onOpenGate(topDirective.recommendation_id)}
                className="bg-surface-dark hover:bg-surface-dark-elevated text-on-dark px-4 py-2 rounded-md text-xs font-medium transition"
              >
                Confidence Gate Clearance →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Priority Decisions Queue from active dataset */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-ink">
              Priority Operational Directives
            </h2>
            <p className="text-xs text-muted">
              Ranked by business urgency, financial opportunity, and Decision Gate readiness.
            </p>
          </div>
          <span className="font-mono text-xs text-muted bg-surface-card px-3 py-1 rounded-full border border-hairline">
            Active Dataset Records
          </span>
        </div>

        <div className="space-y-3">
          {priorityDecisions && priorityDecisions.length > 0 ? (
            priorityDecisions.map((dec) => (
              <div
                key={dec.recommendation_id}
                className="bg-surface-card hover:bg-surface-soft border border-hairline rounded-lg p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        dec.urgency === "CRITICAL"
                          ? "bg-status-error text-white"
                          : "bg-surface-dark text-on-dark"
                      }`}
                    >
                      {dec.urgency}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      {dec.store_name} • {dec.sku}
                    </span>
                    <span className="text-xs text-muted">•</span>
                    <span className="text-xs text-body font-medium">{dec.product_name}</span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-ink leading-snug">
                    {dec.problem}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
                    <div>
                      Action: <strong className="text-body font-semibold">{dec.recommended_action.replace(/_/g, " ")}</strong>
                    </div>
                    <div>•</div>
                    <div>
                      Target Qty: <strong className="text-body font-semibold">{dec.recommended_quantity} units</strong>
                    </div>
                    <div>•</div>
                    <div>
                      Profit Lift: <strong className="text-status-success font-semibold">+₹{dec.expected_impact_inr?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => onSelectRecommendation(dec.recommendation_id)}
                    className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded-md text-xs font-medium transition shadow-sm"
                  >
                    Inspect Action
                  </button>
                  <button
                    onClick={() => onOpenGate(dec.recommendation_id)}
                    className="px-3 py-2 bg-canvas hover:bg-surface-cream-strong border border-hairline text-ink rounded-md text-xs font-mono transition"
                  >
                    Gate →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-surface-card border border-hairline rounded-lg p-8 text-center text-muted text-xs">
              No pending decision directives. Network operating within healthy inventory thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
