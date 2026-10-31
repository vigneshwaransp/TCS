from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SimulationScenarioRequest(BaseModel):
    store_id: str
    sku: str
    demand_multiplier: float = 1.0
    inventory_override: Optional[int] = None
    lead_time_override: Optional[int] = None
    transfer_quantity: int = 0
    source_store_id: Optional[str] = None
    promo_discount_pct: float = 0.0
    procurement_budget_inr: float = 50000.0
    planning_horizon_days: int = 7

class TimelinePoint(BaseModel):
    day: int
    date: str
    starting_inventory: int
    forecast_demand: int
    consumption: int
    arrivals: int
    stockouts: int
    ending_inventory: int
    cumulative_profit_inr: float
    description: str

class MetricComparison(BaseModel):
    metric_name: str
    current_state_val: str
    simulated_state_val: str
    delta_val: str
    impact_direction: str # POSITIVE, NEGATIVE, NEUTRAL

class SimulationResponse(BaseModel):
    scenario_id: str
    store_id: str
    store_name: str
    sku: str
    product_name: str
    planning_horizon_days: int
    inputs: Dict[str, Any]
    timeline: List[TimelinePoint]
    comparison_table: List[MetricComparison]
    summary_metrics: Dict[str, Any]
    recommended_action_under_scenario: str
