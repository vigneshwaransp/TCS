from fastapi import APIRouter
from app.services.policy_lab import get_policy_lab_comparison

router = APIRouter(prefix="/policies", tags=["Adaptive Retail Policy Lab"])

@router.get("/compare")
def compare_policies():
    return get_policy_lab_comparison()
