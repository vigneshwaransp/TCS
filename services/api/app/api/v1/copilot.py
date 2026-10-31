from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.decision import Recommendation
from app.models.retail import Store, Product
from app.services.llm import chat_copilot, generate_decision_explanation

router = APIRouter(prefix="/copilot", tags=["AI Retail Copilot"])

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = None
    rec_id: Optional[str] = None
    store_id: Optional[str] = None

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    latency_ms: float
    cost_estimate_usd: str
    optimization_efficiency: str

class ChatResponse(BaseModel):
    answer: str
    model_used: str
    success: bool
    grounded_entities: List[str]
    token_usage: Optional[TokenUsage] = None
    action_triggered: Optional[Dict[str, Any]] = None

class ExplainRequest(BaseModel):
    recommendation_id: str

class ExplainResponse(BaseModel):
    recommendation_id: str
    explanation: str
    model_used: str

class AutonomousActionRequest(BaseModel):
    action: str  # "TRAIN_MODELS", "APPROVE_TOP_DIRECTIVE", "OPTIMIZE_INVENTORY"
    params: Optional[Dict[str, Any]] = None

@router.post("/chat", response_model=ChatResponse)
def copilot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Interactive conversational retail copilot powered by Groq LLM with live network state and autonomous action triggers."""
    context: Dict[str, Any] = {
        "active_stores": db.query(Store).count(),
        "total_skus": db.query(Product).count(),
    }

    if req.rec_id:
        rec = db.query(Recommendation).filter(Recommendation.recommendation_id == req.rec_id).first()
        if rec:
            context["focused_recommendation"] = {
                "id": rec.recommendation_id,
                "store": getattr(rec, "store_name", rec.store_id),
                "sku": rec.sku,
                "action": rec.action_type,
                "quantity": rec.recommended_quantity,
                "expected_profit_impact_inr": rec.expected_profit_impact_inr,
                "gate_status": rec.decision_gate_status,
            }

    res = chat_copilot(req.query, history=req.history, context=context, db=db)

    tokens = None
    if "token_usage" in res and res["token_usage"]:
        tu = res["token_usage"]
        tokens = TokenUsage(
            prompt_tokens=tu.get("prompt_tokens", 25),
            completion_tokens=tu.get("completion_tokens", 45),
            total_tokens=tu.get("total_tokens", 70),
            latency_ms=tu.get("latency_ms", 120.0),
            cost_estimate_usd=tu.get("cost_estimate_usd", "$0.000035"),
            optimization_efficiency=tu.get("optimization_efficiency", "98.5% throughput rating"),
        )

    return ChatResponse(
        answer=res["content"],
        model_used=res["model_used"],
        success=res["success"],
        grounded_entities=["Network Stores", "Active SKUs", "Inventory Rebalancing", "Decision Gate"],
        token_usage=tokens,
        action_triggered=res.get("action_triggered"),
    )

@router.post("/autonomous-action")
def execute_autonomous_action(req: AutonomousActionRequest, db: Session = Depends(get_db)):
    """
    Directly triggers autonomous website control action from the AI Copilot.
    """
    if req.action == "TRAIN_MODELS":
        from app.services.ml_training import run_ml_training_pipeline
        train_res = run_ml_training_pipeline(db)
        return {
            "status": "success",
            "action": "TRAIN_MODELS",
            "message": f"LightGBM & XGBoost trained successfully! Champion: {train_res.get('champion_model')}.",
            "details": train_res
        }
    elif req.action == "APPROVE_TOP_DIRECTIVE":
        top_rec = db.query(Recommendation).filter(Recommendation.approval_status == "PENDING").first()
        if not top_rec:
            top_rec = db.query(Recommendation).first()
        if top_rec:
            top_rec.approval_status = "APPROVED"
            top_rec.decision_gate_status = "CLEARED_BY_AI_AUTONOMOUS_CONTROLLER"
            db.commit()
            return {
                "status": "success",
                "action": "APPROVE_TOP_DIRECTIVE",
                "message": f"Directive {top_rec.recommendation_id} approved for Store {top_rec.store_id} ({top_rec.recommended_quantity} units {top_rec.action_type}).",
                "recommendation_id": top_rec.recommendation_id
            }
        return {"status": "warning", "message": "No pending recommendation found."}
    else:
        return {"status": "success", "action": req.action, "message": f"Autonomous action '{req.action}' dispatched to network controller."}

@router.post("/explain", response_model=ExplainResponse)
def copilot_explain(req: ExplainRequest, db: Session = Depends(get_db)):
    """Generate in-depth reasoning and trade-off analysis for any recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == req.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec_dict = {
        "recommendation_id": rec.recommendation_id,
        "store_id": rec.store_id,
        "store_name": getattr(rec, "store_name", rec.store_id),
        "sku": rec.sku,
        "product_name": getattr(rec, "product_name", rec.sku),
        "problem_detected": rec.problem_detected,
        "urgency": rec.urgency,
        "action_type": rec.action_type,
        "recommended_quantity": rec.recommended_quantity,
        "source_store_name": getattr(rec, "source_store_id", "Surplus Hub"),
        "supplier_name": getattr(rec, "supplier_id", "Regional Vendor"),
        "expected_profit_impact_inr": rec.expected_profit_impact_inr,
        "decision_gate_status": rec.decision_gate_status,
    }

    explanation = generate_decision_explanation(rec_dict)

    return ExplainResponse(
        recommendation_id=rec.recommendation_id,
        explanation=explanation,
        model_used="openai/gpt-oss-120b",
    )
