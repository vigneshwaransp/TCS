from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class GraphNode(BaseModel):
    id: str
    type: str # storeNode, problemNode, actionNode, supplierNode, outcomeNode
    label: str
    subtitle: Optional[str] = None
    status: str # critical, warning, success, neutral
    data: Dict[str, Any]
    position: Dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    relationship_type: str # KNOWN_BUSINESS_RULE, MODEL_ESTIMATED, HYPOTHETICAL_SCENARIO
    animated: bool = False
    style: Optional[Dict[str, Any]] = None

class ImpactMatrixRow(BaseModel):
    entity: str
    entity_type: str
    baseline_condition: str
    proposed_change: str
    expected_benefit: str
    potential_risk: str
    estimated_cost_inr: float
    evidence_status: str

class RippleIntelligenceResponse(BaseModel):
    recommendation_id: str
    network_summary: Dict[str, Any]
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    impact_matrix: List[ImpactMatrixRow]
    downstream_risks_detected: List[str]
