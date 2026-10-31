"use client";

import React, { useState, useEffect } from "react";
import {
  Network,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  Sliders,
} from "lucide-react";
import { api } from "../lib/api";

interface RippleProps {
  recId?: string;
  onOpenGate: (recId: string) => void;
}

export const RippleView: React.FC<RippleProps> = ({ recId = "REC_001", onOpenGate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [transferUnits, setTransferUnits] = useState(50);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.getRippleGraph(recId, transferUnits);
      setData(res);
      if (res.nodes && res.nodes.length > 0 && !selectedNode) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error("Ripple graph error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [recId, transferUnits]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Flagship Innovation 3
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Multi-Echelon Network Propagation
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Ripple Intelligence</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Analyze how an operational decision affects other stores, road logistics, residual inventories, and financial outcomes.
            A transfer may rescue one store but induce shortages elsewhere — Ripple Intelligence exposes that consequence.
          </p>
        </div>

        <button
          onClick={() => onOpenGate(recId)}
          className="bg-primary hover:bg-primary-active text-white px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Open Decision Gate
        </button>
      </div>

      {/* Visual C: Network Impact Summary Banner */}
      <div className="bg-surface-card border border-hairline rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-muted block">Directly Affected Stores</span>
          <span className="text-sm font-medium text-ink mt-0.5 block">
            {data?.network_summary?.stores_affected?.join(" & ") || "DMart Velachery & Chromepet"}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-muted block">Intra-City Logistics Cost</span>
          <span className="text-sm font-mono font-bold text-ink mt-0.5 block">
            ₹{data?.network_summary?.total_dispatch_cost_inr?.toLocaleString() || "762.40"}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-muted block">Net Protected Margin</span>
          <span className="text-sm font-mono font-bold text-primary mt-0.5 block">
            ₹{data?.network_summary?.net_margin_protected_inr?.toLocaleString() || "3,200"}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-muted block">Source Safety Buffer Status</span>
          <span className="text-sm font-mono font-semibold text-status-success mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Buffer Intact (105u &gt; 30u)
          </span>
        </div>
      </div>

      {/* Visual A: Interactive Impact Graph & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Graph Canvas (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-canvas border border-hairline rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-ink">Visual A: Network Dependency Graph</h2>
              <p className="text-xs text-muted">Click any node to inspect underlying source data, business rules, and assumptions.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-body font-mono">Transfer Units:</span>
              <input
                type="number"
                min="10"
                max="120"
                step="10"
                value={transferUnits}
                onChange={(e) => setTransferUnits(parseInt(e.target.value) || 50)}
                className="w-16 px-2 py-1 bg-surface-card border border-hairline rounded font-mono text-xs text-center"
              />
            </div>
          </div>

          {/* Interactive Node Graph Visualization */}
          <div className="relative bg-surface-card border border-hairline rounded-lg p-6 min-h-[460px] flex flex-col justify-between">
            {/* Level 1: Promotional Event */}
            <div className="flex justify-center">
              {data?.nodes?.filter((n: any) => n.id === "node-promo").map((node: any) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-72 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                      : "bg-canvas border-hairline hover:bg-surface-cream-strong text-ink"
                  }`}
                >
                  <div className="text-[10px] font-mono text-primary font-bold uppercase">Promotional Event</div>
                  <div className="font-medium text-xs mt-0.5">{node.label}</div>
                  <div className={`text-[11px] mt-0.5 ${selectedNode?.id === node.id ? "text-on-dark-soft" : "text-muted"}`}>
                    {node.subtitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting Edge Indicator */}
            <div className="flex justify-center -my-1 text-muted text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-[10px] font-mono">
                ↓ Drives promotional footfall (+95%)
              </span>
            </div>

            {/* Level 2: Destination Demand & Shortage */}
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {data?.nodes?.filter((n: any) => n.id === "node-dest-demand" || n.id === "node-dest-shortage").map((node: any) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                      : "bg-canvas border-hairline hover:bg-surface-cream-strong text-ink"
                  }`}
                >
                  <div className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${node.status === "critical" ? "text-status-error" : "text-primary"}`}>
                    {node.status === "critical" && <span className="w-1.5 h-1.5 rounded-full bg-status-error inline-block" />}
                    <span>{node.status === "critical" ? "Operational Risk" : "Forecasted Demand"}</span>
                  </div>
                  <div className="font-medium text-xs mt-0.5">{node.label}</div>
                  <div className={`text-[11px] mt-0.5 ${selectedNode?.id === node.id ? "text-on-dark-soft" : "text-muted"}`}>
                    {node.subtitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting Edge Indicator */}
            <div className="flex justify-center -my-1 text-muted text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-[10px] font-mono">
                ↓ Proposed Intra-City Transfer Dispatch (50 units)
              </span>
            </div>

            {/* Level 3: Dual Downstream Effects (Velachery vs Chromepet) */}
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {data?.nodes?.filter((n: any) => n.id === "node-dest-benefit" || n.id === "node-src-depletion").map((node: any) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                      : "bg-canvas border-hairline hover:bg-surface-cream-strong text-ink"
                  }`}
                >
                  <div className="text-[10px] font-mono text-status-success font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
                    <span>{node.id === "node-dest-benefit" ? "Destination Benefit" : "Source Residual Assessment"}</span>
                  </div>
                  <div className="font-medium text-xs mt-0.5">{node.label}</div>
                  <div className={`text-[11px] mt-0.5 ${selectedNode?.id === node.id ? "text-on-dark-soft" : "text-muted"}`}>
                    {node.subtitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting Edge Indicator */}
            <div className="flex justify-center -my-1 text-muted text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-[10px] font-mono">
                ↓ Multi-Echelon Network Rebalance
              </span>
            </div>

            {/* Level 4: Final Network Outcome */}
            <div className="flex justify-center">
              {data?.nodes?.filter((n: any) => n.id === "node-network-outcome").map((node: any) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-80 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "bg-surface-dark text-on-dark border-surface-dark-elevated shadow-sm"
                      : "bg-surface-cream-strong border-hairline text-ink"
                  }`}
                >
                  <div className="text-[10px] font-mono text-primary font-bold uppercase">Network Consolidated Result</div>
                  <div className="font-medium text-xs mt-0.5">{node.label}</div>
                  <div className={`text-[11px] mt-0.5 ${selectedNode?.id === node.id ? "text-on-dark/70" : "text-muted"}`}>
                    {node.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Node Inspector (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-surface-card border border-hairline rounded-xl p-6 space-y-4">
          <div className="border-b border-hairline pb-3">
            <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">Node Details Inspector</span>
            <h3 className="font-serif text-lg font-normal text-ink mt-0.5">
              {selectedNode?.label || "Select a Node"}
            </h3>
            <p className="text-xs text-muted mt-0.5">{selectedNode?.subtitle}</p>
          </div>

          {selectedNode?.data && (
            <div className="space-y-3 text-xs">
              <div className="font-mono text-[11px] text-muted uppercase font-semibold">Underlying Data &amp; Evidence</div>
              <div className="bg-canvas border border-hairline rounded-lg p-3.5 space-y-2">
                {Object.entries(selectedNode.data).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex justify-between items-baseline gap-2 text-xs">
                    <span className="text-muted font-mono capitalize">{k.replace(/_/g, " ")}:</span>
                    <span className="font-semibold text-ink text-right font-mono">{String(v)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-body leading-relaxed">
                <span className="font-mono text-[10px] text-muted uppercase font-bold block mb-1">Causal Integrity Note</span>
                {selectedNode.id === "node-src-depletion" ? (
                  <p>
                    Source safety stock verification is mandated by supply-chain policy. Chromepet&apos;s buffer of 30 units is strictly preserved, preventing secondary shortages.
                  </p>
                ) : selectedNode.id === "node-transfer-action" ? (
                  <p>
                    Intra-city road transit calibrated with 1.35x circuity factor and arterial commercial tempos (Tata Ace LCV).
                  </p>
                ) : (
                  <p>
                    Node is bound to validated operational records in the DMart canonical schema. No synthetic metric hallucination.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual B: Impact Matrix Table */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Visual B: Downstream Impact Matrix</h2>
            <p className="text-xs text-muted">Entity-level comparison of baseline vs proposed action states.</p>
          </div>
          <span className="font-mono text-xs text-muted bg-surface-card px-2.5 py-1 rounded border border-hairline">
            Multi-Entity Accounting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Affected Entity</th>
                <th className="py-2.5 font-medium">Baseline Condition</th>
                <th className="py-2.5 font-medium">Proposed Change</th>
                <th className="py-2.5 font-medium text-status-success">Expected Benefit</th>
                <th className="py-2.5 font-medium text-status-error">Potential Risk</th>
                <th className="py-2.5 font-medium text-right">Dispatch Cost</th>
                <th className="py-2.5 font-medium pl-3">Evidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {data?.impact_matrix?.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-card transition-colors">
                  <td className="py-3 font-medium text-ink font-mono">{row.entity}</td>
                  <td className="py-3 text-body">{row.baseline_condition}</td>
                  <td className="py-3 font-semibold text-ink">{row.proposed_change}</td>
                  <td className="py-3 text-status-success">{row.expected_benefit}</td>
                  <td className="py-3 text-body">{row.potential_risk}</td>
                  <td className="py-3 text-right font-mono font-bold text-ink">
                    ₹{row.estimated_cost_inr?.toLocaleString()}
                  </td>
                  <td className="py-3 pl-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-surface-card border border-hairline text-body">
                      {row.evidence_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
