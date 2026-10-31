from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.decision import Recommendation
from app.schemas.ripple import RippleIntelligenceResponse
from app.services.ripple import build_ripple_intelligence_graph

router = APIRouter(prefix="/ripple", tags=["Innovation 3: Ripple Intelligence"])

@router.get("/{rec_id}", response_model=RippleIntelligenceResponse)
def get_ripple_impact(
    rec_id: str,
    transfer_units: int = Query(50),
    source_store_id: str = Query(None),
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    src_id = source_store_id or rec.source_store_id or "STORE_002"

    graph_data = build_ripple_intelligence_graph(
        db=db,
        dest_store_id=rec.store_id,
        source_store_id=src_id,
        sku=rec.sku,
        transfer_units=transfer_units,
    )

    return graph_data
