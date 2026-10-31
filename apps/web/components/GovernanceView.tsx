"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, Check, X, Lock, Activity, RefreshCw } from "lucide-react";
import { api } from "../lib/api";

export const GovernanceView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res);
    } catch (err) {
      console.error("Audit log error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const matrix = [
    { action: "DATA_IMPORT", admin: true, ops: true, planner: true, analyst: false, viewer: false },
    { action: "FORECAST_RUN", admin: true, ops: true, planner: true, analyst: true, viewer: false },
    { action: "SIMULATE (Twin)", admin: true, ops: true, planner: true, analyst: true, viewer: false },
    { action: "APPROVE_DECISION", admin: true, ops: true, planner: false, analyst: false, viewer: false },
    { action: "EXECUTE_ACTION", admin: true, ops: true, planner: false, analyst: false, viewer: false },
    { action: "VIEW_AUDIT", admin: true, ops: true, planner: true, analyst: true, viewer: false },
    { action: "CONFIGURE_POLICY", admin: true, ops: false, planner: false, analyst: false, viewer: false },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Governance &amp; Compliance
          </span>
          <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">Audit Trail &amp; Role-Based Access Control</h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Enforced by backend authorization middleware. All decision approvals, rejections, and policy configurations
            are committed to an immutable append-only audit trail.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-surface-card hover:bg-surface-cream-strong border border-hairline text-ink px-3.5 py-2 rounded-md text-xs font-medium transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Audit Trail
        </button>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-normal text-ink">Role-Based Access Control (RBAC) Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Permission Scope</th>
                <th className="py-2.5 font-medium text-center">Administrator</th>
                <th className="py-2.5 font-medium text-center">Retail Ops Manager</th>
                <th className="py-2.5 font-medium text-center">Inventory Planner</th>
                <th className="py-2.5 font-medium text-center">Data Scientist</th>
                <th className="py-2.5 font-medium text-center">Read-Only Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-mono text-xs">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-card transition-colors">
                  <td className="py-3 font-semibold text-ink">{row.action}</td>
                  <td className="py-3 text-center">
                    {row.admin ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-status-error mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.ops ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-status-error mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.planner ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-status-error mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.analyst ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-status-error mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.viewer ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-status-error mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Trail Log */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Immutable Decision Audit Trail</h2>
            <p className="text-xs text-muted">Append-only log recording actor identities, decisions, timestamps, and justification.</p>
          </div>
          <span className="font-mono text-xs text-muted">Compliance Standard: ISO/IEC 27001 &amp; SOC2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Timestamp (UTC)</th>
                <th className="py-2.5 font-medium">Actor</th>
                <th className="py-2.5 font-medium">Role</th>
                <th className="py-2.5 font-medium">Action</th>
                <th className="py-2.5 font-medium">Target Resource</th>
                <th className="py-2.5 font-medium">Details &amp; Notes</th>
                <th className="py-2.5 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-mono text-xs">
              {logs && logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.log_id} className="hover:bg-surface-cream-strong transition-colors">
                    <td className="py-3 text-muted">{l.timestamp}</td>
                    <td className="py-3 font-semibold text-ink">{l.user_id}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-canvas border border-hairline text-body">
                        {l.user_role}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-primary">{l.action}</td>
                    <td className="py-3 text-body">{l.resource_id}</td>
                    <td className="py-3 text-muted font-sans text-xs max-w-xs truncate">
                      {JSON.stringify(l.details)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-canvas border border-hairline text-status-success font-mono font-bold">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted">
                    No audit records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
