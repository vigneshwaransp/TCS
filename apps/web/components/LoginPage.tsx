"use client";

import React, { useState } from "react";

export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  role_display: string;
  title: string;
  department: string;
  organization_id: string;
  avatar_initials: string;
}

export const PRESET_PERSONAS: AuthUser[] = [
  {
    user_id: "usr_radha",
    email: "radha.krishnan@dmart.in",
    full_name: "Radha Krishnan",
    role: "ADMIN",
    role_display: "VP Operations",
    title: "VP of Retail Operations & Supply Chain",
    department: "Executive Leadership",
    organization_id: "biz_dmart_retail",
    avatar_initials: "RK",
  },
  {
    user_id: "usr_sundar",
    email: "sundar.raman@dmart.in",
    full_name: "Sundar Raman",
    role: "OPS_MANAGER",
    role_display: "Retail Ops Manager",
    title: "Regional Operations Manager (Chennai Metro)",
    department: "Store Operations",
    organization_id: "biz_dmart_retail",
    avatar_initials: "SR",
  },
  {
    user_id: "usr_meera",
    email: "meera.natarajan@dmart.in",
    full_name: "Meera Natarajan",
    role: "PLANNER",
    role_display: "Inventory Planner",
    title: "Senior Supply Chain & Demand Planner",
    department: "Merchandising & Planning",
    organization_id: "biz_dmart_retail",
    avatar_initials: "MN",
  },
  {
    user_id: "usr_karthik",
    email: "karthik.venkatesh@dmart.in",
    full_name: "Karthik Venkatesh",
    role: "ANALYST",
    role_display: "Data Scientist",
    title: "Lead AI & Operations Research Scientist",
    department: "Decision Intelligence & ML",
    organization_id: "biz_dmart_retail",
    avatar_initials: "KV",
  },
  {
    user_id: "usr_pooja",
    email: "pooja.sharma@dmart.in",
    full_name: "Pooja Sharma",
    role: "VIEWER",
    role_display: "Compliance Auditor",
    title: "Senior Internal Audit & Governance Specialist",
    department: "Risk, Audit & Compliance",
    organization_id: "biz_dmart_retail",
    avatar_initials: "PS",
  },
];

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedPersona, setSelectedPersona] = useState<AuthUser>(PRESET_PERSONAS[0]);
  const [emailInput, setEmailInput] = useState(PRESET_PERSONAS[0].email);
  const [passwordInput, setPasswordInput] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPersona = (persona: AuthUser) => {
    setSelectedPersona(persona);
    setEmailInput(persona.email);
    setPasswordInput("••••••••••••");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(selectedPersona);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-6 md:p-12 selection:bg-primary/20">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full border-b border-hairline pb-6">
        <div className="flex items-center gap-3">
          {/* Anthropic-style 4-spoke asterisk mark */}
          <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <rect x="10.75" y="1" width="2.5" height="22" rx="1.25" />
            <rect x="1" y="10.75" width="22" height="2.5" rx="1.25" />
            <rect x="3.8" y="5.5" width="2.5" height="18" rx="1.25" transform="rotate(-45 5.05 14.5)" />
            <rect x="5.5" y="3.8" width="18" height="2.5" rx="1.25" transform="rotate(-45 14.5 5.05)" />
          </svg>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-medium tracking-tight text-ink">KINTRAL</span>
            <span className="text-xs uppercase tracking-widest text-muted font-mono">Decision Intelligence</span>
          </div>
        </div>

        {/* System telemetry pill */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span>Neon PostgreSQL: <strong className="text-body font-semibold">Active</strong></span>
          </div>
          <div className="h-3 w-px bg-hairline" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Groq LLM: <strong className="text-body font-semibold">120B Connected</strong></span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Brand Statement & Enterprise Credentials */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-surface-card p-8 rounded-lg border border-hairline">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-hairline text-[11px] font-mono uppercase tracking-wider text-primary mb-6">
                <span>Enterprise Decision Gate</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl leading-tight font-medium tracking-tight text-ink mb-4">
                See the signal.<br />Make the move.
              </h1>
              <p className="text-sm text-body leading-relaxed mb-6">
                KINTRAL unites predictive demand forecasting, network-wide optimization, counterfactual simulation, and multi-agent reasoning for retail executives and planners.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-hairline">
              <div className="text-xs font-mono uppercase tracking-wider text-muted">System Architecture</div>
              <div className="space-y-1.5 text-xs text-body">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Database Engine:</span>
                  <span className="font-mono text-body font-medium">Neon AWS PostgreSQL Pooler</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Agentic Architecture:</span>
                  <span className="font-mono text-body font-medium">6 Agents + Context Memory</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Analytical Graphics:</span>
                  <span className="font-mono text-body font-medium">Headless Matplotlib Engine</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Dataset Capability:</span>
                  <span className="font-mono text-body font-medium">Generic Tabular + Live Enterprise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Persona Switcher & Authentication */}
          <div className="lg:col-span-7 bg-canvas p-8 rounded-lg border border-hairline flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">Sign In to KINTRAL</h2>
                <span className="text-xs font-mono text-muted">Role-Based Access</span>
              </div>
              <p className="text-xs text-muted mb-6">
                Select an enterprise persona for instant one-click login, or enter your corporate credentials.
              </p>

              {/* Persona Quick Selectors */}
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                  Select Demo Persona
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_PERSONAS.map((persona) => {
                    const isSelected = selectedPersona.user_id === persona.user_id;
                    return (
                      <button
                        key={persona.user_id}
                        type="button"
                        onClick={() => handleSelectPersona(persona)}
                        className={`w-full text-left p-3 rounded-md border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-surface-soft border-primary ring-1 ring-primary"
                            : "bg-surface-card border-hairline hover:border-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
                              isSelected
                                ? "bg-primary text-on-primary"
                                : "bg-surface-cream-strong text-ink"
                            }`}
                          >
                            {persona.avatar_initials}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-ink flex items-center gap-2">
                              <span>{persona.full_name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-canvas border border-hairline font-mono text-primary">
                                {persona.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted">{persona.title}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-muted hidden sm:block">
                          {isSelected ? "● Active" : "Select"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form with credentials */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-hairline rounded-md text-xs font-mono text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted">
                      Security Password
                    </label>
                    <span className="text-[11px] text-primary hover:underline cursor-pointer">
                      Demo Passcode: auto-filled
                    </span>
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-hairline rounded-md text-xs font-mono text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary hover:bg-primary-active text-on-primary rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Persona...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {selectedPersona.full_name}</span>
                      <span className="text-xs opacity-75">({selectedPersona.role_display})</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-muted font-mono gap-3">
        <div>
          <span>KINTRAL Retail Intelligence Engine • Production v2.4</span>
        </div>
        <div className="flex items-center gap-4">
          <span>PostgreSQL 16 Neon</span>
          <span>•</span>
          <span>Groq 120B / Qwen Fallback</span>
          <span>•</span>
          <span>Editorial Warm Palette</span>
        </div>
      </footer>
    </div>
  );
};
