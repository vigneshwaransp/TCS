"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { LoginPage, AuthUser, PRESET_PERSONAS } from "../components/LoginPage";
import { ExecutiveCockpit } from "../components/ExecutiveCockpit";
import { VisualizationsView } from "../components/VisualizationsView";
import { AgenticPipelineView } from "../components/AgenticPipelineView";
import { InventoryView } from "../components/InventoryView";
import { DataManagementView } from "../components/DataManagementView";
import { CopilotDrawer } from "../components/CopilotDrawer";
import { api } from "../lib/api";

export default function Home() {
  // Authentication & Persona state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Active navigation tab (streamlined: 5 core views)
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [activeRole, setActiveRole] = useState("admin");
  const [apiConnected, setApiConnected] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Active Dataset tracker (100% dynamic)
  const [activeDatasetName, setActiveDatasetName] = useState("Connected Retail Network");

  // Cross-view selection state
  const [selectedRecId, setSelectedRecId] = useState("REC_001");
  const [selectedStoreId, setSelectedStoreId] = useState("STORE_001");
  const [selectedSku, setSelectedSku] = useState("SKU_DM_0001");

  // Dashboard shared data
  const [summary, setSummary] = useState<any>(null);
  const [priorityDecisions, setPriorityDecisions] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Check stored session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kintral_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAuthUser(parsed);
          setActiveRole(parsed.role?.toLowerCase() || "admin");
        } catch (e) {
          localStorage.removeItem("kintral_session");
        }
      }
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    setActiveRole(user.role.toLowerCase());
    if (typeof window !== "undefined") {
      localStorage.setItem("kintral_session", JSON.stringify(user));
      localStorage.setItem("kintral_role", user.role.toLowerCase());
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kintral_session");
    }
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("kintral_role", role);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const [sumRes, prioRes] = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getPriorityDecisions(),
      ]);

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value);
        if (sumRes.value.operator_name && activeDatasetName === "Connected Retail Network") {
          setActiveDatasetName(`${sumRes.value.operator_name} Network`);
        }
        setApiConnected(true);
      } else {
        setApiConnected(false);
      }

      if (prioRes.status === "fulfilled") {
        setPriorityDecisions(prioRes.value || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setApiConnected(false);
    } finally {
      setLoadingDashboard(false);
    }
  }, [activeDatasetName]);

  useEffect(() => {
    if (authUser) {
      fetchDashboardData();
      const timer = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(timer);
    }
  }, [authUser, fetchDashboardData]);

  const handleSelectRecommendation = (recId: string) => {
    setSelectedRecId(recId);
    setCurrentTab("agents");
  };

  const handleOpenGate = (recId: string) => {
    setSelectedRecId(recId);
    setCurrentTab("agents");
  };

  const handleDatasetActivated = (datasetName: string) => {
    setActiveDatasetName(datasetName);
    fetchDashboardData();
  };

  // If session is checking or user is not logged in, show Login Page first!
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row font-sans selection:bg-primary/20 text-ink">
      {/* Left Sidebar Navigation (Side Nav replacing top bar) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRole={activeRole}
        onChangeRole={handleRoleChange}
        currentUser={authUser}
        onSignOut={handleSignOut}
        apiConnected={apiConnected}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        activeDatasetName={activeDatasetName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* 1. EXECUTIVE COCKPIT (Overview & Live Metrics from active dataset) */}
          {currentTab === "dashboard" && (
            <ExecutiveCockpit
              summary={summary}
              priorityDecisions={priorityDecisions}
              loading={loadingDashboard}
              onSelectRecommendation={handleSelectRecommendation}
              onOpenGate={handleOpenGate}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          )}

          {/* 2. VISUAL ANALYTICS (Matplotlib Charts & Histograms from dataset) */}
          {currentTab === "visuals" && <VisualizationsView />}

          {/* 3. AGENTIC DECISION ENGINE (Autonomous Multi-Agent Cycle + Context Memory) */}
          {currentTab === "agents" && <AgenticPipelineView />}

          {/* 4. INVENTORY POSITIONS & RISK RADAR */}
          {currentTab === "inventory" && (
            <InventoryView
              onSelectAction={(sId, skuId) => {
                setSelectedStoreId(sId);
                setSelectedSku(skuId);
                setCurrentTab("agents");
              }}
            />
          )}

          {/* 5. DATA MANAGEMENT & INGESTION (Upload Any CSV / Dataset) */}
          {currentTab === "data" && (
            <DataManagementView
              onDatasetActivated={handleDatasetActivated}
              activeDatasetName={activeDatasetName}
            />
          )}
        </main>

        {/* Warm Espresso Footer (No Black) */}
        <footer className="mt-auto border-t border-hairline bg-surface-card py-6 text-xs text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-medium text-ink text-sm">KINTRAL</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-body">{activeDatasetName}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-accent-teal">● Neon PostgreSQL Connected</span>
              <span>•</span>
              <span className="text-primary">Groq 120B Connected</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating AI Decision Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeRecId={selectedRecId}
        onSelectRec={setSelectedRecId}
      />
    </div>
  );
}
