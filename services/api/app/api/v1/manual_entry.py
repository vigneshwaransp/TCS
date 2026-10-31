import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.identity import ManualUserEntry
from app.models.retail import Product, Store
from app.models.operational import InventorySnapshot

router = APIRouter(prefix="/manual-entry", tags=["Manual Data Entry & User Registry"])

class UserEntryCreate(BaseModel):
    full_name: str
    email: str
    role: str
    department: Optional[str] = "Store Operations"
    phone: Optional[str] = None
    assigned_location: Optional[str] = "Main Distribution Hub"
    access_tier: Optional[str] = "OPERATOR"
    notes: Optional[str] = None

class RetailRecordCreate(BaseModel):
    record_type: str  # "product" or "inventory"
    store_id: str
    sku: str
    product_name: Optional[str] = None
    category: Optional[str] = "General Merchandising"
    on_hand_units: Optional[int] = 50
    safety_stock_units: Optional[int] = 20
    reorder_point_units: Optional[int] = 35
    selling_price_inr: Optional[float] = 150.0
    unit_cost_inr: Optional[float] = 110.0

@router.post("/users")
def create_user_entry(payload: UserEntryCreate, db: Session = Depends(get_db)):
    """
    Stores user details permanently into Neon PostgreSQL database.
    Allows manual data entry by operators and administrators.
    """
    try:
        entry_id = f"USR_{uuid.uuid4().hex[:8].upper()}"
        new_entry = ManualUserEntry(
            entry_id=entry_id,
            full_name=payload.full_name,
            email=payload.email,
            role=payload.role,
            department=payload.department,
            phone=payload.phone,
            assigned_location=payload.assigned_location,
            access_tier=payload.access_tier,
            notes=payload.notes,
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        return {
            "status": "success",
            "message": f"User details for '{new_entry.full_name}' permanently stored in Neon DB.",
            "entry": {
                "entry_id": new_entry.entry_id,
                "full_name": new_entry.full_name,
                "email": new_entry.email,
                "role": new_entry.role,
                "department": new_entry.department,
                "phone": new_entry.phone,
                "assigned_location": new_entry.assigned_location,
                "access_tier": new_entry.access_tier,
                "notes": new_entry.notes,
                "created_at": new_entry.created_at.isoformat() if new_entry.created_at else None,
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store user details: {str(e)}")

@router.get("/users")
def list_user_entries(db: Session = Depends(get_db)):
    """
    Retrieves all permanently stored manual user entries from Neon PostgreSQL.
    """
    try:
        entries = db.query(ManualUserEntry).order_by(ManualUserEntry.created_at.desc()).all()
        return {
            "status": "success",
            "total_count": len(entries),
            "entries": [
                {
                    "entry_id": e.entry_id,
                    "full_name": e.full_name,
                    "email": e.email,
                    "role": e.role,
                    "department": e.department,
                    "phone": e.phone,
                    "assigned_location": e.assigned_location,
                    "access_tier": e.access_tier,
                    "notes": e.notes,
                    "created_at": e.created_at.isoformat() if e.created_at else None,
                }
                for e in entries
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query stored users: {str(e)}")

@router.delete("/users/{entry_id}")
def delete_user_entry(entry_id: str, db: Session = Depends(get_db)):
    """
    Deletes a specific user entry from the database.
    """
    try:
        entry = db.query(ManualUserEntry).filter(ManualUserEntry.entry_id == entry_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="User entry not found")
        db.delete(entry)
        db.commit()
        return {"status": "success", "message": f"User entry {entry_id} permanently removed."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete entry: {str(e)}")

@router.post("/retail-record")
def create_retail_record(payload: RetailRecordCreate, db: Session = Depends(get_db)):
    """
    Permanently stores a new manual product or inventory snapshot record into Neon DB.
    """
    try:
        if payload.record_type == "product":
            existing = db.query(Product).filter(Product.sku == payload.sku).first()
            if not existing:
                prod = Product(
                    sku=payload.sku,
                    name=payload.product_name or f"Product {payload.sku}",
                    category=payload.category,
                    unit_cost_inr=payload.unit_cost_inr,
                    selling_price_inr=payload.selling_price_inr,
                )
                db.add(prod)
                db.commit()
                return {"status": "success", "message": f"Product SKU {payload.sku} created permanently."}
            else:
                existing.selling_price_inr = payload.selling_price_inr
                existing.unit_cost_inr = payload.unit_cost_inr
                db.commit()
                return {"status": "success", "message": f"Product SKU {payload.sku} updated permanently."}
        else:
            snapshot = InventorySnapshot(
                snapshot_date="2026-10-31",
                store_id=payload.store_id,
                sku=payload.sku,
                on_hand_units=payload.on_hand_units,
                safety_stock_units=payload.safety_stock_units,
                reorder_point_units=payload.reorder_point_units,
                target_stock_units=payload.safety_stock_units + 50,
            )
            db.add(snapshot)
            db.commit()
            return {"status": "success", "message": f"Inventory position stored for Store {payload.store_id} / SKU {payload.sku}."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store retail record: {str(e)}")
