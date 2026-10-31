from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.simulation import SimulationScenarioRequest, SimulationResponse
from app.services.simulation import run_decision_twin_simulation

router = APIRouter(prefix="/simulations", tags=["Innovation 1: Retail Decision Twin"])

@router.post("/run", response_model=SimulationResponse)
def run_simulation(req: SimulationScenarioRequest, db: Session = Depends(get_db)):
    result = run_decision_twin_simulation(
        db=db,
        store_id=req.store_id,
        sku=req.sku,
        demand_multiplier=req.demand_multiplier,
        inventory_override=req.inventory_override,
        lead_time_override=req.lead_time_override,
        transfer_quantity=req.transfer_quantity,
        source_store_id=req.source_store_id,
        promo_discount_pct=req.promo_discount_pct,
        procurement_budget_inr=req.procurement_budget_inr,
        planning_horizon_days=req.planning_horizon_days,
    )
    return result
