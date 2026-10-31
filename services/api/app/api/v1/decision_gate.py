from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.decision import Recommendation
from app.services.decision_gate import evaluate_decision_gate

router = APIRouter(prefix="/decision-gate", tags=["Innovation 4: Confidence-Aware Decision Gate"])

@router.get("/{rec_id}")
def get_decision_gate_status(
    rec_id: str,
    simulate_missing_data: bool = Query(False),
    simulate_safety_violation: bool = Query(False),
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    missing_flags = ["inventory"] if simulate_missing_data else []

    gate_eval = evaluate_decision_gate(
        evidence_data={},
        financial_impact_inr=rec.expected_profit_impact_inr,
        source_safety_violated=simulate_safety_violation,
        forecast_uncertainty="LOW",
        missing_data_flags=missing_flags,
    )

    return {
        "recommendation_id": rec_id,
        "current_gate_status": gate_eval["gate_status"],
        "status_rationale": gate_eval["status_rationale"],
        "can_proceed_to_approval": gate_eval["can_proceed_to_approval"],
        "evidence_checklist": gate_eval["checklist"],
        "uncertainty_summary": gate_eval["uncertainty_summary"],
        "readiness_criteria_definitions": {
            "READY_TO_ACT": "Meets configured thresholds for data freshness, action feasibility, economic justification, and forecast accuracy.",
            "HUMAN_REVIEW_REQUIRED": "Material financial impact or multi-store action that requires human supervisor sign-off before dispatch.",
            "INSUFFICIENT_EVIDENCE": "Missing essential inputs, unresolved constraints, or conflicting records. Action cannot proceed.",
        }
    }
