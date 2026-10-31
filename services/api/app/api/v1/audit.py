from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.identity import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["Governance & Audit Logs"])

@router.get("")
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "log_id": l.log_id,
            "organization_id": l.organization_id,
            "user_id": l.user_id,
            "user_role": l.user_role,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "status": l.status,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        }
        for l in logs
    ]
