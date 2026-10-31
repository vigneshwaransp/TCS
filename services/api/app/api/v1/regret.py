from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.regret import get_regret_evaluation_records, get_decision_quality_trends

router = APIRouter(prefix="/decision-quality", tags=["Innovation 5: Decision Regret Engine"])

@router.get("/outcomes")
def list_decision_outcomes(db: Session = Depends(get_db)):
    return get_regret_evaluation_records(db)

@router.get("/trends")
def get_quality_trends(db: Session = Depends(get_db)):
    return get_decision_quality_trends(db)
