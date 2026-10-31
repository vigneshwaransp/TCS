"use client";

import React, { useState } from "react";
import {
  Compass,
  GitBranch,
  Network,
  Cpu,
  Layers,
  ShieldAlert,
  History,
  FlaskConical,
  TrendingUp,
  Package,
  Truck,
  Tag,
  UploadCloud,
  FileText,
  Sparkles,
  ChevronDown,
  BarChart3,
  Bot,
  LogOut,
} from "lucide-react";
import { AuthUser, PRESET_PERSONAS } from "./LoginPage";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeRole: string;
  onChangeRole: (role: string) => void;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
  apiConnected: boolean;
  onOpenCopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeRole,
  onChangeRole,
  currentUser,
  onSignOut,
  apiConnected,
  onOpenCopilot,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const activeUser = currentUser || PRESET_PERSONAS[0];

  return (
    <header className="sticky top-0 z-40 bg-canvas border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark with Anthropic Radial-Spike Mark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab("dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-surface-dark flex items-center justify-center text-primary border border-surface-dark-elevated">
              {/* Anthropic 4-Spoke Radial Asterisk Glyph */}
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
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-normal tracking-[-0.03em] text-ink">KINTRAL</span>
                <span className="text-[11px] font-mono tracking-widest text-primary font-semibold px-2 py-0.5 rounded-full bg-surface-card border border-hairline">
                  Decision Intelligence
                </span>
              </div>
              <p className="text-[11px] text-muted -mt-0.5 font-normal tracking-tight">See the signal. Make the move.</p>
            </div>
          </div>

          {/* Quick status, Copilot Trigger & User Switcher */}
          <div className="flex items-center gap-3">
            {/* Live API Heartbeat with solid dot */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted bg-surface-card px-3 py-1.5 rounded-full border border-hairline">
              <span className={`w-2 h-2 rounded-full ${apiConnected ? "bg-status-success animate-pulse" : "bg-status-error"}`} />
              <span>{apiConnected ? "Neon DB + DMart Active" : "Connecting API..."}</span>
            </div>

            {/* AI Copilot Button (Coral Highlight) */}
            <button
              onClick={onOpenCopilot}
              className="bg-primary hover:bg-primary-active text-on-primary px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
              <span className="font-mono text-[9px] bg-canvas text-primary px-1.5 py-0.2 rounded-full font-bold ml-0.5 border border-primary/30">120B</span>
            </button>

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 bg-surface-card hover:bg-surface-cream-strong border border-hairline px-3 py-1.5 rounded-md text-xs transition"
              >
                <div className="w-6 h-6 rounded-full bg-surface-dark text-on-dark flex items-center justify-center font-mono font-bold text-[10px]">
                  {activeUser.avatar_initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-ink flex items-center gap-1.5">
                    {activeUser.full_name}
                    <span className="text-[10px] text-primary font-mono font-semibold">[{activeUser.role}]</span>
                  </div>
                  <div className="text-[10px] text-muted">{activeUser.role_display}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted ml-0.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-canvas border border-hairline rounded-lg shadow-lg py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-hairline">
                    <div className="text-[11px] font-mono text-muted uppercase tracking-wider">Active Session</div>
                    <div className="font-medium text-ink text-sm mt-0.5">{activeUser.full_name}</div>
                    <div className="text-muted text-[11px] font-mono">{activeUser.email}</div>
                  </div>

                  <div className="px-3 py-1.5 bg-surface-soft border-b border-hairline text-[11px] font-mono text-muted uppercase tracking-wider">
                    Switch Persona (RBAC)
                  </div>
                  {PRESET_PERSONAS.map((p) => (
                    <button
                      key={p.user_id}
                      onClick={() => {
                        onChangeRole(p.role.toLowerCase());
                        setUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-card transition ${
                        activeUser.user_id === p.user_id ? "bg-surface-card font-medium" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-surface-dark text-on-dark text-[9px] font-mono flex items-center justify-center">
                          {p.avatar_initials}
                        </span>
                        <div>
                          <div className="text-ink font-medium">{p.full_name}</div>
                          <div className="text-[10px] text-muted">{p.role_display}</div>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-canvas border border-hairline text-body">
                        {p.role}
                      </span>
                    </button>
                  ))}

                  {onSignOut && (
                    <div className="pt-1 mt-1 border-t border-hairline">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-status-error hover:bg-surface-card transition flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Platform</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-hairline">
          {[
            { id: "dashboard", label: "Executive Cockpit", icon: Compass },
            { id: "visuals", label: "Matplotlib Visuals", icon: BarChart3 },
            { id: "agents", label: "Agentic Pipeline & Memory", icon: Bot },
            { id: "decisions", label: "Decision Inbox", icon: Layers },
            { id: "twin", label: "1. Decision Twin", icon: Cpu },
            { id: "replay", label: "2. Replay Studio", icon: GitBranch },
            { id: "ripple", label: "3. Ripple Impact", icon: Network },
            { id: "assurance", label: "4. Decision Gate", icon: ShieldAlert },
            { id: "regret", label: "5. Regret Engine", icon: History },
            { id: "policy", label: "Policy Lab", icon: FlaskConical },
            { id: "demand", label: "Demand Intel", icon: TrendingUp },
            { id: "inventory", label: "Inventory Network", icon: Package },
            { id: "logistics", label: "Suppliers & Routes", icon: Truck },
            { id: "promotions", label: "Promotions & Margin", icon: Tag },
            { id: "data", label: "Data Management", icon: UploadCloud },
            { id: "governance", label: "Audit & Governance", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-surface-dark text-on-dark shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surface-card"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
