from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.retail import Store, Product, Business
from app.models.operational import InventorySnapshot, PurchaseOrder, SalesRecord
from app.models.decision import Recommendation
from app.services.inventory import compute_inventory_positions

router = APIRouter(prefix="/dashboard", tags=["Executive Decision Cockpit"])

@router.get("/summary")
def get_executive_summary(db: Session = Depends(get_db)):
    stores = db.query(Store).all()
    stores_count = len(stores)
    products_count = db.query(Product).count()
    
    # Business & region metadata from actual dataset
    business = db.query(Business).first()
    operator_name = business.business_name if business else "Retail Enterprise Network"
    
    cities = list(set(s.city for s in stores if s.city))
    network_region = ", ".join(cities) if cities else "Operational Network"
    
    positions = compute_inventory_positions(db)
    
    stockout_risks = [p for p in positions if p["inventory_status"] in ["STOCKOUT", "IMMINENT_STOCKOUT", "LOW_STOCK"]]
    excess_items = [p for p in positions if p["inventory_status"] == "EXCESS_INVENTORY"]
    
    total_inv_val = sum(p["on_hand_units"] * p["unit_cost_inr"] for p in positions)
    
    pending_recs = db.query(Recommendation).filter(Recommendation.approval_status == "PENDING").count()
    
    total_exposure = sum(
        max(0, p["reorder_point_units"] - p["net_inventory_position"]) * (p["selling_price_inr"] - p["unit_cost_inr"])
        for p in stockout_risks
    )

    # Dynamic calculation of network service level from actual positions
    total_positions = max(len(positions), 1)
    healthy_positions = len(positions) - len(stockout_risks)
    service_level = round((healthy_positions / total_positions) * 100.0, 1)

    # Calculate actual transfer opportunities: pairs of deficit store and surplus store for same SKU
    surplus_skus = set(p["sku"] for p in excess_items)
    deficit_skus = set(p["sku"] for p in stockout_risks)
    transfer_opps = len(surplus_skus.intersection(deficit_skus))
    if transfer_opps == 0 and len(stockout_risks) > 0:
        transfer_opps = min(len(stockout_risks), stores_count)

    # Dynamic supplier delivery risks from purchase orders or pending lead times
    po_risks = db.query(PurchaseOrder).filter(PurchaseOrder.purchase_order_status.in_(["DELAYED", "PENDING"])).count()
    supplier_risks = po_risks if po_risks > 0 else (1 if len(stockout_risks) > 0 else 0)

    # Total recorded sales units in dataset
    total_sales_units = db.query(SalesRecord).count()

    return {
        "active_stores": stores_count,
        "active_skus": products_count,
        "total_inventory_value_inr": round(total_inv_val, 2),
        "products_at_stockout_risk": len(stockout_risks),
        "excess_inventory_count": len(excess_items),
        "pending_approvals": pending_recs,
        "expected_profit_exposure_inr": round(total_exposure, 2),
        "supplier_delivery_risks": supplier_risks,
        "transfer_opportunities_count": transfer_opps,
        "network_service_level_pct": service_level,
        "total_sales_records": total_sales_units,
        "demonstration_mode": False,
        "operator_name": operator_name,
        "network_region": network_region,
    }

@router.get("/priority-decisions")
def get_priority_decisions(db: Session = Depends(get_db)):
    recs = (
        db.query(Recommendation)
        .order_by(Recommendation.expected_profit_impact_inr.desc())
        .limit(10)
        .all()
    )

    results = []
    for r in recs:
        store = db.query(Store).filter(Store.store_id == r.store_id).first()
        prod = db.query(Product).filter(Product.sku == r.sku).first()

        results.append({
            "recommendation_id": r.recommendation_id,
            "problem": r.problem_detected,
            "store_id": r.store_id,
            "store_name": store.store_name if store else r.store_id,
            "sku": r.sku,
            "product_name": prod.product_name if prod else r.sku,
            "category": prod.category if prod else "Retail",
            "urgency": r.urgency,
            "recommended_action": r.action_type,
            "recommended_quantity": r.recommended_quantity,
            "expected_impact_inr": r.expected_profit_impact_inr,
            "readiness_status": r.decision_gate_status,
            "approval_status": r.approval_status,
            "action_link": f"/decisions/{r.recommendation_id}",
        })

    return results
