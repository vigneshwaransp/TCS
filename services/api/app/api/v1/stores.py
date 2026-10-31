from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.retail import Store

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("")
def list_stores(db: Session = Depends(get_db)):
    stores = db.query(Store).all()
    return [
        {
            "store_id": s.store_id,
            "store_name": s.store_name,
            "store_code": s.store_code,
            "locality": s.locality,
            "city": s.city,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "store_type": s.store_type,
            "storage_capacity_units": s.storage_capacity_units,
            "verification_status": s.verification_status,
            "address": s.address,
            "is_active": s.is_active,
        }
        for s in stores
    ]
