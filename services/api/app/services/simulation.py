import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.retail import Store, Product, StoreRoute
from app.models.operational import InventorySnapshot
from app.services.forecasting import forecast_demand_horizon

def run_decision_twin_simulation(
    db: Session,
    store_id: str,
    sku: str,
    demand_multiplier: float = 1.0,
    inventory_override: Optional[int] = None,
    lead_time_override: Optional[int] = None,
    transfer_quantity: int = 0,
    source_store_id: Optional[str] = None,
    promo_discount_pct: float = 0.0,
    procurement_budget_inr: float = 50000.0,
    planning_horizon_days: int = 7,
) -> Dict[str, Any]:
    dest_store = db.query(Store).filter(Store.store_id == store_id).first()
    product = db.query(Product).filter(Product.sku == sku).first()
    dest_inv = (
        db.query(InventorySnapshot)
        .filter(InventorySnapshot.store_id == store_id, InventorySnapshot.sku == sku)
        .first()
    )

    store_name = dest_store.store_name if dest_store else store_id
    prod_name = product.product_name if product else sku

    # Baseline starting conditions
    base_on_hand = dest_inv.on_hand_units if dest_inv else 18
    base_reserved = dest_inv.reserved_units if dest_inv else 4
    base_incoming = dest_inv.confirmed_incoming_units if dest_inv else 0
    base_safety_stock = dest_inv.safety_stock_units if dest_inv else 20

    start_on_hand = inventory_override if inventory_override is not None else base_on_hand
    avail_start = max(0, start_on_hand - base_reserved)

    # 7-day demand forecast
    fc_data = forecast_demand_horizon(
        db, store_id, sku,
        horizon_days=planning_horizon_days,
        demand_multiplier=demand_multiplier,
        promo_discount_pct=promo_discount_pct
    )
    daily_forecasts = fc_data["forecast_daily"]

    # 1. Baseline Run (Current State without hypothetical transfer)
    cur_inv = avail_start
    cur_total_demand = 0
    cur_total_consumption = 0
    cur_total_stockouts = 0

    for pt in daily_forecasts:
        dem = pt["forecast_p50"]
        cur_total_demand += dem
        cons = min(cur_inv, dem)
        stk = dem - cons
        cur_total_consumption += cons
        cur_total_stockouts += stk
        cur_inv = max(0, cur_inv - dem)

    cur_ending_inv = cur_inv

    # 2. Simulated State Run (With hypothetical decision twin interventions)
    # Transfer arrives on Day 1 (fast intra-city transit)
    # Incoming purchase orders arrive on Day 4 (standard supplier lead time)
    sim_inv = avail_start
    timeline = []
    sim_total_demand = 0
    sim_total_consumption = 0
    sim_total_stockouts = 0
    cum_profit = 0.0

    unit_margin = (product.selling_price_inr - product.unit_cost_inr) if product else 25.0
    stockout_penalty = unit_margin * 1.2

    for i, pt in enumerate(daily_forecasts):
        day_num = i + 1
        day_date = pt["date"]
        dem = pt["forecast_p50"]
        sim_total_demand += dem

        # Check arrival events
        arrivals = 0
        desc_parts = []
        if day_num == 1 and transfer_quantity > 0:
            arrivals += transfer_quantity
            desc_parts.append(f"+{transfer_quantity}u inter-store transfer arrived from source")
        
        # Confirmed inbound PO
        if day_num == 4 and base_incoming > 0:
            arrivals += base_incoming
            desc_parts.append(f"+{base_incoming}u supplier shipment arrived")

        start_day_inv = sim_inv + arrivals
        cons = min(start_day_inv, dem)
        stk = dem - cons
        end_day_inv = max(0, start_day_inv - dem)

        sim_total_consumption += cons
        sim_total_stockouts += stk
        sim_inv = end_day_inv

        # Profit accumulation
        day_profit = (cons * unit_margin) - (stk * stockout_penalty)
        cum_profit += day_profit

        if not desc_parts:
            if stk > 0:
                desc_parts.append(f"Stockout: {stk} units unmet demand")
            else:
                desc_parts.append("Normal demand fulfillment")

        timeline.append({
            "day": day_num,
            "date": day_date,
            "starting_inventory": start_day_inv,
            "forecast_demand": dem,
            "consumption": cons,
            "arrivals": arrivals,
            "stockouts": stk,
            "ending_inventory": end_day_inv,
            "cumulative_profit_inr": round(cum_profit, 2),
            "description": "; ".join(desc_parts),
        })

    sim_ending_inv = sim_inv

    # 3. Side-by-side comparison matrix
    comparison_table = [
        {
            "metric_name": f"{store_name} Available Inventory",
            "current_state_val": f"{avail_start} units",
            "simulated_state_val": f"{avail_start + transfer_quantity} units",
            "delta_val": f"+{transfer_quantity} units" if transfer_quantity > 0 else "0 units",
            "impact_direction": "POSITIVE" if transfer_quantity > 0 else "NEUTRAL",
        },
        {
            "metric_name": "Projected Stockout Exposure",
            "current_state_val": f"{cur_total_stockouts} units",
            "simulated_state_val": f"{sim_total_stockouts} units",
            "delta_val": f"-{cur_total_stockouts - sim_total_stockouts} units",
            "impact_direction": "POSITIVE" if sim_total_stockouts < cur_total_stockouts else "NEUTRAL",
        },
        {
            "metric_name": "Fulfilled Consumer Demand",
            "current_state_val": f"{cur_total_consumption} units",
            "simulated_state_val": f"{sim_total_consumption} units",
            "delta_val": f"+{sim_total_consumption - cur_total_consumption} units",
            "impact_direction": "POSITIVE" if sim_total_consumption > cur_total_consumption else "NEUTRAL",
        },
        {
            "metric_name": "Service Level",
            "current_state_val": f"{round((cur_total_consumption / max(1, cur_total_demand)) * 100, 1)}%",
            "simulated_state_val": f"{round((sim_total_consumption / max(1, sim_total_demand)) * 100, 1)}%",
            "delta_val": f"+{round(((sim_total_consumption - cur_total_consumption) / max(1, cur_total_demand)) * 100, 1)}%",
            "impact_direction": "POSITIVE",
        },
        {
            "metric_name": "Projected Ending Inventory",
            "current_state_val": f"{cur_ending_inv} units",
            "simulated_state_val": f"{sim_ending_inv} units",
            "delta_val": f"{sim_ending_inv - cur_ending_inv:+d} units",
            "impact_direction": "POSITIVE" if sim_ending_inv >= base_safety_stock else "NEUTRAL",
        },
        {
            "metric_name": "Expected Gross Profit Impact",
            "current_state_val": f"₹{cur_total_consumption * unit_margin:,.2f}",
            "simulated_state_val": f"₹{sim_total_consumption * unit_margin:,.2f}",
            "delta_val": f"+₹{(sim_total_consumption - cur_total_consumption) * unit_margin:,.2f}",
            "impact_direction": "POSITIVE",
        },
    ]

    # Source store impact if transfer requested
    if source_store_id and transfer_quantity > 0:
        src_inv = (
            db.query(InventorySnapshot)
            .filter(InventorySnapshot.store_id == source_store_id, InventorySnapshot.sku == sku)
            .first()
        )
        src_store = db.query(Store).filter(Store.store_id == source_store_id).first()
        src_name = src_store.store_name if src_store else source_store_id
        src_start = src_inv.on_hand_units if src_inv else 100
        src_safe = src_inv.safety_stock_units if src_inv else 30
        src_end = src_start - transfer_quantity

        comparison_table.append({
            "metric_name": f"{src_name} Residual Inventory",
            "current_state_val": f"{src_start} units",
            "simulated_state_val": f"{src_end} units",
            "delta_val": f"-{transfer_quantity} units",
            "impact_direction": "POSITIVE" if src_end >= src_safe else "NEGATIVE",
        })

    # Recommended action dynamically adapted based on simulated parameters
    if sim_total_stockouts == 0:
        rec_action = f"Execute planned transfer of {transfer_quantity} units from {source_store_id or 'source'}."
    elif transfer_quantity == 0:
        rec_action = f"Initiate inter-store transfer of at least {cur_total_stockouts} units immediately to prevent stockout."
    else:
        rec_action = f"Increase transfer quantity by {sim_total_stockouts} units or place an expedited supplier replenishment."

    return {
        "scenario_id": f"SCEN_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        "store_id": store_id,
        "store_name": store_name,
        "sku": sku,
        "product_name": prod_name,
        "planning_horizon_days": planning_horizon_days,
        "inputs": {
            "demand_multiplier": demand_multiplier,
            "inventory_override": inventory_override,
            "transfer_quantity": transfer_quantity,
            "source_store_id": source_store_id,
            "promo_discount_pct": promo_discount_pct,
            "procurement_budget_inr": procurement_budget_inr,
        },
        "timeline": timeline,
        "comparison_table": comparison_table,
        "summary_metrics": {
            "current_stockout_units": cur_total_stockouts,
            "simulated_stockout_units": sim_total_stockouts,
            "stockout_reduction_pct": round(
                ((cur_total_stockouts - sim_total_stockouts) / max(1, cur_total_stockouts)) * 100, 1
            ) if cur_total_stockouts > 0 else 0.0,
            "simulated_cumulative_profit_inr": round(cum_profit, 2),
        },
        "recommended_action_under_scenario": rec_action,
    }
