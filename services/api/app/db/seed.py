import csv
import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.identity import User
from app.models.retail import (
    Business, Store, Supplier, Product,
    StoreProductAssortment, StoreRoute, Promotion
)
from app.models.operational import (
    SalesRecord, InventorySnapshot, PurchaseOrder,
    StoreTransfer, ExternalSignal
)
from app.models.decision import (
    DecisionRun, Recommendation, RecommendationAlternative,
    DecisionOutcome, PolicyExperiment
)
from app.core.security import DEMO_USERS
from app.services.optimization import evaluate_decision_alternatives
from app.services.decision_gate import evaluate_decision_gate

candidate_dirs = [
    Path(__file__).resolve().parents[4] / "retailmind_dmart_dataset",
    Path(__file__).resolve().parents[3] / "retailmind_dmart_dataset",
    Path.cwd() / "retailmind_dmart_dataset",
]
DATASET_DIR = next((d for d in candidate_dirs if d.exists()), candidate_dirs[0])

def load_csv(filename):
    path = DATASET_DIR / filename
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Store).count() > 0:
            print("Database already seeded with DMart Chennai network.")
            return

        print("Seeding database from retailmind_dmart_dataset...")

        # 1. Users
        for u in DEMO_USERS.values():
            db.add(User(
                user_id=u.user_id,
                email=u.email,
                full_name=u.full_name,
                role=u.role.value,
                organization_id=u.organization_id,
            ))
        db.commit()

        # 2. Businesses
        for r in load_csv("businesses.csv"):
            db.add(Business(
                business_id=r["business_id"],
                business_name=r["business_name"],
                legal_entity_name=r["legal_entity_name"],
                business_type=r["business_type"],
                headquarters_address=r["headquarters_address"],
                headquarters_city=r["headquarters_city"],
                headquarters_state=r["headquarters_state"],
                country=r["country"],
                transfer_policy=r["transfer_policy"],
                is_active=r["is_active"].upper() == "TRUE",
                data_source=r["data_source"],
                verification_status=r["verification_status"],
            ))
        db.commit()

        # 3. Stores
        for r in load_csv("stores.csv"):
            db.add(Store(
                store_id=r["store_id"],
                business_id=r["business_id"],
                store_name=r["store_name"],
                store_code=r["store_code"],
                address=r["address"],
                locality=r["locality"],
                city=r["city"],
                district=r["district"],
                state=r["state"],
                postal_code=r["postal_code"],
                latitude=float(r["latitude"]),
                longitude=float(r["longitude"]),
                opening_time=r["opening_time"],
                closing_time=r["closing_time"],
                store_type=r["store_type"],
                storage_capacity_units=int(r["storage_capacity_units"]),
                is_active=r["is_active"].upper() == "TRUE",
                location_source_url=r["location_source_url"],
                verification_status=r["verification_status"],
                verification_date=r["verification_date"],
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 4. Suppliers
        for r in load_csv("suppliers.csv"):
            db.add(Supplier(
                supplier_id=r["supplier_id"],
                supplier_name=r["supplier_name"],
                supplier_city=r["supplier_city"],
                supplier_state=r["supplier_state"],
                supplier_lead_time_days=int(r["supplier_lead_time_days"]),
                supplier_reliability_rate=float(r["supplier_reliability_rate"]),
                minimum_order_value_inr=float(r["minimum_order_value_inr"]),
                minimum_order_quantity=int(r["minimum_order_quantity"]),
                delivery_cost_inr=float(r["delivery_cost_inr"]),
                delivery_cost_per_km_inr=float(r["delivery_cost_per_km_inr"]),
                is_active=r["is_active"].upper() == "TRUE",
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 5. Products
        for r in load_csv("products_suppliers.csv"):
            db.add(Product(
                sku=r["sku"],
                product_name=r["product_name"],
                brand=r["brand"],
                category=r["category"],
                subcategory=r["subcategory"],
                product_description=r["product_description"],
                unit_of_measure=r["unit_of_measure"],
                pack_size=float(r["pack_size"]),
                pack_size_units=r["pack_size_units"],
                selling_price_inr=float(r["selling_price_inr"]),
                unit_cost_inr=float(r["unit_cost_inr"]),
                gross_margin_rate=float(r["gross_margin_rate"]),
                shelf_life_days=int(r["shelf_life_days"]),
                perishability_class=r["perishability_class"],
                storage_requirement=r["storage_requirement"],
                minimum_order_quantity=int(r["minimum_order_quantity"]),
                reorder_pack_multiple=int(r["reorder_pack_multiple"]),
                supplier_id=r["supplier_id"],
                supplier_lead_time_days=int(r["supplier_lead_time_days"]),
                supplier_reliability_rate=float(r["supplier_reliability_rate"]),
                demand_volatility_class=r["demand_volatility_class"],
                is_seasonal=r["is_seasonal"].upper() == "TRUE",
                is_active=r["is_active"].upper() == "TRUE",
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 6. Store Routes
        for r in load_csv("store_routes.csv"):
            db.add(StoreRoute(
                origin_store_id=r["origin_store_id"],
                destination_store_id=r["destination_store_id"],
                road_distance_km_est=float(r["road_distance_km_est"]),
                estimated_travel_time_min=int(r["estimated_travel_time_min"]),
                fixed_dispatch_cost_inr=float(r["fixed_dispatch_cost_inr"]),
                cost_per_km_inr=float(r["cost_per_km_inr"]),
                estimated_route_cost_inr=float(r["estimated_route_cost_inr"]),
                route_available=r["route_available"].upper() == "TRUE",
                vehicle_type=r["vehicle_type"],
                estimated_vehicle_capacity_units=int(r["estimated_vehicle_capacity_units"]),
                traffic_level_assumption=r["traffic_level_assumption"],
                route_source=r["route_source"],
                verification_status=r["verification_status"],
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 7. Promotions
        for r in load_csv("promotions.csv"):
            db.add(Promotion(
                promotion_id=r["promotion_id"],
                business_id=r["business_id"],
                store_id=r["store_id"],
                sku=r["sku"],
                promotion_name=r["promotion_name"],
                promotion_type=r["promotion_type"],
                start_date=r["start_date"],
                end_date=r["end_date"],
                discount_pct=float(r["discount_pct"]),
                promotion_budget_inr=float(r["promotion_budget_inr"]),
                planned_flag=r["planned_flag"].upper() == "TRUE",
                is_active=r["is_active"].upper() == "TRUE",
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 8. Inventory Snapshots
        for r in load_csv("inventory.csv"):
            db.add(InventorySnapshot(
                snapshot_date=r["snapshot_date"],
                business_id=r["business_id"],
                store_id=r["store_id"],
                sku=r["sku"],
                on_hand_units=int(r["on_hand_units"]),
                reserved_units=int(r["reserved_units"]),
                confirmed_incoming_units=int(r["confirmed_incoming_units"]),
                safety_stock_units=int(r["safety_stock_units"]),
                reorder_point_units=int(r["reorder_point_units"]),
                target_stock_units=int(r["target_stock_units"]),
                nearest_batch_expiry_date=r["nearest_batch_expiry_date"],
                expiry_in_days_of_nearest_batch=int(r["expiry_in_days_of_nearest_batch"]) if r["expiry_in_days_of_nearest_batch"] else 180,
                storage_capacity_units_for_sku=int(r["storage_capacity_units_for_sku"]) if r["storage_capacity_units_for_sku"] else 300,
                last_restock_date=r["last_restock_date"],
                inventory_status=r["inventory_status"],
                data_provenance=r["data_provenance"],
            ))
        db.commit()

        # 9. Sales History (Load in batches)
        sales_records = load_csv("sales_history.csv")
        batch_size = 5000
        for i in range(0, len(sales_records), batch_size):
            chunk = sales_records[i:i + batch_size]
            db.bulk_insert_mappings(SalesRecord, [
                {
                    "date": r["date"],
                    "business_id": r["business_id"],
                    "store_id": r["store_id"],
                    "sku": r["sku"],
                    "units_sold": int(r["units_sold"]),
                    "price_inr": float(r["price_inr"]),
                    "discount_pct": float(r["discount_pct"]),
                    "promotion_flag": r["promotion_flag"].upper() == "TRUE",
                    "promotion_id": r["promotion_id"] if r["promotion_id"] else None,
                    "day_of_week": r["day_of_week"],
                    "is_weekend": r["is_weekend"].upper() == "TRUE",
                    "day_of_month": int(r["day_of_month"]),
                    "month": int(r["month"]),
                    "quarter": int(r["quarter"]),
                    "is_public_holiday": r["is_public_holiday"].upper() == "TRUE",
                    "festival_name": r["festival_name"] if r["festival_name"] else None,
                    "temperature_c": float(r["temperature_c"]) if r["temperature_c"] else 30.0,
                    "rainfall_mm": float(r["rainfall_mm"]) if r["rainfall_mm"] else 0.0,
                    "stock_available_at_start": int(r["stock_available_at_start"]) if r["stock_available_at_start"] else 50,
                    "stockout_flag": r["stockout_flag"].upper() == "TRUE",
                    "data_quality_flag": r["data_quality_flag"],
                    "data_provenance": r["data_provenance"],
                }
                for r in chunk
            ])
            db.commit()

        # 10. Bootstrap Core Decision Run & Flagship Recommendations
        run_id = "RUN_INITIAL_AUTOPILOT"
        db.add(DecisionRun(
            run_id=run_id,
            organization_id="ORG_DMART_IN",
            initiated_by="system_autopilot",
            user_role="OPS_MANAGER",
            objective="MAXIMIZE_CONTRIBUTION_PROFIT",
            status="COMPLETED",
            total_risks_detected=3,
            recommendations_count=2,
        ))
        db.commit()

        # Flagship Recommendation 1: Velachery Basmati Rice Promotion Stockout
        eval_res1 = evaluate_decision_alternatives(
            db, store_id="STORE_001", sku="SKU_DM_0001",
            forecast_demand_7d=118, demand_multiplier=1.0
        )
        gate_res1 = evaluate_decision_gate(
            evidence_data={}, financial_impact_inr=eval_res1["best_action"]["expected_contribution_profit_inr"],
            source_safety_violated=False, forecast_uncertainty="LOW"
        )
        
        rec1_id = "REC_001"
        rec1 = Recommendation(
            recommendation_id=rec1_id,
            run_id=run_id,
            store_id="STORE_001",
            sku="SKU_DM_0001",
            problem_detected="Imminent stockout during Pongal Festival Promotion: On-hand stock (18u) covers only 1.5 days of surge demand (118u).",
            urgency="CRITICAL",
            action_type=eval_res1["best_action"]["action_type"],
            recommended_quantity=eval_res1["best_action"]["proposed_quantity"],
            source_store_id=eval_res1["best_source"]["store_id"] if eval_res1["best_source"] else "STORE_002",
            supplier_id="SUP_001",
            expected_profit_impact_inr=eval_res1["best_action"]["expected_contribution_profit_inr"],
            incremental_cost_inr=eval_res1["best_action"]["incremental_cost_inr"],
            projected_stockout_units=eval_res1["best_action"]["projected_stockout_exposure"],
            service_level_target=0.95,
            feasibility_status=eval_res1["best_action"]["feasibility_status"],
            decision_gate_status=gate_res1["gate_status"],
            approval_status="PENDING",
            assumptions={"source_safety_stock_respected": True, "lead_time_days": 1},
            evidence_checklist=gate_res1["checklist"],
            binding_constraints=["Tata Ace vehicle capacity: 1500u", "Source store Chromepet minimum safety buffer: 30u"],
            explanation="Transferring 50 units from DMart Chromepet eliminates the impending stockout at Velachery while keeping Chromepet's inventory safely above buffer thresholds.",
        )
        db.add(rec1)
        db.commit()

        # Save alternatives
        for alt in eval_res1["alternatives"]:
            db.add(RecommendationAlternative(
                recommendation_id=rec1_id,
                action_type=alt["action_type"],
                action_title=alt["action_title"],
                proposed_quantity=alt["proposed_quantity"],
                source_entity=alt["source_entity"],
                expected_contribution_profit_inr=alt["expected_contribution_profit_inr"],
                incremental_cost_inr=alt["incremental_cost_inr"],
                projected_stockout_exposure=alt["projected_stockout_exposure"],
                ending_inventory=alt["ending_inventory"],
                service_level_pct=alt["service_level_pct"],
                feasibility_status=alt["feasibility_status"],
                infeasibility_reason=alt["infeasibility_reason"],
                is_preferred=alt["is_preferred"],
                assumptions_summary=alt["assumptions_summary"],
            ))
        db.commit()

        # Decision Regret evaluation record
        db.add(DecisionOutcome(
            outcome_id="OUTCOME_2026_HIST_01",
            recommendation_id=rec1_id,
            evaluation_date="2026-10-31",
            expected_profit_inr=eval_res1["best_action"]["expected_contribution_profit_inr"],
            observed_profit_inr=eval_res1["best_action"]["expected_contribution_profit_inr"] - 250.0,
            expected_stockouts=eval_res1["best_action"]["projected_stockout_exposure"],
            observed_stockouts=0,
            best_alternative_profit_inr=eval_res1["best_action"]["expected_contribution_profit_inr"],
            estimated_regret_inr=0.0,
            forecast_error_units=4,
            regret_analysis_summary="Decision yielded near-optimal contribution profit. Zero regret incurred.",
            evaluation_status="OBSERVED_FINAL",
        ))
        db.commit()

        print("Database seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
