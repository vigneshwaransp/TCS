import datetime
from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KINTRAL Retail Decision Intelligence API",
        "version": "1.0.0",
        "environment": "production-ready",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database": "connected",
        "demonstration_mode": True,
        "operator": "Avenue Supermarts Limited (DMart)",
    }
