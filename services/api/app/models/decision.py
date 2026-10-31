import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from app.db.session import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class DecisionRun(Base):
    __tablename__ = "decision_runs"

    run_id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), default="ORG_DMART_IN", nullable=False)
    initiated_by = Column(String(64), nullable=False)
    user_role = Column(String(32), nullable=False)
    objective = Column(String(128), default="MAXIMIZE_CONTRIBUTION_PROFIT")
    status = Column(String(32), default="COMPLETED")
    total_risks_detected = Column(Integer, default=0)
    recommendations_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)

class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(String(64), primary_key=True)
    run_id = Column(String(64), ForeignKey("decision_runs.run_id"), nullable=False)
    store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False)
    problem_detected = Column(String(255), nullable=False)
    urgency = Column(String(32), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    action_type = Column(String(64), nullable=False) # SUPPLIER_REPLENISHMENT, STORE_TRANSFER, PROMO_ADJUSTMENT, COMBINED, NO_ACTION
    recommended_quantity = Column(Integer, default=0)
    source_store_id = Column(String(64), nullable=True) # For transfer
    supplier_id = Column(String(64), nullable=True) # For replenishment
    expected_profit_impact_inr = Column(Float, default=0.0)
    incremental_cost_inr = Column(Float, default=0.0)
    projected_stockout_units = Column(Integer, default=0)
    service_level_target = Column(Float, default=0.95)
    feasibility_status = Column(String(32), default="FEASIBLE") # FEASIBLE, INFEASIBLE, CONDITIONAL
    decision_gate_status = Column(String(64), default="HUMAN_REVIEW_REQUIRED") # READY_TO_ACT, HUMAN_REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE
    approval_status = Column(String(32), default="PENDING") # PENDING, APPROVED, REJECTED, EXECUTED
    assumptions = Column(JSON, nullable=True)
    evidence_checklist = Column(JSON, nullable=True)
    binding_constraints = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class RecommendationAlternative(Base):
    __tablename__ = "recommendation_alternatives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recommendation_id = Column(String(64), ForeignKey("recommendations.recommendation_id"), nullable=False)
    action_type = Column(String(64), nullable=False)
    action_title = Column(String(128), nullable=False)
    proposed_quantity = Column(Integer, default=0)
    source_entity = Column(String(128), nullable=True)
    expected_contribution_profit_inr = Column(Float, default=0.0)
    incremental_cost_inr = Column(Float, default=0.0)
    projected_stockout_exposure = Column(Integer, default=0)
    ending_inventory = Column(Integer, default=0)
    service_level_pct = Column(Float, default=0.0)
    feasibility_status = Column(String(32), default="FEASIBLE")
    infeasibility_reason = Column(String(255), nullable=True)
    is_preferred = Column(Boolean, default=False)
    assumptions_summary = Column(Text, nullable=True)

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    scenario_id = Column(String(64), primary_key=True)
    recommendation_id = Column(String(64), nullable=True)
    scenario_name = Column(String(128), nullable=False)
    store_id = Column(String(64), nullable=False)
    sku = Column(String(64), nullable=False)
    demand_multiplier = Column(Float, default=1.0)
    inventory_override = Column(Integer, nullable=True)
    lead_time_override = Column(Integer, nullable=True)
    transfer_quantity = Column(Integer, default=0)
    source_store_id = Column(String(64), nullable=True)
    promo_discount_pct = Column(Float, default=0.0)
    procurement_budget_inr = Column(Float, default=50000.0)
    planning_horizon_days = Column(Integer, default=7)
    created_by = Column(String(64), default="system")
    created_at = Column(DateTime, default=get_utc_now)

class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_id = Column(String(64), ForeignKey("simulation_scenarios.scenario_id"), nullable=False)
    timeline_day = Column(Integer, nullable=False)
    date = Column(String(32), nullable=False)
    starting_inventory = Column(Integer, nullable=False)
    forecast_demand = Column(Integer, nullable=False)
    actual_consumption = Column(Integer, nullable=False)
    arrivals = Column(Integer, default=0)
    stockout_units = Column(Integer, default=0)
    ending_inventory = Column(Integer, nullable=False)
    cumulative_profit_inr = Column(Float, default=0.0)
    state_description = Column(String(255))

class DecisionApproval(Base):
    __tablename__ = "decision_approvals"

    approval_id = Column(String(64), primary_key=True)
    recommendation_id = Column(String(64), ForeignKey("recommendations.recommendation_id"), nullable=False)
    user_id = Column(String(64), nullable=False)
    user_role = Column(String(32), nullable=False)
    decision = Column(String(32), nullable=False) # APPROVED, REJECTED, MODIFIED
    selected_action = Column(String(64), nullable=False)
    approved_quantity = Column(Integer, default=0)
    review_notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

class DecisionOutcome(Base):
    __tablename__ = "decision_outcomes"

    outcome_id = Column(String(64), primary_key=True)
    recommendation_id = Column(String(64), ForeignKey("recommendations.recommendation_id"), nullable=False)
    evaluation_date = Column(String(32), nullable=False)
    expected_profit_inr = Column(Float, nullable=False)
    observed_profit_inr = Column(Float, nullable=True)
    expected_stockouts = Column(Integer, nullable=False)
    observed_stockouts = Column(Integer, nullable=True)
    best_alternative_profit_inr = Column(Float, nullable=False)
    estimated_regret_inr = Column(Float, default=0.0) # max(0, best_alt - chosen_action)
    forecast_error_units = Column(Integer, default=0)
    regret_analysis_summary = Column(Text, nullable=True)
    evaluation_status = Column(String(32), default="OBSERVED_FINAL") # ESTIMATED_PENDING, OBSERVED_FINAL

class PolicyExperiment(Base):
    __tablename__ = "policy_experiments"

    experiment_id = Column(String(64), primary_key=True)
    policy_name = Column(String(64), nullable=False) # FIXED_ROP, FORECAST_BASED, NETWORK_AWARE, CONSTRAINED_OPTIMIZATION
    policy_description = Column(String(255))
    evaluation_period = Column(String(64), default="HISTORICAL_30D")
    fill_rate_pct = Column(Float, default=0.0)
    stockout_incidents = Column(Integer, default=0)
    average_inventory_units = Column(Float, default=0.0)
    total_logistics_cost_inr = Column(Float, default=0.0)
    total_contribution_profit_inr = Column(Float, default=0.0)
    feasibility_failure_rate_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=get_utc_now)
