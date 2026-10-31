from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.retail import Product

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def list_products(
    category: str = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    products = query.limit(limit).all()

    return [
        {
            "sku": p.sku,
            "product_name": p.product_name,
            "brand": p.brand,
            "category": p.category,
            "subcategory": p.subcategory,
            "unit_of_measure": p.unit_of_measure,
            "pack_size": p.pack_size,
            "selling_price_inr": p.selling_price_inr,
            "unit_cost_inr": p.unit_cost_inr,
            "gross_margin_rate": p.gross_margin_rate,
            "shelf_life_days": p.shelf_life_days,
            "supplier_id": p.supplier_id,
            "is_seasonal": p.is_seasonal,
            "is_active": p.is_active,
        }
        for p in products
    ]
