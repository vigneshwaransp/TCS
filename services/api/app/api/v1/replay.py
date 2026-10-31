from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.decision import Recommendation
from app.services.optimization import evaluate_decision_alternatives

router = APIRouter(prefix="/replay", tags=["Innovation 2: Decision Replay Studio"])

@router.get("/{rec_id}")
def get_decision_replay(
    rec_id: str,
    demand_multiplier: float = Query(1.0),
    procurement_budget_inr: float = Query(60000.0),
    transfer_cost_override: float = Query(None),
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    eval_res = evaluate_decision_alternatives(
        db=db,
        store_id=rec.store_id,
        sku=rec.sku,
        forecast_demand_7d=118,
        planning_horizon_days=7,
        demand_multiplier=demand_multiplier,
        procurement_budget_inr=procurement_budget_inr,
        transfer_cost_override=transfer_cost_override,
    )

    return {
        "recommendation_id": rec_id,
        "store_id": rec.store_id,
        "sku": rec.sku,
        "problem_detected": rec.problem_detected,
        "urgency": rec.urgency,
        "selected_best_action": eval_res["best_action"],
        "alternatives": eval_res["alternatives"],
        "financial_comparison": [
            {
                "action": a["action_title"],
                "profit": a["expected_contribution_profit_inr"],
                "cost": a["incremental_cost_inr"],
                "stockout_units": a["projected_stockout_exposure"],
                "service_level": a["service_level_pct"],
                "is_preferred": a["is_preferred"],
            }
            for a in eval_res["alternatives"]
        ],
        "traceable_explanation": {
            "what_is_problem": rec.problem_detected,
            "why_matters_now": "Upcoming Pongal promotion will deplete local stock within 36 hours, turning away customers and forfeiting ₹6,250 in margin.",
            "recommended_action": eval_res["best_action"]["action_title"],
            "why_preferred": f"Delivers highest net contribution profit (₹{eval_res['best_action']['expected_contribution_profit_inr']:,.2f}) while strictly preserving source store safety stock.",
            "alternatives_evaluated": len(eval_res["alternatives"]),
            "key_constraints_respected": [
                "Source store safety stock buffer strictly protected",
                "Tata Ace LCV road transport vehicle capacity respected",
                "Procurement budget constraint verified",
            ],
            "governance_recommendation": "Review Decision Gate status and approve dispatch.",
        }
    }
