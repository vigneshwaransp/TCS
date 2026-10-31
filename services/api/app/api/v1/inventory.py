from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.inventory import compute_inventory_positions, detect_stockout_risks

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])

@router.get("/positions")
def get_inventory_positions(
    store_id: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    positions = compute_inventory_positions(db, store_id=store_id)
    if status:
        positions = [p for p in positions if p["inventory_status"] == status]
    return positions

@router.get("/risks")
def get_inventory_risks(db: Session = Depends(get_db)):
    return detect_stockout_risks(db)
