from enum import Enum
from typing import Optional
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

class Role(str, Enum):
    ADMIN = "ADMIN"
    OPS_MANAGER = "OPS_MANAGER"
    PLANNER = "PLANNER"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class Permission(str, Enum):
    DATA_IMPORT = "DATA_IMPORT"
    FORECAST_RUN = "FORECAST_RUN"
    SIMULATE = "SIMULATE"
    APPROVE_DECISION = "APPROVE_DECISION"
    EXECUTE_ACTION = "EXECUTE_ACTION"
    VIEW_AUDIT = "VIEW_AUDIT"
    CONFIGURE_POLICY = "CONFIGURE_POLICY"

ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.ADMIN: {
        Permission.DATA_IMPORT,
        Permission.FORECAST_RUN,
        Permission.SIMULATE,
        Permission.APPROVE_DECISION,
        Permission.EXECUTE_ACTION,
        Permission.VIEW_AUDIT,
        Permission.CONFIGURE_POLICY,
    },
    Role.OPS_MANAGER: {
        Permission.DATA_IMPORT,
        Permission.FORECAST_RUN,
        Permission.SIMULATE,
        Permission.APPROVE_DECISION,
        Permission.EXECUTE_ACTION,
        Permission.VIEW_AUDIT,
    },
    Role.PLANNER: {
        Permission.DATA_IMPORT,
        Permission.FORECAST_RUN,
        Permission.SIMULATE,
        Permission.VIEW_AUDIT,
    },
    Role.ANALYST: {
        Permission.FORECAST_RUN,
        Permission.SIMULATE,
        Permission.VIEW_AUDIT,
    },
    Role.VIEWER: set(),
}

class UserContext(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: Role
    organization_id: str = "ORG_DMART_IN"

DEMO_USERS: dict[str, UserContext] = {
    "admin": UserContext(
        user_id="USR_001",
        email="admin@kintral.retail",
        full_name="Radha Krishnan (VP Supply Chain)",
        role=Role.ADMIN,
    ),
    "ops": UserContext(
        user_id="USR_002",
        email="ops.manager@kintral.retail",
        full_name="Sundar Raman (Chennai Area Ops Manager)",
        role=Role.OPS_MANAGER,
    ),
    "planner": UserContext(
        user_id="USR_003",
        email="planner@kintral.retail",
        full_name="Meera Natarajan (Lead Inventory Planner)",
        role=Role.PLANNER,
    ),
    "analyst": UserContext(
        user_id="USR_004",
        email="analyst@kintral.retail",
        full_name="Karthik Venkatesh (Retail Data Scientist)",
        role=Role.ANALYST,
    ),
    "viewer": UserContext(
        user_id="USR_005",
        email="auditor@kintral.retail",
        full_name="Pooja Sharma (Internal Auditor)",
        role=Role.VIEWER,
    ),
}

def get_current_user(
    x_user_role: Optional[str] = Header(default="admin", alias="X-User-Role")
) -> UserContext:
    role_key = (x_user_role or "admin").lower()
    if role_key in DEMO_USERS:
        return DEMO_USERS[role_key]
    # Check by role enum name
    for user in DEMO_USERS.values():
        if user.role.value.lower() == role_key.lower():
            return user
    return DEMO_USERS["admin"]

def require_permission(permission: Permission):
    def dependency(user: UserContext = None):
        # We will retrieve current user in FastAPI dependency injection
        user_perms = ROLE_PERMISSIONS.get(user.role, set())
        if permission not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Action requires '{permission.value}', but role '{user.role.value}' does not grant it."
            )
        return user
    return dependency
