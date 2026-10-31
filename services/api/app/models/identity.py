import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from app.db.session import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(64), primary_key=True)
    email = Column(String(128), unique=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False)
    organization_id = Column(String(64), default="ORG_DMART_IN", nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

class ManualUserEntry(Base):
    __tablename__ = "manual_user_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entry_id = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False, index=True)
    role = Column(String(64), nullable=False)
    department = Column(String(128), nullable=True)
    phone = Column(String(32), nullable=True)
    assigned_location = Column(String(128), nullable=True)
    access_tier = Column(String(32), default="OPERATOR")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String(64), primary_key=True)
    organization_id = Column(String(64), default="ORG_DMART_IN", nullable=False)
    user_id = Column(String(64), nullable=False)
    user_role = Column(String(32), nullable=False)
    action = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(128), nullable=False)
    details = Column(JSON, nullable=True)
    status = Column(String(32), default="SUCCESS")
    timestamp = Column(DateTime, default=get_utc_now)
