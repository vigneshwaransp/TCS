"use client";

import React, { useState } from "react";
import {
  Compass,
  BarChart3,
  Bot,
  Package,
  UploadCloud,
  Sparkles,
  LogOut,
  ChevronDown,
  Database,
  Menu,
  X,
  UserPlus,
  Building2,
  TrendingUp,
} from "lucide-react";
import { AuthUser, PRESET_PERSONAS } from "./LoginPage";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeRole: string;
  onChangeRole: (role: string) => void;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
  apiConnected: boolean;
  onOpenCopilot: () => void;
  activeDatasetName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeRole,
  onChangeRole,
  currentUser,
  onSignOut,
  apiConnected,
  onOpenCopilot,
  activeDatasetName = "Connected Retail Network",
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeUser = currentUser || PRESET_PERSONAS[0];

  const NAV_ITEMS = [
    {
      id: "dashboard",
      label: "Executive Cockpit",
      description: "Network telemetry & directives",
      icon: Compass,
    },
    {
      id: "store_performance",
      label: "Store Performance",
      description: "Stock • Demand • Required • Net",
      icon: Building2,
    },
    {
      id: "demand_risk",
      label: "Demand & Risk Prediction",
      description: "Quantile bounds & stockout risk",
      icon: TrendingUp,
    },
    {
      id: "explain_recs",
      label: "Explain Recommendations",
      description: "Root causes & React Markdown",
      icon: Sparkles,
    },
    {
      id: "visuals",
      label: "Visual Analytics",
      description: "Matplotlib & KDE histograms",
      icon: BarChart3,
    },
    {
      id: "agents",
      label: "Agentic Decision Engine",
      description: "Autonomous agents & memory",
      icon: Bot,
    },
    {
      id: "inventory",
      label: "Inventory & Positions",
      description: "Store stock & safety buffers",
      icon: Package,
    },
    {
      id: "data",
      label: "Data Ingestion & CSV",
      description: "Upload & analyze any dataset",
      icon: UploadCloud,
    },
    {
      id: "manual_entry",
      label: "User Registry & Entry",
      description: "Permanent manual DB records",
      icon: UserPlus,
    },
  ];

  return (
    <>
      {/* Mobile Top Header (Small Screens only) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-canvas border-b border-hairline sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <rect x="10.75" y="1" width="2.5" height="22" rx="1.25" />
            <rect x="1" y="10.75" width="22" height="2.5" rx="1.25" />
            <rect x="3.8" y="5.5" width="2.5" height="18" rx="1.25" transform="rotate(-45 5.05 14.5)" />
            <rect x="5.5" y="3.8" width="18" height="2.5" rx="1.25" transform="rotate(-45 14.5 5.05)" />
          </svg>
          <span className="font-serif text-xl font-medium tracking-tight text-ink">KINTRAL</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md bg-surface-card border border-hairline text-ink"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Left Vertical Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-surface-card border-r border-hairline flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header with 4-spoke asterisk mark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab("dashboard")}>
            <div className="w-9 h-9 rounded-lg bg-surface-dark flex items-center justify-center text-primary border border-surface-dark-elevated shadow-sm flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
                  stroke="#C86D51"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-normal tracking-tight text-ink">KINTRAL</span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted -mt-0.5">
                Decision Intelligence
              </p>
            </div>
          </div>

          {/* Active Dataset Status Card */}
          <div className="bg-canvas border border-hairline rounded-lg p-3 text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-wider">
              <span>Active Dataset</span>
              <span className={`w-2 h-2 rounded-full ${apiConnected ? "bg-accent-teal animate-pulse" : "bg-status-error"}`} />
            </div>
            <div className="font-medium text-ink text-xs truncate" title={activeDatasetName}>
              {activeDatasetName}
            </div>
            <div className="text-[10px] font-mono text-muted">Neon PostgreSQL Verified</div>
          </div>

          {/* AI Decision Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="w-full bg-primary hover:bg-primary-active text-on-primary py-2.5 px-3 rounded-md text-xs font-medium transition flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Copilot</span>
            </div>
            <span className="font-mono text-[9px] bg-canvas text-primary px-1.5 py-0.5 rounded font-bold border border-primary/20">
              120B
            </span>
          </button>

          {/* Streamlined Navigation Links (5 Focused Views) */}
          <nav className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted px-2 py-1">
              Workspace
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all flex items-center gap-3 ${
                    isActive
                      ? "bg-surface-dark text-on-dark shadow-sm"
                      : "text-body hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted"}`} />
                  <div className="truncate">
                    <div className="font-medium leading-tight">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? "text-on-dark-soft" : "text-muted"}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Persona & Sign Out Section */}
        <div className="pt-4 border-t border-hairline relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-canvas transition text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-surface-dark text-on-dark text-xs font-mono font-medium flex items-center justify-center flex-shrink-0">
                {activeUser.avatar_initials}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-ink truncate flex items-center gap-1.5">
                  <span>{activeUser.full_name}</span>
                </div>
                <div className="text-[10px] text-muted font-mono">{activeUser.role} • {activeUser.role_display}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted flex-shrink-0 ml-1" />
          </button>

          {/* User Persona Switcher & Sign Out Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-16 left-0 w-64 bg-canvas border border-hairline rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-hairline">
                <div className="text-[10px] font-mono text-muted uppercase">Signed in as</div>
                <div className="font-medium text-ink mt-0.5">{activeUser.full_name}</div>
                <div className="text-muted text-[10px] font-mono truncate">{activeUser.email}</div>
              </div>

              <div className="px-3 py-1 bg-surface-soft border-b border-hairline text-[10px] font-mono text-muted uppercase">
                Switch Persona
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
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-dark text-on-dark text-[9px] font-mono flex items-center justify-center">
                      {p.avatar_initials}
                    </span>
                    <div>
                      <div className="text-ink font-medium text-xs">{p.full_name}</div>
                      <div className="text-[10px] text-muted">{p.role_display}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-canvas border border-hairline text-body">
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
      </aside>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-surface-dark/40 z-40 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
};
