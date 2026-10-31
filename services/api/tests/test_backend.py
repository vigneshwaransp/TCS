import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.seed import seed_database
from app.core.security import Role, Permission, ROLE_PERMISSIONS, DEMO_USERS

# Ensure tables and seed data are populated for tests
seed_database()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "KINTRAL" in data["service"]

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["active_stores"] == 5
    assert data["active_skus"] >= 100
    assert data["total_inventory_value_inr"] > 0
    assert "demonstration_mode" in data

def test_stores_listing():
    response = client.get("/api/v1/stores")
    assert response.status_code == 200
    stores = response.json()
    assert len(stores) == 5
    store_names = [s["store_name"] for s in stores]
    assert "DMart Velachery" in store_names
    assert "DMart Chromepet" in store_names

def test_stores_performance_dynamic_metrics():
    response = client.get("/api/v1/stores/performance")
    assert response.status_code == 200
    perf = response.json()
    assert len(perf) == 5
    for s in perf:
        assert "stock" in s
        assert "demand" in s
        assert "required" in s
        assert "inventory" in s
        assert "health_badge" in s
        assert s["stock"] > 0
        assert s["demand"] > 0
        assert s["inventory"] > 0
        assert len(s["skus"]) > 0

def test_inventory_positions():
    response = client.get("/api/v1/inventory/positions?store_id=STORE_001")
    assert response.status_code == 200
    positions = response.json()
    assert len(positions) > 0
    # Check Basmati rice in Velachery
    rice = next((p for p in positions if p["sku"] == "SKU_DM_0001"), None)
    assert rice is not None
    assert rice["inventory_status"] in ["IMMINENT_STOCKOUT", "LOW_STOCK", "STOCKOUT"]
    assert rice["net_inventory_position"] == rice["on_hand_units"] + rice["confirmed_incoming_units"] - rice["reserved_units"]

def test_recommendations_and_alternatives():
    response = client.get("/api/v1/decisions/recommendations")
    assert response.status_code == 200
    recs = response.json()
    assert len(recs) > 0
    
    rec_id = recs[0]["recommendation_id"]
    det_resp = client.get(f"/api/v1/decisions/recommendations/{rec_id}")
    assert det_resp.status_code == 200
    det = det_resp.json()
    assert "alternatives" in det
    assert len(det["alternatives"]) >= 4

def test_decision_replay_studio():
    response = client.get("/api/v1/replay/REC_001")
    assert response.status_code == 200
    data = response.json()
    assert "selected_best_action" in data
    assert "alternatives" in data
    assert "traceable_explanation" in data
    assert len(data["financial_comparison"]) >= 4

def test_ripple_intelligence_graph():
    response = client.get("/api/v1/ripple/REC_001?transfer_units=50")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert "impact_matrix" in data
    assert len(data["nodes"]) >= 6
    assert len(data["edges"]) >= 6

def test_decision_gate_and_assurance():
    # Normal state
    response = client.get("/api/v1/decision-gate/REC_001")
    assert response.status_code == 200
    data = response.json()
    assert data["current_gate_status"] in ["READY_TO_ACT", "HUMAN_REVIEW_REQUIRED"]
    assert len(data["evidence_checklist"]) == 8

    # Simulated missing data state
    resp_missing = client.get("/api/v1/decision-gate/REC_001?simulate_missing_data=true")
    assert resp_missing.status_code == 200
    data_missing = resp_missing.json()
    assert data_missing["current_gate_status"] == "INSUFFICIENT_EVIDENCE"
    assert data_missing["can_proceed_to_approval"] is False

def test_retail_decision_twin_simulation():
    payload = {
        "store_id": "STORE_001",
        "sku": "SKU_DM_0001",
        "demand_multiplier": 1.25,
        "transfer_quantity": 50,
        "source_store_id": "STORE_002",
        "planning_horizon_days": 7
    }
    response = client.post("/api/v1/simulations/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "timeline" in data
    assert len(data["timeline"]) == 7
    assert "comparison_table" in data
    assert data["summary_metrics"]["simulated_stockout_units"] <= data["summary_metrics"]["current_stockout_units"]

def test_rbac_approval_enforcement():
    # 1. Viewer role should be FORBIDDEN from approving
    payload = {
        "decision": "APPROVED",
        "selected_action": "STORE_TRANSFER",
        "approved_quantity": 50,
        "review_notes": "Attempting approval as viewer"
    }
    resp_viewer = client.post(
        "/api/v1/decisions/recommendations/REC_001/approve",
        json=payload,
        headers={"X-User-Role": "viewer"}
    )
    assert resp_viewer.status_code == 403
    assert "Permission denied" in resp_viewer.json()["detail"]

    # 2. Ops Manager role should SUCCEED
    resp_ops = client.post(
        "/api/v1/decisions/recommendations/REC_001/approve",
        json=payload,
        headers={"X-User-Role": "ops"}
    )
    assert resp_ops.status_code == 200
    assert resp_ops.json()["status"] == "APPROVED"

def test_policy_lab_comparison():
    response = client.get("/api/v1/policies/compare")
    assert response.status_code == 200
    data = response.json()
    assert len(data["policies"]) == 4
    # Policy D (KINTRAL) should have highest profit and lowest stockouts
    policy_d = next((p for p in data["policies"] if p["policy_id"] == "POL_D_CONSTRAINED_OPTIMIZATION"), None)
    assert policy_d is not None
    assert policy_d["fill_rate_pct"] > 98.0

def test_copilot_chat():
    response = client.post("/api/v1/copilot/chat", json={"query": "Why transfer 50 units?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "model_used" in data

def test_manual_user_entry_and_persistence():
    payload = {
        "full_name": "Test Engineer",
        "email": "test.engineer@dmartindia.com",
        "role": "Inventory Specialist",
        "department": "Supply Chain Operations",
        "phone": "+91 98765 43210",
        "assigned_location": "STORE_001",
        "access_tier": "operator",
        "notes": "Automated verification test user"
    }
    # 1. Create user in Neon DB
    create_resp = client.post("/api/v1/manual-entry/users", json=payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["status"] == "success"
    assert created["entry"]["full_name"] == "Test Engineer"
    entry_id = created["entry"]["entry_id"]

    # 2. List users and verify persistence
    list_resp = client.get("/api/v1/manual-entry/users")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    users = list_data.get("entries", [])
    matching = [u for u in users if u["entry_id"] == entry_id]
    assert len(matching) == 1
    assert matching[0]["email"] == "test.engineer@dmartindia.com"

    # 3. Delete user
    del_resp = client.delete(f"/api/v1/manual-entry/users/{entry_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

def test_ml_training_and_model_status():
    # 1. Verify model status endpoint
    status_resp = client.get("/api/v1/forecasts/model-status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "status" in status_data
    assert "champion_model" in status_data
    assert "models" in status_data
    assert "lightgbm" in status_data["models"]
    assert "xgboost" in status_data["models"]

    # 2. Test forward ML inference
    pred_payload = {
        "store_id": "STORE_001",
        "sku": "SKU_DM_0001",
        "base_velocity": 45.0,
        "unit_price": 145.0,
        "promotion_active": False,
        "days_ahead": 7
    }
    pred_resp = client.post("/api/v1/forecasts/predict-ml", json=pred_payload)
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert pred_data["status"] == "success"
    assert "predictions" in pred_data
    assert len(pred_data["predictions"]) == 7

def test_autonomous_action_execution():
    # Test triggering autonomous action
    auto_resp = client.post("/api/v1/copilot/autonomous-action", json={"action": "rebalance_inventory"})
    assert auto_resp.status_code == 200
    auto_data = auto_resp.json()
    assert auto_data["status"] == "success"
    assert "action" in auto_data


