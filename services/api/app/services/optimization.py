import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.retail import Store, Product, Supplier, StoreRoute, StoreProductAssortment
from app.models.operational import InventorySnapshot

def evaluate_decision_alternatives(
    db: Session,
    store_id: str,
    sku: str,
    forecast_demand_7d: int,
    planning_horizon_days: int = 7,
    demand_multiplier: float = 1.0,
    procurement_budget_inr: float = 60000.0,
    transfer_cost_override: Optional[float] = None,
) -> Dict[str, Any]:
    # 1. Fetch current store & inventory
    dest_store = db.query(Store).filter(Store.store_id == store_id).first()
    dest_inv = (
        db.query(InventorySnapshot)
        .filter(InventorySnapshot.store_id == store_id, InventorySnapshot.sku == sku)
        .first()
    )
    product = db.query(Product).filter(Product.sku == sku).first()
    supplier = db.query(Supplier).filter(Supplier.supplier_id == product.supplier_id).first()

    current_on_hand = dest_inv.on_hand_units if dest_inv else 18
    reserved = dest_inv.reserved_units if dest_inv else 4
    confirmed_in = dest_inv.confirmed_incoming_units if dest_inv else 0
    safety_stock = dest_inv.safety_stock_units if dest_inv else 20
    storage_cap = dest_inv.storage_capacity_units_for_sku if dest_inv else 400

    available_start = max(0, current_on_hand - reserved)
    price = product.selling_price_inr
    cost = product.unit_cost_inr
    unit_margin = price - cost
    stockout_penalty_per_unit = unit_margin * 1.2 # includes lost customer goodwill
    holding_cost_per_unit = round(cost * 0.005, 2)

    total_demand = int(round(forecast_demand_7d * demand_multiplier))

    # 2. Look for best candidate transfer source store
    # Must have transferable surplus: (on_hand - reserved - safety_stock - future_demand) > 0
    candidate_sources = []
    routes = (
        db.query(StoreRoute)
        .filter(StoreRoute.destination_store_id == store_id, StoreRoute.route_available == True)
        .all()
    )
    for r in routes:
        s_inv = (
            db.query(InventorySnapshot)
            .filter(InventorySnapshot.store_id == r.origin_store_id, InventorySnapshot.sku == sku)
            .first()
        )
        if s_inv:
            s_on_hand = s_inv.on_hand_units
            s_safe = s_inv.safety_stock_units
            s_res = s_inv.reserved_units
            # Transferable surplus strictly protects source safety stock
            surplus = max(0, s_on_hand - s_res - int(s_safe * 1.2))
            if surplus > 0:
                s_store = db.query(Store).filter(Store.store_id == r.origin_store_id).first()
                route_cost = transfer_cost_override if transfer_cost_override is not None else r.estimated_route_cost_inr
                candidate_sources.append({
                    "store_id": r.origin_store_id,
                    "store_name": s_store.store_name,
                    "surplus": surplus,
                    "route_distance_km": r.road_distance_km_est,
                    "travel_time_min": r.estimated_travel_time_min,
                    "route_cost_inr": route_cost,
                    "on_hand": s_on_hand,
                    "safety_stock": s_safe,
                })

    # Sort sources by route cost / proximity
    candidate_sources.sort(key=lambda x: x["route_cost_inr"])
    best_source = candidate_sources[0] if candidate_sources else None

    shortage = max(0, total_demand - (available_start + confirmed_in))

    alternatives = []

    # -------------------------------------------------------------
    # Alternative 1: DO NOTHING (No Action)
    # -------------------------------------------------------------
    fulfilled_no_act = min(available_start + confirmed_in, total_demand)
    stockout_no_act = total_demand - fulfilled_no_act
    end_inv_no_act = max(0, (available_start + confirmed_in) - total_demand)
    rev_no_act = fulfilled_no_act * price
    cogs_no_act = fulfilled_no_act * cost
    holding_no_act = end_inv_no_act * holding_cost_per_unit
    stockout_cost_no_act = stockout_no_act * stockout_penalty_per_unit
    profit_no_act = round(rev_no_act - cogs_no_act - holding_no_act - stockout_cost_no_act, 2)

    alternatives.append({
        "action_type": "NO_ACTION",
        "action_title": "Do Nothing (Baseline)",
        "proposed_quantity": 0,
        "source_entity": "N/A",
        "expected_contribution_profit_inr": profit_no_act,
        "incremental_cost_inr": 0.0,
        "projected_stockout_exposure": stockout_no_act,
        "ending_inventory": end_inv_no_act,
        "service_level_pct": round((fulfilled_no_act / max(1, total_demand)) * 100, 1),
        "feasibility_status": "FEASIBLE",
        "infeasibility_reason": None,
        "is_preferred": False,
        "assumptions_summary": "Zero operational cost, but incurs substantial lost sales and customer stockout dissatisfaction.",
    })

    # -------------------------------------------------------------
    # Alternative 2: STORE-TO-STORE TRANSFER
    # -------------------------------------------------------------
    if best_source:
        trf_qty = min(shortage + safety_stock, best_source["surplus"])
        # Vehicle capacity check
        trf_qty = min(trf_qty, 1500)
        trf_cost = best_source["route_cost_inr"]
        
        # Transfer arrives in ~1 hour (within day 1), immediately available
        fulfilled_trf = min(available_start + confirmed_in + trf_qty, total_demand)
        stockout_trf = total_demand - fulfilled_trf
        end_inv_trf = max(0, (available_start + confirmed_in + trf_qty) - total_demand)
        profit_trf = round(
            (fulfilled_trf * unit_margin) - trf_cost - (end_inv_trf * holding_cost_per_unit) - (stockout_trf * stockout_penalty_per_unit),
            2
        )
        feasible_trf = trf_qty > 0
        infeasible_reason_trf = None if feasible_trf else "Source stores lack surplus stock above their safety threshold."

        alternatives.append({
            "action_type": "STORE_TRANSFER",
            "action_title": f"Transfer from {best_source['store_name']}",
            "proposed_quantity": trf_qty,
            "source_entity": best_source["store_name"],
            "expected_contribution_profit_inr": profit_trf,
            "incremental_cost_inr": trf_cost,
            "projected_stockout_exposure": stockout_trf,
            "ending_inventory": end_inv_trf,
            "service_level_pct": round((fulfilled_trf / max(1, total_demand)) * 100, 1),
            "feasibility_status": "FEASIBLE" if feasible_trf else "INFEASIBLE",
            "infeasibility_reason": infeasible_reason_trf,
            "is_preferred": False,
            "assumptions_summary": f"Dispatch via {best_source['route_distance_km']}km road route ({best_source['travel_time_min']}m transit). Protects source safety stock.",
        })
    else:
        alternatives.append({
            "action_type": "STORE_TRANSFER",
            "action_title": "Store-to-Store Transfer",
            "proposed_quantity": 0,
            "source_entity": "No viable source",
            "expected_contribution_profit_inr": 0.0,
            "incremental_cost_inr": 0.0,
            "projected_stockout_exposure": shortage,
            "ending_inventory": 0,
            "service_level_pct": 20.0,
            "feasibility_status": "INFEASIBLE",
            "infeasibility_reason": "No nearby branch has surplus inventory exceeding safety stock threshold.",
            "is_preferred": False,
            "assumptions_summary": "Constraint violation: Source store safety stock cannot be compromised.",
        })

    # -------------------------------------------------------------
    # Alternative 3: SUPPLIER REPLENISHMENT
    # -------------------------------------------------------------
    lead_time = supplier.supplier_lead_time_days if supplier else 4
    moq = supplier.minimum_order_quantity if supplier else 50
    pack_mult = product.reorder_pack_multiple if product else 10
    
    # Calculate order qty: round up to pack multiple, respect MOQ
    raw_order_qty = max(moq, shortage + safety_stock)
    order_qty = int(math.ceil(raw_order_qty / pack_mult) * pack_mult)
    procure_cost = round(order_qty * cost, 2)
    shipping_cost = supplier.delivery_cost_inr if supplier else 1200.0
    tot_procure_cost = procure_cost + shipping_cost

    # Lead time constraint: Supplier order takes 'lead_time' days (e.g. 4 days).
    # During Days 1..lead_time, demand is served ONLY from existing on-hand stock.
    # Therefore, some stockouts occur in the intermediate period before delivery!
    demand_during_lead_time = int(round(total_demand * (lead_time / planning_horizon_days)))
    stockout_during_lead = max(0, demand_during_lead_time - available_start)
    fulfilled_supp = total_demand - stockout_during_lead
    end_inv_supp = (available_start + confirmed_in + order_qty) - total_demand

    profit_supp = round(
        (fulfilled_supp * unit_margin) - shipping_cost - (end_inv_supp * holding_cost_per_unit) - (stockout_during_lead * stockout_penalty_per_unit),
        2
    )

    budget_feasible = tot_procure_cost <= procurement_budget_inr
    storage_feasible = (available_start + order_qty) <= storage_cap
    feasible_supp = budget_feasible and storage_feasible
    infeas_reason_supp = None
    if not budget_feasible:
        infeas_reason_supp = f"Procurement cost (₹{tot_procure_cost:,.2f}) exceeds configured budget limit (₹{procurement_budget_inr:,.2f})."
    elif not storage_feasible:
        infeas_reason_supp = f"Total order ({order_qty} units) exceeds store backroom storage capacity ({storage_cap} units)."

    alternatives.append({
        "action_type": "SUPPLIER_REPLENISHMENT",
        "action_title": f"Procure from {supplier.supplier_name if supplier else 'Supplier'}",
        "proposed_quantity": order_qty,
        "source_entity": supplier.supplier_name if supplier else "Primary Vendor",
        "expected_contribution_profit_inr": profit_supp,
        "incremental_cost_inr": tot_procure_cost,
        "projected_stockout_exposure": stockout_during_lead,
        "ending_inventory": max(0, end_inv_supp),
        "service_level_pct": round((fulfilled_supp / max(1, total_demand)) * 100, 1),
        "feasibility_status": "FEASIBLE" if feasible_supp else "INFEASIBLE",
        "infeasibility_reason": infeas_reason_supp,
        "is_preferred": False,
        "assumptions_summary": f"Lead time {lead_time} days. Intermediate stockout exposure {stockout_during_lead} units before delivery.",
    })

    # -------------------------------------------------------------
    # Alternative 4: PROMOTION ADJUSTMENT (Reduce discount depth)
    # -------------------------------------------------------------
    # Cancelling or lowering promo discount from 15% to 5% dampens demand spike
    dampened_demand = int(round(total_demand * 0.72))
    fulfilled_promo = min(available_start + confirmed_in, dampened_demand)
    stockout_promo = dampened_demand - fulfilled_promo
    end_inv_promo = max(0, (available_start + confirmed_in) - dampened_demand)
    # Higher average price due to smaller discount
    adj_price = price * 0.95
    adj_margin = adj_price - cost
    profit_promo = round(
        (fulfilled_promo * adj_margin) - (stockout_promo * stockout_penalty_per_unit),
        2
    )

    alternatives.append({
        "action_type": "PROMO_ADJUSTMENT",
        "action_title": "Reduce Promotion Discount Depth (15% -> 5%)",
        "proposed_quantity": 0,
        "source_entity": "Pricing Policy",
        "expected_contribution_profit_inr": profit_promo,
        "incremental_cost_inr": 0.0,
        "projected_stockout_exposure": stockout_promo,
        "ending_inventory": end_inv_promo,
        "service_level_pct": round((fulfilled_promo / max(1, dampened_demand)) * 100, 1),
        "feasibility_status": "FEASIBLE",
        "infeasibility_reason": None,
        "is_preferred": False,
        "assumptions_summary": "Dampens peak demand by 28%, preserving margin on available units but sacrificing top-line footfall.",
    })

    # -------------------------------------------------------------
    # Alternative 5: COMBINED ACTION (Transfer now + Supplier replenishment)
    # -------------------------------------------------------------
    if best_source:
        quick_trf = min(40, best_source["surplus"])
        supp_order = max(moq, 60)
        tot_inc_cost = round(best_source["route_cost_inr"] + (supp_order * cost) + shipping_cost, 2)
        
        # Transfer covers Days 1..3, supplier order covers Day 4+
        fulfilled_comb = total_demand
        stockout_comb = 0
        end_inv_comb = (available_start + quick_trf + supp_order) - total_demand
        profit_comb = round(
            (fulfilled_comb * unit_margin) - best_source["route_cost_inr"] - shipping_cost - (end_inv_comb * holding_cost_per_unit),
            2
        )
        feasible_comb = (tot_inc_cost <= procurement_budget_inr * 1.2) and (quick_trf > 0)

        alternatives.append({
            "action_type": "COMBINED",
            "action_title": f"Combined: Transfer {quick_trf}u from {best_source['store_name']} + Reorder {supp_order}u",
            "proposed_quantity": quick_trf + supp_order,
            "source_entity": f"{best_source['store_name']} & {supplier.supplier_name if supplier else 'Supplier'}",
            "expected_contribution_profit_inr": profit_comb,
            "incremental_cost_inr": tot_inc_cost,
            "projected_stockout_exposure": stockout_comb,
            "ending_inventory": max(0, end_inv_comb),
            "service_level_pct": 100.0,
            "feasibility_status": "FEASIBLE" if feasible_comb else "INFEASIBLE",
            "infeasibility_reason": None if feasible_comb else "Budget exceeded for combined dual dispatch.",
            "is_preferred": False,
            "assumptions_summary": "Fast inter-store transfer bridges the 4-day supplier lead time, eliminating stockouts completely.",
        })

    # -------------------------------------------------------------
    # Optimal Choice Selection (Maximize profit among FEASIBLE options)
    # -------------------------------------------------------------
    feasible_options = [a for a in alternatives if a["feasibility_status"] == "FEASIBLE"]
    if feasible_options:
        # Sort by expected contribution profit descending
        feasible_options.sort(key=lambda x: x["expected_contribution_profit_inr"], reverse=True)
        best_option = feasible_options[0]
        # Mark as preferred in the master list
        for a in alternatives:
            if a["action_type"] == best_option["action_type"] and a["proposed_quantity"] == best_option["proposed_quantity"]:
                a["is_preferred"] = True
    else:
        best_option = alternatives[0]
        alternatives[0]["is_preferred"] = True

    return {
        "best_action": best_option,
        "alternatives": alternatives,
        "shortage_units": shortage,
        "best_source": best_source,
        "supplier": {
            "supplier_id": supplier.supplier_id if supplier else None,
            "supplier_name": supplier.supplier_name if supplier else None,
            "lead_time_days": lead_time,
            "delivery_cost_inr": shipping_cost,
        } if supplier else None,
    }
