from fastapi import APIRouter, Depends, Header
from app.core.security import get_current_user, UserContext, DEMO_USERS, ROLE_PERMISSIONS

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.get("/me")
def get_me(current_user: UserContext = Depends(get_current_user)):
    perms = [p.value for p in ROLE_PERMISSIONS.get(current_user.role, set())]
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "organization_id": current_user.organization_id,
        "permissions": perms,
        "available_demo_users": [
            {
                "key": k,
                "role": u.role.value,
                "full_name": u.full_name,
                "email": u.email,
            }
            for k, u in DEMO_USERS.items()
        ]
    }
