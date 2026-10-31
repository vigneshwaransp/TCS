from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.services.forecasting import forecast_demand_horizon, get_historical_demand_series
from app.services.ml_training import run_ml_training_pipeline, predict_demand_ml, _MODEL_CACHE

router = APIRouter(prefix="/forecasts", tags=["Demand Forecasting & ML Training"])

class MLPredictRequest(BaseModel):
    store_id: str = "STORE_001"
    sku: str = "SKU_DM_0001"
    base_velocity: float = 25.0
    unit_price: float = 185.0
    promotion_active: bool = False
    days_ahead: int = 7

@router.get("")
def get_forecast(
    store_id: str = Query("STORE_001"),
    sku: str = Query("SKU_DM_0001"),
    horizon_days: int = Query(7),
    demand_multiplier: float = Query(1.0),
    promo_discount_pct: float = Query(0.0),
    db: Session = Depends(get_db)
):
    history = get_historical_demand_series(db, store_id, sku)
    forecast_data = forecast_demand_horizon(
        db, store_id, sku,
        horizon_days=horizon_days,
        demand_multiplier=demand_multiplier,
        promo_discount_pct=promo_discount_pct
    )
    return {
        "store_id": store_id,
        "sku": sku,
        "recent_history": history[-30:],
        **forecast_data
    }

@router.post("/train-models")
def train_ml_models(db: Session = Depends(get_db)):
    """
    Executes end-to-end LightGBM & XGBoost training pipeline on active Neon DB records.
    Evaluates both models, extracts feature importance, and crowns champion model.
    """
    try:
        results = run_ml_training_pipeline(db)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML training failed: {str(e)}")

@router.get("/model-status")
def get_model_status():
    """
    Returns the current Champion model status, LightGBM vs XGBoost benchmark metrics,
    and top predictive feature weights.
    """
    return {
        "status": "success",
        "champion_model": _MODEL_CACHE["champion_name"],
        "trained_at": _MODEL_CACHE["trained_at"],
        "models": _MODEL_CACHE["metrics"],
        "top_features": _MODEL_CACHE["feature_importance"],
    }

@router.post("/predict-ml")
def predict_with_ml(payload: MLPredictRequest):
    """
    Generates multi-day forecast trajectory using the active champion (LightGBM/XGBoost) model.
    """
    try:
        preds = predict_demand_ml(
            store_id=payload.store_id,
            sku=payload.sku,
            base_velocity=payload.base_velocity,
            unit_price=payload.unit_price,
            promotion_active=payload.promotion_active,
            days_ahead=payload.days_ahead
        )
        return {
            "status": "success",
            "champion_model": _MODEL_CACHE["champion_name"],
            "predictions": preds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction failed: {str(e)}")
