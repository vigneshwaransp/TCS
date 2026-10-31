from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.forecasting import forecast_demand_horizon, get_historical_demand_series

router = APIRouter(prefix="/forecasts", tags=["Demand Forecasting"])

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
