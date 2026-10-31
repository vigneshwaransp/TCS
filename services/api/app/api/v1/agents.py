from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.db.session import get_db
from app.services.agents.orchestrator import AgenticOrchestrator
from app.services.agents.memory_engine import ContextMemoryEngine
from app.services.agents.profiler_agent import ProfilerAgent

router = APIRouter()

class RunPipelineRequest(BaseModel):
    dataset_name: Optional[str] = "DMart Chennai Active Network"
    custom_data: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None

class FeedbackMemoryRequest(BaseModel):
    session_id: str
    memory_type: str = "feedback"
    agent_name: str = "GovernanceAgent"
    key: str
    summary: str
    content: Dict[str, Any]
    entity_scope: Optional[str] = None
    importance_score: Optional[float] = 0.9

class ProfileDatasetRequest(BaseModel):
    dataset_name: str = "Uploaded Dataset"
    data: List[Dict[str, Any]]

@router.post("/run")
def run_agentic_pipeline(payload: RunPipelineRequest, db: Session = Depends(get_db)):
    """
    Executes the autonomous multi-agent pipeline:
    ProfilerAgent -> RiskDetectionAgent -> OptimizationAgent -> SimulationAgent -> GovernanceAgent
    Grounded by dual-tier Context Memory (Working + Episodic in Neon PostgreSQL).
    """
    try:
        orchestrator = AgenticOrchestrator(db)
        result = orchestrator.run_pipeline(
            custom_data=payload.custom_data,
            dataset_name=payload.dataset_name or "DMart Chennai Active Network",
            session_id=payload.session_id,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent pipeline execution error: {str(e)}")

@router.get("/memory")
def get_context_memories(
    memory_type: Optional[str] = None,
    entity_scope: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Retrieves Working, Episodic, and Policy Memories stored in Neon PostgreSQL.
    """
    try:
        engine = ContextMemoryEngine(db)
        engine.seed_initial_episodic_memories()
        memories = engine.recall_memories(
            memory_type=memory_type,
            entity_scope=entity_scope,
            limit=limit,
        )
        return {"status": "success", "count": len(memories), "memories": memories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context memory retrieval error: {str(e)}")

@router.post("/memory/feedback")
def record_decision_feedback(payload: FeedbackMemoryRequest, db: Session = Depends(get_db)):
    """
    Records human decision feedback, approvals, and overrides into persistent Episodic Memory in Neon PostgreSQL.
    """
    try:
        engine = ContextMemoryEngine(db)
        created = engine.store_memory(
            session_id=payload.session_id,
            memory_type=payload.memory_type,
            agent_name=payload.agent_name,
            key=payload.key,
            summary=payload.summary,
            content=payload.content,
            entity_scope=payload.entity_scope,
            importance_score=payload.importance_score or 0.9,
        )
        return {"status": "success", "memory_id": created.id, "summary": created.summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record episodic memory: {str(e)}")

@router.post("/profile")
def profile_generic_dataset(payload: ProfileDatasetRequest, db: Session = Depends(get_db)):
    """
    Generic Profiler Agent endpoint: Ingests ANY tabular dataset, infers column semantics,
    and returns distribution moments and visualization candidates.
    """
    try:
        memory = ContextMemoryEngine(db)
        agent = ProfilerAgent(memory)
        profile = agent.profile_dataset(payload.data, dataset_name=payload.dataset_name)
        return {"status": "success", "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profiling error: {str(e)}")
