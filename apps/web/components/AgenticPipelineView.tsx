"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  Bot,
  Cpu,
  Brain,
  Database,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  History,
  FileCode,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileText,
} from "lucide-react";

export const AgenticPipelineView: React.FC = () => {
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeDataset, setActiveDataset] = useState("Connected Retail Network");

  // Custom data input state for generic analysis
  const [customCsvInput, setCustomCsvInput] = useState("");
  const [datasetMode, setDatasetMode] = useState<"preset" | "custom">("preset");

  // Human feedback / memory submission form
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState("OVERRIDE_TRANSIT_LEAD_TIME");
  const [feedbackSummary, setFeedbackSummary] = useState("Adjusted lead-time buffer for freight border transit delays");
  const [feedbackDetails, setFeedbackDetails] = useState("Traffic delays along regional transit corridors require +4 hours buffer.");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const fetchMemories = async () => {
    try {
      const res = await api.getContextMemories();
      if (res.status === "success" && res.memories) {
        setMemories(res.memories);
      }
    } catch (err) {
      console.error("Failed to fetch memories:", err);
    }
  };

  const handleRunPipeline = async (customData?: any[], datasetName?: string) => {
    setRunningPipeline(true);
    try {
      const dName = datasetName || activeDataset;
      const res = await api.runAgentPipeline(dName, customData);
      if (res.status === "success") {
        setPipelineResult(res);
        fetchMemories();
      }
    } catch (err) {
      console.error("Pipeline run error:", err);
    } finally {
      setRunningPipeline(false);
    }
  };

  useEffect(() => {
    fetchMemories();
    handleRunPipeline();
  }, []);

  const handleCustomDataSubmit = () => {
    if (!customCsvInput.trim()) return;
    try {
      const lines = customCsvInput.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const parsedData = lines.slice(1).map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = isNaN(Number(parts[idx])) ? parts[idx] : Number(parts[idx]);
        });
        return row;
      });
      handleRunPipeline(parsedData, "Uploaded Custom CSV Dataset");
    } catch (err) {
      alert("Invalid CSV format. Please ensure comma-separated values.");
    }
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);
    try {
      await api.recordAgentFeedback({
        session_id: "human_review_session",
        memory_type: "feedback",
        agent_name: "GovernanceAgent",
        key: feedbackKey,
        summary: feedbackSummary,
        content: {
          note: feedbackDetails,
          submitted_at: new Date().toISOString(),
          decision_quality_flag: "HUMAN_OVERRIDE_RECORDED",
        },
        importance_score: 0.95,
      });
      setShowFeedbackModal(false);
      fetchMemories();
    } catch (err) {
      console.error("Failed to save feedback memory:", err);
    } finally {
      setSavingFeedback(false);
    }
  };

  const PRESET_DATASETS = [
    {
      id: "Connected Retail Network",
      label: "Active Database Network (Live Neon PostgreSQL)",
      data: undefined, // Uses live Neon DB
    },
    {
      id: "Omnichannel Electronics Network",
      label: "Omnichannel Electronics (8 Hubs, Laptops & Smartphones)",
      data: [
        { store_id: "HUB_MUMBAI", sku: "SKU_LAPTOP_PRO", sales_velocity: 18, on_hand_units: 9, unit_price: 68000, category: "Laptops" },
        { store_id: "HUB_DELHI", sku: "SKU_LAPTOP_AIR", sales_velocity: 24, on_hand_units: 52, unit_price: 52000, category: "Laptops" },
        { store_id: "HUB_BANGALORE", sku: "SKU_PHONE_FLAGSHIP", sales_velocity: 45, on_hand_units: 14, unit_price: 42000, category: "Smartphones" },
        { store_id: "HUB_CHENNAI", sku: "SKU_AUDIO_ANC", sales_velocity: 32, on_hand_units: 110, unit_price: 9500, category: "Audio" },
        { store_id: "HUB_HYDERABAD", sku: "SKU_TABLET_11", sales_velocity: 19, on_hand_units: 8, unit_price: 31000, category: "Tablets" },
      ],
    },
    {
      id: "Seasonal Apparel Chain",
      label: "Fashion Apparel Retail (12 Boutiques, Sizes & Colors)",
      data: [
        { store_id: "BOUTIQUE_KORAMANGALA", sku: "SKU_LINEN_SHIRT_M", sales_velocity: 14, on_hand_units: 6, unit_price: 2490, category: "Menswear" },
        { store_id: "BOUTIQUE_INDIRANAGAR", sku: "SKU_SILK_KURTI_L", sales_velocity: 22, on_hand_units: 48, unit_price: 3200, category: "Womenswear" },
        { store_id: "BOUTIQUE_BANDRA", sku: "SKU_DENIM_SLIM_32", sales_velocity: 35, on_hand_units: 12, unit_price: 3800, category: "Denim" },
        { store_id: "BOUTIQUE_COLABA", sku: "SKU_COTTON_TEE_XL", sales_velocity: 40, on_hand_units: 85, unit_price: 1199, category: "Casuals" },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              Cognitive Architecture
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-muted text-xs font-mono">Neon PostgreSQL Working & Episodic Memory</span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink mt-1">
            Agentic Pipeline & Context Memory Engine
          </h1>
          <p className="text-sm text-body mt-1">
            Autonomous multi-agent cycle coordinating data profiling, risk detection, constraint optimization, discrete simulation, and governance gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-canvas hover:bg-surface-card border border-hairline rounded-md text-xs font-medium text-ink transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-primary" />
            <span>Record Human Override</span>
          </button>

          <button
            onClick={() => handleRunPipeline()}
            disabled={runningPipeline}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded-md text-xs font-medium transition shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${runningPipeline ? "animate-spin" : ""}`} />
            <span>{runningPipeline ? "Executing Agents..." : "Run Multi-Agent Cycle"}</span>
          </button>
        </div>
      </div>

      {/* Agents Topology Diagram */}
      <div className="bg-surface-card border border-hairline rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
            5-Stage Autonomous Agent Topology
          </span>
          <span className="text-xs font-mono text-muted">
            Execution Time: <strong className="text-ink">{pipelineResult?.execution_time_ms || 140}ms</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            {
              step: "01",
              name: "ProfilerAgent",
              role: "Generic Ingestion",
              desc: "Infers schema & distribution moments",
              active: true,
            },
            {
              step: "02",
              name: "RiskAgent",
              role: "Anomaly Scanner",
              desc: "Scans stockouts & capital lockups",
              active: true,
            },
            {
              step: "03",
              name: "OptimizerAgent",
              role: "Operations Research",
              desc: "Evaluates alternatives & constraints",
              active: true,
            },
            {
              step: "04",
              name: "SimulatorAgent",
              role: "Network Ripple",
              desc: "14-day discrete counterfactual",
              active: true,
            },
            {
              step: "05",
              name: "GovernanceAgent",
              role: "Decision Gate",
              desc: "Confidence checks & approval routing",
              active: true,
            },
          ].map((agent, idx) => (
            <div
              key={agent.name}
              className="bg-canvas border border-hairline rounded-md p-4 relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-primary font-semibold">{agent.step}</span>
                <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
              </div>
              <div className="font-serif text-base font-medium text-ink">{agent.name}</div>
              <div className="text-[11px] font-mono text-muted">{agent.role}</div>
              <p className="text-[11px] text-body mt-2 leading-tight">{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generic Dataset Capability Selector */}
      <div className="bg-canvas border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
              Generic System Architecture
            </div>
            <h3 className="font-serif text-xl font-medium text-ink mt-0.5">
              Analyze Any Tabular Retail Dataset
            </h3>
            <p className="text-xs text-muted">
              KINTRAL's Profiler and Optimizer agents dynamically adapt to any column names, units, and inventory structures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDatasetMode("preset")}
              className={`px-3 py-1.5 text-xs font-mono rounded border transition ${
                datasetMode === "preset"
                  ? "bg-surface-dark text-on-dark border-surface-dark"
                  : "bg-surface-card text-muted border-hairline hover:text-ink"
              }`}
            >
              Preset Benchmarks
            </button>
            <button
              onClick={() => setDatasetMode("custom")}
              className={`px-3 py-1.5 text-xs font-mono rounded border transition ${
                datasetMode === "custom"
                  ? "bg-surface-dark text-on-dark border-surface-dark"
                  : "bg-surface-card text-muted border-hairline hover:text-ink"
              }`}
            >
              Custom CSV Ingestion
            </button>
          </div>
        </div>

        {datasetMode === "preset" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {PRESET_DATASETS.map((ds) => {
              const isSelected = activeDataset === ds.id;
              return (
                <button
                  key={ds.id}
                  onClick={() => {
                    setActiveDataset(ds.id);
                    handleRunPipeline(ds.data, ds.id);
                  }}
                  className={`p-3 rounded border text-left transition ${
                    isSelected
                      ? "bg-surface-soft border-primary ring-1 ring-primary"
                      : "bg-surface-card border-hairline hover:border-muted/50"
                  }`}
                >
                  <div className="text-xs font-medium text-ink">{ds.label}</div>
                  <div className="text-[11px] font-mono text-muted mt-1">
                    {isSelected ? "● Active in Pipeline" : "Click to Analyze"}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="text-xs text-muted">
              Paste raw CSV text below (must include headers like <code>store_id, sku, sales, stock, price</code>):
            </div>
            <textarea
              rows={4}
              value={customCsvInput}
              onChange={(e) => setCustomCsvInput(e.target.value)}
              placeholder="store_id,sku,sales_velocity,on_hand_units,selling_price&#10;STORE_NORTH,SKU_ELEC_01,24,18,1499.0&#10;STORE_SOUTH,SKU_ELEC_02,38,12,2899.0&#10;STORE_EAST,SKU_ELEC_03,15,45,850.0"
              className="w-full p-3 bg-surface-card border border-hairline rounded font-mono text-xs text-ink focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCustomDataSubmit}
              disabled={runningPipeline || !customCsvInput.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded text-xs font-medium transition"
            >
              Profile &amp; Run Agentic Cycle on Uploaded Data
            </button>
          </div>
        )}
      </div>

      {/* Main Execution Output: Traces & Memory Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Agent Reasoning Traces */}
        <div className="lg:col-span-7 bg-surface-card border border-hairline rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-serif text-lg font-medium text-ink">Agent Execution Trace Log</h3>
            </div>
            <span className="text-xs font-mono text-muted">
              {pipelineResult?.agent_traces?.length || 0} Events Logged
            </span>
          </div>

          <div className="space-y-3">
            {pipelineResult?.agent_traces?.map((trace: any, idx: number) => (
              <div
                key={idx}
                className="bg-canvas border border-hairline rounded p-3 text-xs space-y-1.5 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong className="text-ink">{trace.agent}</strong>
                    <span className="text-muted">:: {trace.action}</span>
                  </div>
                  <span className="text-muted text-[10px]">{trace.timestamp?.substring(11, 19)}</span>
                </div>
                <div className="text-body font-normal">{trace.details}</div>
                {trace.memory_retrieved && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-soft border border-hairline font-mono text-[10px] text-primary">
                    <Brain className="w-3 h-3" />
                    <span>Memory Recall: {trace.memory_retrieved}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Primary Recommendation Banner */}
          {pipelineResult?.primary_recommendation && (
            <div className="mt-4 p-4 rounded bg-surface-soft border border-primary/40 ring-1 ring-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                  Synthesized Autonomous Move
                </span>
                <span className="text-xs font-mono text-status-success font-medium">
                  {pipelineResult.governance_gate?.decision_gate_status}
                </span>
              </div>
              <div className="font-serif text-base font-medium text-ink">
                {pipelineResult.primary_recommendation.recommended_title}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-hairline text-center">
                <div className="bg-canvas p-1.5 rounded border border-hairline">
                  <span className="text-[10px] text-muted block">Quantity</span>
                  <strong className="text-ink">{pipelineResult.primary_recommendation.recommended_quantity} units</strong>
                </div>
                <div className="bg-canvas p-1.5 rounded border border-hairline">
                  <span className="text-[10px] text-muted block">Net Profit</span>
                  <strong className="text-status-success">+₹{pipelineResult.primary_recommendation.expected_profit_impact_inr?.toLocaleString()}</strong>
                </div>
                <div className="bg-canvas p-1.5 rounded border border-hairline">
                  <span className="text-[10px] text-muted block">Service Target</span>
                  <strong className="text-primary">{pipelineResult.primary_recommendation.service_level_target}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Neon PostgreSQL Context Memory Inspector */}
        <div className="lg:col-span-5 bg-surface-card border border-hairline rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-teal" />
              <h3 className="font-serif text-lg font-medium text-ink">Neon Context Memory</h3>
            </div>
            <span className="text-xs font-mono text-muted">{memories.length} Episodes</span>
          </div>
          <p className="text-xs text-muted">
            Episodic memories retrieved from Neon PostgreSQL. When novel risks emerge, agents query this store to enforce learned constraints and honor previous executive rulings.
          </p>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {memories.map((m: any) => (
              <div
                key={m.id}
                className="bg-canvas border border-hairline rounded p-3 text-xs space-y-1.5 hover:border-muted/50 transition"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-surface-soft border border-hairline text-primary uppercase text-[9px] font-semibold">
                    {m.memory_type}
                  </span>
                  <span className="text-muted text-[10px]">Score: {m.importance_score}</span>
                </div>
                <div className="font-medium text-ink text-xs">{m.summary || m.key}</div>
                <div className="text-[11px] text-body line-clamp-2">
                  {typeof m.content === "object" ? JSON.stringify(m.content) : m.content}
                </div>
                <div className="text-[10px] font-mono text-muted flex items-center justify-between pt-1 border-t border-hairline">
                  <span>Scope: {m.entity_scope || "GLOBAL"}</span>
                  <span>{m.agent_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Human Override Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/40 p-4 backdrop-blur-sm">
          <div className="bg-canvas border border-hairline rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-serif text-xl font-medium text-ink">Record Human Decision Policy in Neon DB</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-muted hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted">
              Add a persistent episodic memory episode. All future autonomous agent runs will respect this policy.
            </p>

            <form onSubmit={handleSaveFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
                  Memory Key / Identifier
                </label>
                <input
                  type="text"
                  value={feedbackKey}
                  onChange={(e) => setFeedbackKey(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-card border border-hairline rounded text-xs font-mono text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
                  Executive Ruling Summary
                </label>
                <input
                  type="text"
                  value={feedbackSummary}
                  onChange={(e) => setFeedbackSummary(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-card border border-hairline rounded text-xs font-mono text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
                  Policy Constraint Details
                </label>
                <textarea
                  rows={3}
                  value={feedbackDetails}
                  onChange={(e) => setFeedbackDetails(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-card border border-hairline rounded text-xs font-mono text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-3 py-2 bg-surface-card hover:bg-surface-cream-strong border border-hairline rounded text-xs text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFeedback}
                  className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded text-xs font-medium transition"
                >
                  {savingFeedback ? "Persisting to Neon DB..." : "Save to Neon Episodic Memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
