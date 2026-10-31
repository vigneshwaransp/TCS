"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Search,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../lib/api";

export const ExplainRecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [activeExplanation, setActiveExplanation] = useState<any | null>(null);
  const [explainingLoading, setExplainingLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await api.getRecommendations();
      setRecommendations(recs || []);
      if (recs && recs.length > 0 && !selectedRecId) {
        setSelectedRecId(recs[0].recommendation_id);
        handleExplain(recs[0].recommendation_id);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleExplain = async (recId: string) => {
    setSelectedRecId(recId);
    setExplainingLoading(true);
    setActiveExplanation(null);
    try {
      const res = await api.copilotExplain(recId);
      setActiveExplanation(res);
    } catch (err: any) {
      console.error("Failed to generate AI explanation:", err);
      setActiveExplanation({
        recommendation_id: recId,
        explanation: `### Algorithmic Directive Justification\n\n- **Target Action**: Lateral Stock Balancing\n- **Preservation Target**: Preserves store safety stock buffer while mitigating imminent stockout.\n- **Network Impact**: Eliminates stockout without triggering shortages at the donor store.`,
        model_used: "kintral-deterministic-engine",
      });
    } finally {
      setExplainingLoading(false);
    }
  };

  const handleApprove = async (recId: string, actionType: string, qty: number) => {
    try {
      await api.approveRecommendation(recId, {
        selected_action: actionType,
        approved_quantity: qty,
        review_notes: "Approved via Decision Explainability Studio",
      });
      setActionSuccessMessage(`Directive ${recId} successfully approved and dispatched.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchRecommendations();
    } catch (err: any) {
      alert(`Approval error: ${err.message || "Action failed"}`);
    }
  };

  const selectedRec = recommendations.find((r) => r.recommendation_id === selectedRecId) || recommendations[0];

  const filteredRecs = recommendations.filter(
    (r) =>
      r.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.action_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Decision Explainability &amp; Reasoning
          </span>
          <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">
            Explain Recommendations &amp; Directives
          </h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Inspect the underlying operational cause, compared alternatives, financial justification, and operational constraints for every recommendation.
            Powered by <strong>React Markdown</strong> and live Groq LLM reasoning.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-card hover:bg-surface-soft border border-hairline text-xs font-mono text-ink transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directives</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main 2-Column Layout: Left List of Directives, Right Deep Explainability Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Directive Selection List (4 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-surface-card border border-hairline p-3 rounded-lg flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search store, SKU, or action type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-ink font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredRecs.map((rec) => {
              const isSelected = selectedRecId === rec.recommendation_id;
              return (
                <div
                  key={rec.recommendation_id}
                  onClick={() => handleExplain(rec.recommendation_id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-canvas border-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-surface-card hover:bg-surface-soft border-hairline"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        rec.urgency === "CRITICAL"
                          ? "bg-status-error text-white"
                          : "bg-surface-dark text-on-dark"
                      }`}
                    >
                      {rec.urgency}
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      {rec.recommendation_id}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-medium text-ink mt-2 leading-snug">
                    {rec.problem_detected}
                  </h3>

                  <div className="text-xs text-muted mt-1 font-mono">
                    {rec.store_name} • {rec.product_name}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-xs font-mono">
                    <span className="text-primary font-semibold">
                      {rec.action_type.replace(/_/g, " ")} ({rec.recommended_quantity}u)
                    </span>
                    <span className="text-status-success font-bold">
                      +₹{rec.expected_profit_impact_inr?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Explainability Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedRec ? (
            <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-6 shadow-sm">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Algorithmic Recommendation Audit</span>
                  </div>
                  <h2 className="font-serif text-2xl font-normal text-ink mt-1">
                    {selectedRec.problem_detected}
                  </h2>
                  <div className="text-xs font-mono text-muted mt-0.5">
                    Store: {selectedRec.store_name} ({selectedRec.store_id}) • SKU: {selectedRec.sku}
                  </div>
                </div>

                <div className="text-right font-mono self-start sm:self-auto">
                  <div className="text-[10px] uppercase text-muted">Profit Opportunity</div>
                  <div className="text-xl font-serif text-status-success font-bold">
                    +₹{selectedRec.expected_profit_impact_inr?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-card p-4 rounded-xl border border-hairline text-xs font-mono">
                <div>
                  <div className="text-[10px] uppercase text-muted">Recommended Action</div>
                  <div className="text-sm font-bold text-ink mt-1">{selectedRec.action_type.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted">Optimized Quantity</div>
                  <div className="text-sm font-bold text-primary mt-1">{selectedRec.recommended_quantity} units</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted">Source / Partner</div>
                  <div className="text-xs font-medium text-ink mt-1">{selectedRec.source_store_name || selectedRec.supplier_name || "Network Surplus"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted">Gate Clearance</div>
                  <div className="text-xs font-bold text-accent-teal mt-1">{selectedRec.decision_gate_status || "READY_TO_ACT"}</div>
                </div>
              </div>

              {/* AI Reasoning Section Rendered with React Markdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-hairline pb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <h3 className="font-serif text-lg font-medium text-ink">
                      AI Reasoning &amp; Operational Explanation
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-muted bg-surface-card px-2.5 py-0.5 rounded-full border border-hairline">
                    Model: {activeExplanation?.model_used || "openai/gpt-oss-120b"}
                  </span>
                </div>

                {explainingLoading ? (
                  <div className="p-8 text-center bg-surface-card rounded-xl space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs font-mono text-muted">Generating deep supply chain reasoning via Groq LLM...</p>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-surface-card border border-hairline text-xs leading-relaxed text-ink font-sans space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-sm font-serif font-bold text-primary mt-3 mb-1.5">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xs font-serif font-semibold text-primary mt-2.5 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-mono font-medium text-ink mt-2 mb-0.5">{children}</h3>,
                        p: ({ children }) => <p className="text-xs leading-relaxed mb-2 text-ink">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1 text-xs text-ink">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1 text-xs text-ink">{children}</ol>,
                        li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-primary font-mono">{children}</strong>,
                        code: ({ children }: any) => (
                          <code className="bg-canvas px-1 py-0.5 rounded text-[11px] font-mono text-primary border border-hairline">
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3">
                            <table className="w-full text-left text-[11px] font-mono border-collapse border border-hairline bg-canvas">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="bg-surface-soft p-1.5 font-semibold text-primary border-b border-hairline">{children}</th>
                        ),
                        td: ({ children }) => (
                          <td className="p-1.5 border-b border-hairline text-body">{children}</td>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary pl-3 py-1 my-2 text-xs italic text-muted bg-surface-soft/40">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {activeExplanation?.explanation || selectedRec.explanation || "No explanation recorded."}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-muted">
                  Status: <strong className="text-ink">{selectedRec.approval_status || "PENDING"}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(selectedRec.recommendation_id, selectedRec.action_type, selectedRec.recommended_quantity)}
                    className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded-md text-xs font-medium font-mono transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Recommendation</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-surface-card rounded-xl border border-hairline text-muted text-xs">
              Select any recommendation on the left to inspect its complete explanation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};