const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const role = typeof window !== "undefined" ? localStorage.getItem("kintral_role") || "admin" : "admin";
  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": role,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `API request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  getMe: () => fetchFromAPI("/auth/me"),

  // Dashboard
  getDashboardSummary: () => fetchFromAPI("/dashboard/summary"),
  getPriorityDecisions: () => fetchFromAPI("/dashboard/priority-decisions"),

  // Stores & Products
  getStores: () => fetchFromAPI("/stores"),
  getStoresPerformance: () => fetchFromAPI("/stores/performance"),
  getProducts: (category?: string) => fetchFromAPI(`/products${category ? `?category=${category}` : ""}`),

  // Inventory
  getInventoryPositions: (storeId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (storeId) params.append("store_id", storeId);
    if (status) params.append("status", status);
    return fetchFromAPI(`/inventory/positions?${params.toString()}`);
  },
  getInventoryRisks: () => fetchFromAPI("/inventory/risks"),

  // Forecasts
  getForecast: (storeId: string, sku: string, horizonDays = 7, multiplier = 1.0, promo = 0.0) =>
    fetchFromAPI(`/forecasts?store_id=${storeId}&sku=${sku}&horizon_days=${horizonDays}&demand_multiplier=${multiplier}&promo_discount_pct=${promo}`),

  // Decisions
  getRecommendations: (storeId?: string, urgency?: string, gateStatus?: string) => {
    const params = new URLSearchParams();
    if (storeId) params.append("store_id", storeId);
    if (urgency) params.append("urgency", urgency);
    if (gateStatus) params.append("gate_status", gateStatus);
    return fetchFromAPI(`/decisions/recommendations?${params.toString()}`);
  },
  getRecommendationDetails: (recId: string) => fetchFromAPI(`/decisions/recommendations/${recId}`),
  approveRecommendation: (
    recId: string,
    data: { selected_action: string; approved_quantity: number; review_notes?: string; decision?: string }
  ) =>
    fetchFromAPI(`/decisions/recommendations/${recId}/approve`, {
      method: "POST",
      body: JSON.stringify({ decision: "APPROVED", ...data }),
    }),
  rejectRecommendation: (
    recId: string,
    data: { review_notes?: string; decision?: string; selected_action?: string; approved_quantity?: number }
  ) =>
    fetchFromAPI(`/decisions/recommendations/${recId}/reject`, {
      method: "POST",
      body: JSON.stringify({ decision: "REJECTED", selected_action: "NO_ACTION", approved_quantity: 0, ...data }),
    }),

  // Innovation 1: Retail Decision Twin
  runSimulation: (params: {
    store_id: string;
    sku: string;
    demand_multiplier: number;
    inventory_override?: number;
    transfer_quantity: number;
    source_store_id?: string;
    promo_discount_pct?: number;
    procurement_budget_inr?: number;
    planning_horizon_days?: number;
  }) =>
    fetchFromAPI("/simulations/run", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Innovation 2: Decision Replay Studio
  getDecisionReplay: (recId: string, demandMultiplier = 1.0, budget = 60000.0, transferCost?: number) => {
    const params = new URLSearchParams();
    params.append("demand_multiplier", demandMultiplier.toString());
    params.append("procurement_budget_inr", budget.toString());
    if (transferCost !== undefined) params.append("transfer_cost_override", transferCost.toString());
    return fetchFromAPI(`/replay/${recId}?${params.toString()}`);
  },

  // Innovation 3: Ripple Intelligence
  getRippleGraph: (recId: string, transferUnits = 50, sourceStoreId?: string) => {
    const params = new URLSearchParams();
    params.append("transfer_units", transferUnits.toString());
    if (sourceStoreId) params.append("source_store_id", sourceStoreId);
    return fetchFromAPI(`/ripple/${recId}?${params.toString()}`);
  },

  // Innovation 4: Confidence-Aware Decision Gate
  getDecisionGate: (recId: string, simulateMissingData = false, simulateSafetyViolation = false) => {
    const params = new URLSearchParams();
    if (simulateMissingData) params.append("simulate_missing_data", "true");
    if (simulateSafetyViolation) params.append("simulate_safety_violation", "true");
    return fetchFromAPI(`/decision-gate/${recId}?${params.toString()}`);
  },

  // Innovation 5: Decision Regret Engine
  getDecisionOutcomes: () => fetchFromAPI("/decision-quality/outcomes"),
  getQualityTrends: () => fetchFromAPI("/decision-quality/trends"),

  // Adaptive Retail Policy Lab
  getPolicyComparison: () => fetchFromAPI("/policies/compare"),

  // Audit Logs & Governance
  getAuditLogs: () => fetchFromAPI("/audit-logs"),
  getHealth: () => fetchFromAPI("/health"),

  // AI Decision Copilot (Groq LLM)
  copilotChat: (query: string, history?: Array<{ role: string; content: string }>, recId?: string) =>
    fetchFromAPI("/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ query, history, rec_id: recId }),
    }),
  copilotExplain: (recId: string) =>
    fetchFromAPI("/copilot/explain", {
      method: "POST",
      body: JSON.stringify({ recommendation_id: recId }),
    }),

  // Matplotlib Analytical Visualizations (Editorial Warm Palette, No Black)
  getVisualizationSuite: (skuFilter?: string) =>
    fetchFromAPI(`/visualizations/suite${skuFilter ? `?sku_filter=${skuFilter}` : ""}`),
  getDatasetColumns: () =>
    fetchFromAPI("/visualizations/dataset-columns"),
  getColumnHistogram: (columnName: string, values: number[], bins = 25) =>
    fetchFromAPI("/visualizations/column-histogram", {
      method: "POST",
      body: JSON.stringify({ column_name: columnName, values, bins }),
    }),

  // Agentic Framework with Context Memory
  runAgentPipeline: (datasetName?: string, customData?: any[], sessionId?: string) =>
    fetchFromAPI("/agents/run", {
      method: "POST",
      body: JSON.stringify({ dataset_name: datasetName, custom_data: customData, session_id: sessionId }),
    }),
  getContextMemories: (memoryType?: string, entityScope?: string, limit = 20) =>
    fetchFromAPI(`/agents/memory?limit=${limit}${memoryType ? `&memory_type=${memoryType}` : ""}${entityScope ? `&entity_scope=${entityScope}` : ""}`),
  recordAgentFeedback: (payload: { session_id: string; memory_type?: string; agent_name?: string; key: string; summary: string; content: any; entity_scope?: string; importance_score?: number }) =>
    fetchFromAPI("/agents/memory/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  profileGenericDataset: (datasetName: string, data: any[]) =>
    fetchFromAPI("/agents/profile", {
      method: "POST",
      body: JSON.stringify({ dataset_name: datasetName, data }),
    }),

  // Machine Learning: LightGBM & XGBoost Training & Predictions
  trainMlModels: () =>
    fetchFromAPI("/forecasts/train-models", { method: "POST" }),
  getMlModelStatus: () =>
    fetchFromAPI("/forecasts/model-status"),
  predictMlDemand: (payload: { store_id?: string; sku?: string; base_velocity?: number; unit_price?: number; promotion_active?: boolean; days_ahead?: number }) =>
    fetchFromAPI("/forecasts/predict-ml", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Manual User Entry & Permanent Storage in Neon PostgreSQL
  storeManualUser: (payload: { full_name: string; email: string; role: string; department?: string; phone?: string; assigned_location?: string; access_tier?: string; notes?: string }) =>
    fetchFromAPI("/manual-entry/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getManualUsers: () =>
    fetchFromAPI("/manual-entry/users"),
  deleteManualUser: (entryId: string) =>
    fetchFromAPI(`/manual-entry/users/${entryId}`, { method: "DELETE" }),
  storeRetailRecord: (payload: any) =>
    fetchFromAPI("/manual-entry/retail-record", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI Autonomous Action Execution (Full Website Control)
  executeAutonomousAction: (action: string, params?: any) =>
    fetchFromAPI("/copilot/autonomous-action", {
      method: "POST",
      body: JSON.stringify({ action, params }),
    }),
};
