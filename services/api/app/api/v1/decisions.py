import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user, UserContext, require_permission, Permission
from app.models.decision import (
    Recommendation, RecommendationAlternative, DecisionApproval, DecisionRun
)
from app.models.retail import Store, Product, Supplier
from app.models.identity import AuditLog
from app.schemas.decision import ApprovalRequest
from app.services.inventory import detect_stockout_risks
from app.services.optimization import evaluate_decision_alternatives
from app.services.decision_gate import evaluate_decision_gate

router = APIRouter(prefix="/decisions", tags=["Decision Intelligence Engine"])

@router.get("/recommendations")
def list_recommendations(
    store_id: str = Query(None),
    urgency: str = Query(None),
    gate_status: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Recommendation, Store, Product).join(
        Store, Recommendation.store_id == Store.store_id
    ).join(
        Product, Recommendation.sku == Product.sku
    )

    if store_id:
        query = query.filter(Recommendation.store_id == store_id)
    if urgency:
        query = query.filter(Recommendation.urgency == urgency)
    if gate_status:
        query = query.filter(Recommendation.decision_gate_status == gate_status)

    records = query.all()
    results = []

    for rec, store, prod in records:
        src_store = db.query(Store).filter(Store.store_id == rec.source_store_id).first() if rec.source_store_id else None
        supp = db.query(Supplier).filter(Supplier.supplier_id == rec.supplier_id).first() if rec.supplier_id else None

        results.append({
            "recommendation_id": rec.recommendation_id,
            "run_id": rec.run_id,
            "store_id": rec.store_id,
            "store_name": store.store_name,
            "sku": rec.sku,
            "product_name": prod.product_name,
            "category": prod.category,
            "selling_price_inr": prod.selling_price_inr,
            "unit_cost_inr": prod.unit_cost_inr,
            "problem_detected": rec.problem_detected,
            "urgency": rec.urgency,
            "action_type": rec.action_type,
            "recommended_quantity": rec.recommended_quantity,
            "source_store_id": rec.source_store_id,
            "source_store_name": src_store.store_name if src_store else None,
            "supplier_id": rec.supplier_id,
            "supplier_name": supp.supplier_name if supp else None,
            "expected_profit_impact_inr": rec.expected_profit_impact_inr,
            "incremental_cost_inr": rec.incremental_cost_inr,
            "projected_stockout_units": rec.projected_stockout_units,
            "service_level_target": rec.service_level_target,
            "feasibility_status": rec.feasibility_status,
            "decision_gate_status": rec.decision_gate_status,
            "approval_status": rec.approval_status,
            "assumptions": rec.assumptions,
            "evidence_checklist": rec.evidence_checklist,
            "binding_constraints": rec.binding_constraints,
            "explanation": rec.explanation,
        })

    return results

@router.get("/recommendations/{rec_id}")
def get_recommendation_details(rec_id: str, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    store = db.query(Store).filter(Store.store_id == rec.store_id).first()
    prod = db.query(Product).filter(Product.sku == rec.sku).first()
    src_store = db.query(Store).filter(Store.store_id == rec.source_store_id).first() if rec.source_store_id else None
    supp = db.query(Supplier).filter(Supplier.supplier_id == rec.supplier_id).first() if rec.supplier_id else None

    alts = (
        db.query(RecommendationAlternative)
        .filter(RecommendationAlternative.recommendation_id == rec_id)
        .all()
    )

    approvals = (
        db.query(DecisionApproval)
        .filter(DecisionApproval.recommendation_id == rec_id)
        .order_by(DecisionApproval.timestamp.desc())
        .all()
    )

    return {
        "recommendation_id": rec.recommendation_id,
        "run_id": rec.run_id,
        "store_id": rec.store_id,
        "store_name": store.store_name if store else rec.store_id,
        "sku": rec.sku,
        "product_name": prod.product_name if prod else rec.sku,
        "category": prod.category if prod else "Retail",
        "selling_price_inr": prod.selling_price_inr if prod else 100.0,
        "unit_cost_inr": prod.unit_cost_inr if prod else 80.0,
        "problem_detected": rec.problem_detected,
        "urgency": rec.urgency,
        "action_type": rec.action_type,
        "recommended_quantity": rec.recommended_quantity,
        "source_store_id": rec.source_store_id,
        "source_store_name": src_store.store_name if src_store else None,
        "supplier_id": rec.supplier_id,
        "supplier_name": supp.supplier_name if supp else None,
        "expected_profit_impact_inr": rec.expected_profit_impact_inr,
        "incremental_cost_inr": rec.incremental_cost_inr,
        "projected_stockout_units": rec.projected_stockout_units,
        "service_level_target": rec.service_level_target,
        "feasibility_status": rec.feasibility_status,
        "decision_gate_status": rec.decision_gate_status,
        "approval_status": rec.approval_status,
        "assumptions": rec.assumptions,
        "evidence_checklist": rec.evidence_checklist,
        "binding_constraints": rec.binding_constraints,
        "explanation": rec.explanation,
        "alternatives": [
            {
                "action_type": a.action_type,
                "action_title": a.action_title,
                "proposed_quantity": a.proposed_quantity,
                "source_entity": a.source_entity,
                "expected_contribution_profit_inr": a.expected_contribution_profit_inr,
                "incremental_cost_inr": a.incremental_cost_inr,
                "projected_stockout_exposure": a.projected_stockout_exposure,
                "ending_inventory": a.ending_inventory,
                "service_level_pct": a.service_level_pct,
                "feasibility_status": a.feasibility_status,
                "infeasibility_reason": a.infeasibility_reason,
                "is_preferred": a.is_preferred,
                "assumptions_summary": a.assumptions_summary,
            }
            for a in alts
        ],
        "approval_history": [
            {
                "approval_id": app.approval_id,
                "decision": app.decision,
                "selected_action": app.selected_action,
                "approved_quantity": app.approved_quantity,
                "user_id": app.user_id,
                "user_role": app.user_role,
                "review_notes": app.review_notes,
                "timestamp": app.timestamp.isoformat() if app.timestamp else None,
            }
            for app in approvals
        ]
    }

@router.post("/recommendations/{rec_id}/approve")
def approve_recommendation(
    rec_id: str,
    req: ApprovalRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC permission check
    perms = require_permission(Permission.APPROVE_DECISION)
    perms(current_user)

    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.approval_status = "APPROVED"
    rec.action_type = req.selected_action
    rec.recommended_quantity = req.approved_quantity

    app_id = f"APP_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    approval = DecisionApproval(
        approval_id=app_id,
        recommendation_id=rec_id,
        user_id=current_user.user_id,
        user_role=current_user.role.value,
        decision="APPROVED",
        selected_action=req.selected_action,
        approved_quantity=req.approved_quantity,
        review_notes=req.review_notes,
    )
    db.add(approval)

    # Immutable Audit Log
    db.add(AuditLog(
        log_id=f"AUD_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        organization_id=current_user.organization_id,
        user_id=current_user.user_id,
        user_role=current_user.role.value,
        action="DECISION_APPROVED",
        resource_type="RECOMMENDATION",
        resource_id=rec_id,
        details={
            "selected_action": req.selected_action,
            "approved_quantity": req.approved_quantity,
            "review_notes": req.review_notes,
        },
        status="SUCCESS",
    ))

    db.commit()

    return {
        "approval_id": app_id,
        "recommendation_id": rec_id,
        "status": "APPROVED",
        "selected_action": req.selected_action,
        "approved_quantity": req.approved_quantity,
        "approved_by": current_user.full_name,
        "role": current_user.role.value,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "message": f"Recommendation successfully approved and recorded under {current_user.role.value} governance.",
    }

@router.post("/recommendations/{rec_id}/reject")
def reject_recommendation(
    rec_id: str,
    req: ApprovalRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC permission check
    perms = require_permission(Permission.APPROVE_DECISION)
    perms(current_user)

    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.approval_status = "REJECTED"

    app_id = f"REJ_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    rejection = DecisionApproval(
        approval_id=app_id,
        recommendation_id=rec_id,
        user_id=current_user.user_id,
        user_role=current_user.role.value,
        decision="REJECTED",
        selected_action="NO_ACTION",
        approved_quantity=0,
        review_notes=req.review_notes,
    )
    db.add(rejection)

    # Immutable Audit Log
    db.add(AuditLog(
        log_id=f"AUD_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        organization_id=current_user.organization_id,
        user_id=current_user.user_id,
        user_role=current_user.role.value,
        action="DECISION_REJECTED",
        resource_type="RECOMMENDATION",
        resource_id=rec_id,
        details={
            "review_notes": req.review_notes,
        },
        status="SUCCESS",
    ))

    db.commit()

    return {
        "approval_id": app_id,
        "recommendation_id": rec_id,
        "status": "REJECTED",
        "reviewed_by": current_user.full_name,
        "role": current_user.role.value,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "message": "Recommendation rejected by manager and logged to governance audit trail.",
    }
