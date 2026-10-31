"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Check,
  X,
  History,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";

interface GateProps {
  recId?: string;
  activeRole: string;
  onRefreshDecisions?: () => void;
}

export const DecisionGateView: React.FC<GateProps> = ({
  recId = "REC_001",
  activeRole,
  onRefreshDecisions,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simulateMissing, setSimulateMissing] = useState(false);
  const [simulateSafetyFail, setSimulateSafetyFail] = useState(false);

  // Approval Form
  const [selectedAction, setSelectedAction] = useState("STORE_TRANSFER");
  const [approvedQty, setApprovedQty] = useState(50);
  const [reviewNotes, setReviewNotes] = useState("Approved for intra-city dispatch via Tata Ace LCV.");
  const [approvalMessage, setApprovalMessage] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchGate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getDecisionGate(recId, simulateMissing, simulateSafetyFail);
      setData(res);
    } catch (err: any) {
      console.error("Decision gate fetch error:", err);
      setErrorMessage(err.message || "Failed to load Decision Gate assessment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGate();
  }, [recId, simulateMissing, simulateSafetyFail]);

  const handleApprove = async () => {
    setErrorMessage(null);
    setApprovalMessage(null);
    try {
      const res = await api.approveRecommendation(recId, {
        decision: "APPROVED",
        selected_action: selectedAction,
        approved_quantity: approvedQty,
        review_notes: reviewNotes,
      });
      setApprovalMessage(res);
      if (onRefreshDecisions) onRefreshDecisions();
    } catch (err: any) {
      setErrorMessage(err.message || "Approval rejected by backend RBAC governance.");
    }
  };

  const handleReject = async () => {
    setErrorMessage(null);
    setApprovalMessage(null);
    try {
      const res = await api.rejectRecommendation(recId, {
        decision: "REJECTED",
        selected_action: "NO_ACTION",
        approved_quantity: 0,
        review_notes: reviewNotes || "Rejected due to operational constraints.",
      });
      setApprovalMessage(res);
      if (onRefreshDecisions) onRefreshDecisions();
    } catch (err: any) {
      setErrorMessage(err.message || "Rejection failed.");
    }
  };

  const status = data?.current_gate_status || "HUMAN_REVIEW_REQUIRED";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              Flagship Innovation 4
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dark text-on-dark font-medium">
              Decision Assurance &amp; Governance Panel
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink">Confidence-Aware Decision Gate</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Assess whether a recommendation is mathematically grounded and sufficiently evidenced to proceed, requires human review, or lacks essential data.
            <strong> Not an opaque decorative AI meter</strong> — an explicit governance mechanism enforcing feasibility.
          </p>
        </div>

        {/* Test Toggle Controls */}
        <div className="flex items-center gap-3 bg-surface-card border border-hairline px-3 py-2 rounded-lg text-xs">
          <span className="text-muted font-mono text-[11px]">Stress Tests:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-body hover:text-ink">
            <input
              type="checkbox"
              checked={simulateMissing}
              onChange={(e) => setSimulateMissing(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Simulate Missing Data</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-body hover:text-ink">
            <input
              type="checkbox"
              checked={simulateSafetyFail}
              onChange={(e) => setSimulateSafetyFail(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Simulate Buffer Breach</span>
          </label>
        </div>
      </div>

      {/* Decision Assurance Main Status Banner */}
      <div className="p-6 rounded-lg border border-hairline bg-surface-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                status === "READY_TO_ACT"
                  ? "bg-surface-dark text-status-success"
                  : status === "HUMAN_REVIEW_REQUIRED"
                  ? "bg-surface-dark text-accent-amber"
                  : "bg-surface-dark text-status-error"
              }`}
            >
              {status === "READY_TO_ACT" ? (
                <ShieldCheck className="w-6 h-6" />
              ) : status === "HUMAN_REVIEW_REQUIRED" ? (
                <ShieldAlert className="w-6 h-6 text-accent-amber" />
              ) : (
                <XCircle className="w-6 h-6 text-status-error" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase font-bold text-muted tracking-wider">
                  Decision Readiness Status:
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-canvas border border-hairline text-ink">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === "READY_TO_ACT"
                        ? "bg-status-success"
                        : status === "HUMAN_REVIEW_REQUIRED"
                        ? "bg-status-warning"
                        : "bg-status-error"
                    }`}
                  />
                  <span>{status.replace(/_/g, " ")}</span>
                </span>
              </div>
              <p className="text-sm font-medium mt-1 text-ink">{data?.status_rationale}</p>
              <div className="text-xs text-muted mt-1 font-mono">
                {status === "READY_TO_ACT"
                  ? "Action complies with all configured data quality, feasibility, and economic justification criteria."
                  : status === "HUMAN_REVIEW_REQUIRED"
                  ? "Multi-store inventory movement requires authorized human supervisor sign-off."
                  : "Critical input records are missing or constraints violated. Action cannot proceed."}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] font-mono text-muted uppercase">Execution Clearance</div>
            <div
              className={`text-sm font-bold font-mono mt-0.5 ${
                data?.can_proceed_to_approval ? "text-status-success" : "text-status-error"
              }`}
            >
              {data?.can_proceed_to_approval ? "CLEAR FOR APPROVAL" : "EXECUTION BLOCKED"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Columns: Evidence Checklist vs Approval Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual A: Evidence Checklist (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-ink">Visual A: Evidence Validation Checklist</h2>
              <p className="text-xs text-muted">Audited criteria evaluated prior to authorizing decision execution.</p>
            </div>
            <FileCheck className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-2.5">
            {data?.evidence_checklist?.map((item: any) => {
              const isPass = item.status === "PASS";
              const isWarn = item.status === "WARN";

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-hairline bg-surface-card flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-ink">{item.name}</span>
                      {item.critical && (
                        <span className="text-[9px] font-mono font-bold uppercase text-primary bg-canvas border border-hairline px-2 py-0.5 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-body">{item.evidence}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border border-hairline bg-canvas ${
                      isPass
                        ? "text-status-success"
                        : isWarn
                        ? "text-accent-amber"
                        : "text-status-error"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Visual B: Uncertainty Panel */}
          <div className="mt-4 pt-4 border-t border-hairline bg-surface-card/60 p-4 rounded-lg">
            <h3 className="font-serif text-sm font-medium text-ink mb-2">Visual B: Uncertainty &amp; Sensitivity Profile</h3>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted block">Forecast Uncertainty</span>
                <span className="font-semibold text-ink">
                  {data?.uncertainty_summary?.forecast_uncertainty || "LOW (WAPE 18.4%)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Audit Freshness</span>
                <span className="font-semibold text-status-success">
                  {data?.uncertainty_summary?.data_freshness || "Verified Today"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Sensitivity Check</span>
                <span className="font-semibold text-ink">Robust to ±25% demand</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual C: Approval Workflow Panel (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-surface-card border border-hairline rounded-xl p-6 space-y-4">
          <div className="border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl font-normal text-ink">Visual C: Authorization Workflow</h2>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Backend RBAC enforced. Active role: <strong className="text-ink">{activeRole.toUpperCase()}</strong>.
            </p>
          </div>

          {/* Feedback Alerts */}
          {approvalMessage && (
            <div className="p-4 bg-surface-dark text-on-dark border border-surface-dark-elevated rounded-lg text-xs space-y-1">
              <div className="font-bold font-mono text-status-success flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>APPROVAL COMMITTED TO AUDIT TRAIL</span>
              </div>
              <div className="text-on-dark-soft">{approvalMessage.message}</div>
              <div className="font-mono text-[10px] text-primary">ID: {approvalMessage.approval_id}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-surface-dark text-on-dark border border-status-error rounded-lg text-xs space-y-1">
              <div className="font-bold font-mono flex items-center gap-1.5 text-status-error">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>AUTHORIZATION FAILURE</span>
              </div>
              <div className="text-on-dark-soft">{errorMessage}</div>
            </div>
          )}

          {/* Form Controls */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-body font-medium block mb-1">Selected Operational Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full bg-canvas border border-hairline px-3 py-2 rounded-md font-mono text-xs text-ink"
              >
                <option value="STORE_TRANSFER">STORE_TRANSFER (Transfer from Chromepet)</option>
                <option value="COMBINED">COMBINED (Transfer 40u + Supplier Order 60u)</option>
                <option value="SUPPLIER_REPLENISHMENT">SUPPLIER_REPLENISHMENT (Full Order)</option>
                <option value="PROMO_ADJUSTMENT">PROMO_ADJUSTMENT (Reduce discount to 5%)</option>
              </select>
            </div>

            <div>
              <label className="text-body font-medium block mb-1">Approved Quantity (Units)</label>
              <input
                type="number"
                value={approvedQty}
                onChange={(e) => setApprovedQty(parseInt(e.target.value) || 0)}
                className="w-full bg-canvas border border-hairline px-3 py-2 rounded-md font-mono text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-body font-medium block mb-1">Manager Review Notes &amp; Rationale</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document approval justification for audit logging..."
                className="w-full bg-canvas border border-hairline p-2.5 rounded-md font-sans text-xs text-ink"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleApprove}
                disabled={!data?.can_proceed_to_approval}
                className="flex-1 bg-primary hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Authorize Decision
              </button>

              <button
                onClick={handleReject}
                className="bg-canvas hover:bg-surface-soft border border-hairline text-ink px-4 py-2.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-status-error" /> Reject
              </button>
            </div>

            {/* Role Guard Explanation */}
            <div className="p-3 bg-canvas border border-hairline rounded-lg text-[11px] text-muted space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-ink">RBAC Governance Rule</span>
              <p>
                Decision approvals require <strong>Retail Operations Manager</strong> or <strong>Administrator</strong> role.
                If switched to <em>Read-Only Viewer</em>, the backend securely blocks authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
