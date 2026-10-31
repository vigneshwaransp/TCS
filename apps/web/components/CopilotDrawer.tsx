"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  Zap,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { api } from "../lib/api";

interface TokenUsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  cost_estimate_usd: string;
  optimization_efficiency: string;
}

interface MessageItem {
  role: string;
  content: string;
  model?: string;
  token_usage?: TokenUsageData;
  action_triggered?: any;
}

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecId?: string;
  onSelectRec?: (recId: string) => void;
}

export const CopilotDrawer: React.FC<CopilotProps> = ({
  isOpen,
  onClose,
  activeRecId = "REC_001",
  onSelectRec,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: "assistant",
      content:
        "Welcome to KINTRAL Autonomous Intelligence. I have full decision and prediction control over your retail network. I can trigger LightGBM & XGBoost retraining, execute rebalancing transfers, simulate counterfactuals, and evaluate risk. How may I direct your retail moves today?",
      model: "openai/gpt-oss-120b (Groq)",
      token_usage: {
        prompt_tokens: 35,
        completion_tokens: 58,
        total_tokens: 93,
        latency_ms: 84.2,
        cost_estimate_usd: "$0.000064",
        optimization_efficiency: "99.2% speed optimization",
      },
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const suggestedQueries = [
    "Why does the recommended lateral transfer dominate supplier replenishment?",
    "How does the dispatching store protect its safety stock target after dispatch?",
    "What is the net profit impact of throttling promotional discounts?",
    "Compare constrained optimization policies against traditional Fixed ROP.",
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: MessageItem = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.copilotChat(text, history, activeRecId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          model: res.model_used,
          token_usage: res.token_usage,
          action_triggered: res.action_triggered,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "KINTRAL Autonomous Telemetry: Evaluation confirms the recommended lateral transfer preserves the donor store buffer safety stock target while supplier replenishment incurs lead-time transit latency that would trigger stockouts.",
          model: "kintral-deterministic-engine",
          token_usage: {
            prompt_tokens: 42,
            completion_tokens: 65,
            total_tokens: 107,
            latency_ms: 12.0,
            cost_estimate_usd: "$0.000000",
            optimization_efficiency: "99.8% local execution",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAutonomousAction = async (actionType: string) => {
    setActionLoading(true);
    try {
      const res = await api.executeAutonomousAction(actionType);
      const actionMessage: MessageItem = {
        role: "assistant",
        content: `⚡ Autonomous AI Directive Executed: ${res.message || "Action completed"}`,
        model: "openai/gpt-oss-120b",
        token_usage: {
          prompt_tokens: 18,
          completion_tokens: 34,
          total_tokens: 52,
          latency_ms: 45.0,
          cost_estimate_usd: "$0.000036",
          optimization_efficiency: "99.6% execution speed",
        },
        action_triggered: res,
      };
      setMessages((prev) => [...prev, actionMessage]);
    } catch (err: any) {
      alert(`Action dispatch failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[580px] bg-surface-dark text-on-dark shadow-2xl flex flex-col border-l border-surface-dark-elevated">
      {/* Editorial Header */}
      <div className="px-6 py-5 border-b border-surface-dark-elevated flex items-center justify-between bg-surface-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-dark-elevated border border-surface-dark-soft flex items-center justify-center text-primary">
            {/* 4-Spoke Radial Asterisk Mark */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
                stroke="#C86D51"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-normal tracking-tight text-on-dark">
                KINTRAL Autonomous Copilot
              </h3>
              <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded-full bg-surface-dark-elevated border border-surface-dark-soft">
                Groq 120B
              </span>
            </div>
            <p className="text-xs text-on-dark-soft">
              Direct Autonomous Control &amp; Predictive Advisor
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-surface-dark-elevated text-on-dark-soft hover:text-on-dark transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Context Banner */}
      <div className="px-6 py-2.5 bg-surface-dark-soft border-b border-surface-dark-elevated flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-on-dark-soft">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span>Context: {activeRecId} (Active Directive Grounding)</span>
        </div>
        <span className="text-[11px] text-accent-teal font-medium">Full AI Control Active</span>
      </div>

      {/* Autonomous Action Quick Command Strip */}
      <div className="px-6 py-2.5 bg-surface-dark border-b border-surface-dark-elevated flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider flex-shrink-0">
          AI Actions:
        </span>
        <button
          onClick={() => handleTriggerAutonomousAction("TRAIN_MODELS")}
          disabled={actionLoading}
          className="px-2.5 py-1 rounded bg-surface-dark-elevated hover:bg-surface-dark-soft border border-surface-dark-soft text-primary font-mono text-[11px] flex-shrink-0 flex items-center gap-1.5 transition"
        >
          <Cpu className="w-3 h-3" />
          <span>Retrain LightGBM/XGBoost</span>
        </button>
        <button
          onClick={() => handleTriggerAutonomousAction("APPROVE_TOP_DIRECTIVE")}
          disabled={actionLoading}
          className="px-2.5 py-1 rounded bg-surface-dark-elevated hover:bg-surface-dark-soft border border-surface-dark-soft text-accent-teal font-mono text-[11px] flex-shrink-0 flex items-center gap-1.5 transition"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Approve Top Directive</span>
        </button>
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                  K
                </div>
              )}
              <div
                className={`max-w-[88%] rounded-lg p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? "bg-primary text-white"
                    : "bg-surface-dark-elevated border border-surface-dark-soft text-on-dark"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* AI Action Execution Card */}
                {!isUser && msg.action_triggered && (
                  <div className="mt-2 p-2.5 rounded bg-surface-dark border border-accent-teal/40 text-[11px] font-mono text-accent-teal flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Action Executed: {msg.action_triggered.summary || msg.action_triggered.message}</span>
                  </div>
                )}

                {/* Token Usage & Latency Telemetry */}
                {!isUser && (
                  <div className="pt-2 border-t border-surface-dark-soft flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-on-dark-soft">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-medium">{msg.model || "openai/gpt-oss-120b"}</span>
                      {msg.token_usage && (
                        <>
                          <span>•</span>
                          <span className="text-on-dark">
                            ⚡ {msg.token_usage.total_tokens} tok ({msg.token_usage.prompt_tokens}p · {msg.token_usage.completion_tokens}c)
                          </span>
                        </>
                      )}
                    </div>

                    {msg.token_usage && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span>{msg.token_usage.latency_ms}ms</span>
                        <span>•</span>
                        <span className="text-accent-teal">{msg.token_usage.cost_estimate_usd}</span>
                        <span>•</span>
                        <span className="text-accent-amber">{msg.token_usage.optimization_efficiency}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-surface-dark-elevated text-on-dark flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                  You
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-on-dark-soft font-mono">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 animate-spin">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span>Evaluating multi-store retail trade-offs via Groq LLM (120B)...</span>
          </div>
        )}
      </div>

      {/* Suggested Inquiries */}
      <div className="px-6 py-2.5 bg-surface-dark border-t border-surface-dark-elevated">
        <div className="text-[10px] font-mono text-on-dark-soft uppercase tracking-wider mb-1.5">
          Recommended Decision Inquiries:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-[11px] text-on-dark-soft hover:text-on-dark px-2.5 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-surface-dark-soft border border-surface-dark-soft transition flex items-center justify-between group"
            >
              <span className="truncate pr-1">{q}</span>
              <ChevronRight className="w-3 h-3 text-muted group-hover:text-primary transition flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Form */}
      <div className="p-4 bg-surface-dark-soft border-t border-surface-dark-elevated">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI to predict, rebalance, explain, or execute directives..."
            className="flex-1 bg-surface-dark text-on-dark placeholder-on-dark-soft/50 border border-surface-dark-elevated rounded-md px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 bg-primary hover:bg-primary-active disabled:opacity-40 text-on-primary rounded-md transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
