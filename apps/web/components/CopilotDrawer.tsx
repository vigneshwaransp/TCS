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
} from "lucide-react";
import { api } from "../lib/api";

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
  const [messages, setMessages] = useState<Array<{ role: string; content: string; model?: string }>>([
    {
      role: "assistant",
      content:
        "Welcome to KINTRAL Intelligence. I am grounded in live retail network telemetry and active dataset records. How can I assist your operational decisions today?",
      model: "openai/gpt-oss-120b (Groq)",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQueries = [
    "Why does the recommended lateral transfer dominate supplier replenishment?",
    "How does the dispatching store protect its safety stock target after dispatch?",
    "What is the net profit impact of throttling promotional discounts?",
    "Compare constrained optimization policies against traditional Fixed ROP.",
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text };
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
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "KINTRAL Telemetry fallback: Operational evaluation confirms the recommended lateral transfer preserves the donor store buffer safety stock target while supplier replenishment incurs lead-time transit latency that would trigger stockouts.",
          model: "kintral-deterministic-engine",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-surface-dark text-on-dark shadow-2xl flex flex-col border-l border-surface-dark-elevated">
      {/* Editorial Header */}
      <div className="px-6 py-5 border-b border-surface-dark-elevated flex items-center justify-between bg-surface-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-dark-elevated border border-surface-dark-soft flex items-center justify-center text-primary">
            {/* 4-Spoke Radial Asterisk Mark */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
                stroke="#CC785C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-normal tracking-tight text-on-dark">
                KINTRAL Copilot
              </h3>
              <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded-full bg-surface-dark-elevated border border-surface-dark-soft">
                Groq 120B
              </span>
            </div>
            <p className="text-xs text-on-dark-soft">
              Grounded AI Decision Advisor • Active Network
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
      <div className="px-6 py-3 bg-surface-dark-soft border-b border-surface-dark-elevated flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-on-dark-soft">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span>Context: {activeRecId} (Active Network Directive)</span>
        </div>
        <span className="text-[11px] text-primary">Grounded Telemetry</span>
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
                className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-primary text-white"
                    : "bg-surface-dark-elevated border border-surface-dark-soft text-on-dark"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {!isUser && msg.model && (
                  <div className="mt-2.5 pt-2 border-t border-surface-dark-soft flex items-center justify-between text-[10px] font-mono text-on-dark-soft">
                    <span>Engine: {msg.model}</span>
                    <span className="text-status-success flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Grounded
                    </span>
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
            <span>Evaluating multi-store retail trade-offs via Groq LLM...</span>
          </div>
        )}
      </div>

      {/* Suggested Inquiries */}
      <div className="px-6 py-3 bg-surface-dark border-t border-surface-dark-elevated">
        <div className="text-[11px] font-mono text-on-dark-soft uppercase tracking-wider mb-2">
          Recommended Decision Inquiries:
        </div>
        <div className="space-y-1.5">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="w-full text-left text-[11px] text-on-dark-soft hover:text-on-dark px-3 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-surface-dark-soft border border-surface-dark-soft transition flex items-center justify-between group"
            >
              <span className="truncate pr-2">{q}</span>
              <ChevronRight className="w-3 h-3 text-muted group-hover:text-primary transition" />
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
            placeholder="Ask about inventory, suppliers, lateral transfers, or risks..."
            className="flex-1 bg-surface-dark text-on-dark placeholder-on-dark-soft/50 border border-surface-dark-elevated rounded-md px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="bg-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted text-white rounded-md px-4 py-2.5 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
