import datetime
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from app.db.session import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class AgentContextMemory(Base):
    """
    Persistent Context Memory for KINTRAL Agentic Architecture.
    Stores:
    - Working Memory: Current active session parameters, uploaded dataset schema, user focal filters.
    - Episodic Memory: Past recommendations, human approvals/overrides, rationale, and observed post-decision outcomes.
    - Policy Memory: Learned user preferences (e.g. threshold limits, safety stock bias, markdown conservatism).
    """
    __tablename__ = "agent_context_memories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(64), nullable=False, index=True)
    memory_type = Column(String(32), nullable=False, index=True) # working, episodic, policy, feedback
    agent_name = Column(String(64), nullable=False, index=True) # ProfilerAgent, RiskAgent, OptimizerAgent, SimulatorAgent, GovernanceAgent
    entity_scope = Column(String(128), nullable=True) # e.g. "STORE_001", "SKU_DM_0001", "DATASET_UPLOAD"
    key = Column(String(128), nullable=False)
    summary = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)
    importance_score = Column(Float, default=0.5) # 0.0 to 1.0
    created_at = Column(DateTime, default=get_utc_now)
