from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AlternativeResponse(BaseModel):
    action_type: str
    action_title: str
    proposed_quantity: int
    source_entity: Optional[str] = None
    expected_contribution_profit_inr: float
    incremental_cost_inr: float
    projected_stockout_exposure: int
    ending_inventory: int
    service_level_pct: float
    feasibility_status: str
    infeasibility_reason: Optional[str] = None
    is_preferred: bool
    assumptions_summary: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendation_id: str
    run_id: str
    store_id: str
    store_name: str
    sku: str
    product_name: str
    category: str
    selling_price_inr: float
    unit_cost_inr: float
    problem_detected: str
    urgency: str
    action_type: str
    recommended_quantity: int
    source_store_id: Optional[str] = None
    source_store_name: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    expected_profit_impact_inr: float
    incremental_cost_inr: float
    projected_stockout_units: int
    service_level_target: float
    feasibility_status: str
    decision_gate_status: str # READY_TO_ACT, HUMAN_REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE
    approval_status: str # PENDING, APPROVED, REJECTED, EXECUTED
    assumptions: Optional[Dict[str, Any]] = None
    evidence_checklist: Optional[Dict[str, Any]] = None
    binding_constraints: Optional[List[str]] = None
    explanation: Optional[str] = None
    alternatives: List[AlternativeResponse] = []

class ApprovalRequest(BaseModel):
    decision: str # APPROVED, REJECTED
    selected_action: str
    approved_quantity: int
    review_notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    approval_id: str
    recommendation_id: str
    decision: str
    selected_action: str
    approved_quantity: int
    user_name: str
    user_role: str
    message: str
    timestamp: str

class RegretRecordResponse(BaseModel):
    outcome_id: str
    recommendation_id: str
    store_name: str
    sku: str
    product_name: str
    recommended_action: str
    selected_action: str
    expected_profit_inr: float
    observed_profit_inr: Optional[float]
    best_alternative_profit_inr: float
    estimated_regret_inr: float
    forecast_error_units: int
    evaluation_status: str
    regret_analysis_summary: str
