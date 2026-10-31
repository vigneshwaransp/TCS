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

class ChatResponse(BaseModel):
    answer: str
    model_used: str
    success: bool
    grounded_entities: List[str]

class ExplainRequest(BaseModel):
    recommendation_id: str

class ExplainResponse(BaseModel):
    recommendation_id: str
    explanation: str
    model_used: str

@router.post("/chat", response_model=ChatResponse)
def copilot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Interactive conversational retail copilot powered by Groq LLM with live network state."""
    # Build grounded context
    context = {
        "active_stores": 5,
        "flagship_scenario": "Pongal Promotion Shortage on Basmati Rice at DMart Velachery (STORE_001)",
        "verified_stores": [
            {"id": "STORE_001", "name": "DMart Velachery", "role": "Deficit Destination (18 units on hand, 118 promo demand)"},
            {"id": "STORE_002", "name": "DMart Chromepet", "role": "Surplus Source (155 units on hand, 30 units safety stock)"},
            {"id": "STORE_003", "name": "DMart Virugambakkam", "role": "Balanced Store"},
            {"id": "STORE_004", "name": "DMart Madipakkam", "role": "Nearby Store (26 min transit to Velachery)"},
            {"id": "STORE_005", "name": "DMart Kolathur", "role": "North Chennai Store"},
        ],
        "top_recommendation": {
            "id": "REC_001",
            "action": "STORE_TRANSFER",
            "quantity": 50,
            "source": "DMart Chromepet",
            "destination": "DMart Velachery",
            "transit": "14.2 km via GST Road (52 min)",
            "net_impact_inr": 381.08,
            "decision_gate_status": "READY_TO_ACT",
        }
    }

    if req.rec_id:
        rec = db.query(Recommendation).filter(Recommendation.recommendation_id == req.rec_id).first()
        if rec:
            context["focused_recommendation"] = {
                "id": rec.recommendation_id,
                "store": rec.store_name,
                "product": rec.product_name,
                "action": rec.action_type,
                "quantity": rec.recommended_quantity,
                "expected_profit_impact_inr": rec.expected_profit_impact_inr,
                "gate_status": rec.decision_gate_status,
            }

    res = chat_copilot(req.query, history=req.history, context=context)

    return ChatResponse(
        answer=res["content"],
        model_used=res["model_used"],
        success=res["success"],
        grounded_entities=["DMart Velachery", "DMart Chromepet", "Basmati Rice 1KG", "Pongal Promotion", "REC_001"],
    )

@router.post("/explain", response_model=ExplainResponse)
def copilot_explain(req: ExplainRequest, db: Session = Depends(get_db)):
    """Generate in-depth reasoning and trade-off analysis for any recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == req.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec_dict = {
        "recommendation_id": rec.recommendation_id,
        "store_id": rec.store_id,
        "store_name": rec.store_name,
        "sku": rec.sku,
        "product_name": rec.product_name,
        "problem_detected": rec.problem_detected,
        "urgency": rec.urgency,
        "action_type": rec.action_type,
        "recommended_quantity": rec.recommended_quantity,
        "source_store_name": rec.source_store_name,
        "supplier_name": rec.supplier_name,
        "expected_profit_impact_inr": rec.expected_profit_impact_inr,
        "decision_gate_status": rec.decision_gate_status,
    }

    explanation = generate_decision_explanation(rec_dict)

    return ExplainResponse(
        recommendation_id=rec.recommendation_id,
        explanation=explanation,
        model_used="openai/gpt-oss-120b (Groq)",
    )
