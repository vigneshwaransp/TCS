import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.retail import Store, Product, StoreProductAssortment, Promotion
from app.models.operational import InventorySnapshot, SalesRecord, PurchaseOrder

def compute_inventory_positions(db: Session, store_id: str = None) -> List[Dict[str, Any]]:
    query = (
        db.query(InventorySnapshot, Store, Product)
        .join(Store, InventorySnapshot.store_id == Store.store_id)
        .join(Product, InventorySnapshot.sku == Product.sku)
    )
    if store_id:
        query = query.filter(InventorySnapshot.store_id == store_id)

    records = query.all()
    results = []

    for inv, store, prod in records:
        net_pos = inv.on_hand_units + inv.confirmed_incoming_units - inv.reserved_units
        daily_est = max(1.0, inv.safety_stock_units / 2.5)
        days_of_supply = round(max(0.0, net_pos / daily_est), 1)

        # Classification
        if inv.on_hand_units <= 0:
            status = "STOCKOUT"
        elif net_pos <= inv.safety_stock_units * 0.75:
            status = "IMMINENT_STOCKOUT"
        elif net_pos <= inv.reorder_point_units:
            status = "LOW_STOCK"
        elif net_pos >= inv.target_stock_units * 1.3:
            status = "EXCESS_INVENTORY"
        else:
            status = "HEALTHY"

        results.append({
            "store_id": store.store_id,
            "store_name": store.store_name,
            "sku": prod.sku,
            "product_name": prod.product_name,
            "category": prod.category,
            "selling_price_inr": prod.selling_price_inr,
            "unit_cost_inr": prod.unit_cost_inr,
            "on_hand_units": inv.on_hand_units,
            "reserved_units": inv.reserved_units,
            "confirmed_incoming_units": inv.confirmed_incoming_units,
            "net_inventory_position": net_pos,
            "safety_stock_units": inv.safety_stock_units,
            "reorder_point_units": inv.reorder_point_units,
            "target_stock_units": inv.target_stock_units,
            "days_of_supply": days_of_supply,
            "inventory_status": status,
            "expiry_in_days": inv.expiry_in_days_of_nearest_batch or 180,
            "storage_capacity_units": inv.storage_capacity_units_for_sku or 500,
        })

    return results

def detect_stockout_risks(db: Session) -> List[Dict[str, Any]]:
    all_positions = compute_inventory_positions(db)
    risks = [
        p for p in all_positions 
        if p["inventory_status"] in ["STOCKOUT", "IMMINENT_STOCKOUT", "LOW_STOCK"]
    ]
    # Sort by urgency (lowest days of supply first)
    risks.sort(key=lambda x: x["days_of_supply"])
    return risks
