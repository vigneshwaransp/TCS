"""
KINTRAL Context Memory Engine
Provides dual-tier memory for the autonomous agents:
1. Working Memory: Transient active session context, filters, and current data schemas.
2. Episodic Memory: Persistent historical episodes in Neon PostgreSQL (past decisions, approvals, human overrides, post-decision observed outcomes).
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.agent import AgentContextMemory

class ContextMemoryEngine:
    def __init__(self, db: Session):
        self.db = db

    def store_memory(
        self,
        session_id: str,
        memory_type: str,
        agent_name: str,
        key: str,
        content: Dict[str, Any],
        summary: Optional[str] = None,
        entity_scope: Optional[str] = None,
        importance_score: float = 0.5,
    ) -> AgentContextMemory:
        """Persist a memory unit to Neon DB."""
        memory = AgentContextMemory(
            session_id=session_id,
            memory_type=memory_type,
            agent_name=agent_name,
            key=key,
            summary=summary or key,
            content=content,
            entity_scope=entity_scope,
            importance_score=importance_score,
        )
        self.db.add(memory)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def recall_memories(
        self,
        memory_type: Optional[str] = None,
        entity_scope: Optional[str] = None,
        agent_name: Optional[str] = None,
        limit: int = 15,
    ) -> List[Dict[str, Any]]:
        """Recall relevant memories from Neon DB ordered by importance and recency."""
        query = self.db.query(AgentContextMemory)
        if memory_type:
            query = query.filter(AgentContextMemory.memory_type == memory_type)
        if entity_scope:
            query = query.filter(AgentContextMemory.entity_scope == entity_scope)
        if agent_name:
            query = query.filter(AgentContextMemory.agent_name == agent_name)

        memories = query.order_by(
            AgentContextMemory.importance_score.desc(),
            AgentContextMemory.created_at.desc()
        ).limit(limit).all()

        return [
            {
                "id": m.id,
                "session_id": m.session_id,
                "memory_type": m.memory_type,
                "agent_name": m.agent_name,
                "entity_scope": m.entity_scope,
                "key": m.key,
                "summary": m.summary,
                "content": m.content,
                "importance_score": m.importance_score,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in memories
        ]

    def seed_initial_episodic_memories(self):
        """Seed foundational episodic and policy memories if empty."""
        count = self.db.query(AgentContextMemory).count()
        if count > 0:
            return

        seeds = [
            {
                "session_id": "seed_session_01",
                "memory_type": "episodic",
                "agent_name": "GovernanceAgent",
                "entity_scope": "STORE_002",
                "key": "APPROVAL_EXPEDITE_PO_TAMBARAM",
                "summary": "Radha Krishnan approved Expedited PO for Dairy SKU at Tambaram store.",
                "importance_score": 0.95,
                "content": {
                    "decision": "APPROVED",
                    "approver": "Radha Krishnan (VP Operations)",
                    "store_id": "STORE_002",
                    "sku": "SKU_DM_0001",
                    "action": "SUPPLIER_REPLENISHMENT_EXPEDITE",
                    "reason": "Days of supply dropped to 1.8 days during weekend wedding festival spike. Standard lead time 48h was insufficient.",
                    "observed_outcome": "Prevented ₹1.84L stockout; fulfillment reached 98.6%.",
                }
            },
            {
                "session_id": "seed_session_01",
                "memory_type": "episodic",
                "agent_name": "RiskAgent",
                "entity_scope": "STORE_003",
                "key": "OVERRIDE_STORE_TRANSFER_VELACHERY",
                "summary": "Sundar Raman rejected store transfer from Velachery due to monsoon logistics corridor disruption.",
                "importance_score": 0.90,
                "content": {
                    "decision": "OVERRIDDEN",
                    "approver": "Sundar Raman (Ops Manager)",
                    "source_store": "STORE_003",
                    "target_store": "STORE_005",
                    "action": "INTER_STORE_TRANSFER",
                    "reason": "Inner Ring Road experienced heavy water-logging, extending transit from 35 mins to 4.5 hours.",
                    "learned_rule": "Incorporate real-time weather and traffic alerts into transfer feasibility gate.",
                }
            },
            {
                "session_id": "seed_session_01",
                "memory_type": "policy",
                "agent_name": "OptimizerAgent",
                "entity_scope": "CATEGORY_GROCERY_STAPLES",
                "key": "POLICY_MARKDOWN_CEILING",
                "summary": "Meera Natarajan instituted 15% markdown ceiling for staple grains to preserve gross margin.",
                "importance_score": 0.85,
                "content": {
                    "policy_rule": "MAX_DISCOUNT_PERCENT = 15%",
                    "author": "Meera Natarajan (Planner)",
                    "rationale": "Staples have inelastic demand; discounts over 15% erode profit without proportionate volume lift.",
                }
            },
            {
                "session_id": "seed_session_01",
                "memory_type": "working",
                "agent_name": "ProfilerAgent",
                "entity_scope": "GENERIC_DATASET_SPEC",
                "key": "SCHEMA_INFERENCE_RULES",
                "summary": "Generic Column Semantics & Distribution Heuristics",
                "importance_score": 0.80,
                "content": {
                    "demand_regex": "(sale|demand|qty|units|volume|sold)",
                    "inventory_regex": "(stock|inventory|on_hand|available|balance)",
                    "price_regex": "(price|mrp|cost|rate|amount|revenue)",
                    "identifier_regex": "(id|code|sku|store|location|item)",
                    "distribution_expectation": "Demand columns follow Gamma / Negative Binomial distribution with right skew.",
                }
            },
            {
                "session_id": "seed_session_01",
                "memory_type": "episodic",
                "agent_name": "SimulatorAgent",
                "entity_scope": "STORE_001",
                "key": "POST_DECISION_OUTCOME_ALANDUR",
                "summary": "Observed post-decision outcome for Alandur Hub replenishment.",
                "importance_score": 0.88,
                "content": {
                    "cycle": "October 2026",
                    "store_id": "STORE_001",
                    "forecast_accuracy_mape": 6.8,
                    "stockout_reduction_pct": 82.4,
                    "capital_efficiency_gain": "₹4.35 Lakhs freed from slow-moving inventory.",
                }
            }
        ]

        for s in seeds:
            self.store_memory(
                session_id=s["session_id"],
                memory_type=s["memory_type"],
                agent_name=s["agent_name"],
                key=s["key"],
                summary=s["summary"],
                content=s["content"],
                entity_scope=s["entity_scope"],
                importance_score=s["importance_score"],
            )
