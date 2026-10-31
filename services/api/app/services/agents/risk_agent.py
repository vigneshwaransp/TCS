"""
KINTRAL Risk Detection Agent
Autonomous risk agent evaluating operational, stockout, lead-time, and capital exposure.
Consults episodic memory for past disruptions and threshold overrides.
"""

from typing import List, Dict, Any

class RiskDetectionAgent:
    name = "RiskDetectionAgent"
    role = "Operational Risk & Anomaly Detection"

    def __init__(self, memory_engine=None):
        self.memory = memory_engine

    def detect_risks(
        self,
        inventory_items: List[Dict[str, Any]],
        episodic_context: List[Dict[str, Any]] | None = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluates risk exposure across inventory items or generic records.
        """
        risks = []
        
        # Check historical memories for known context
        known_disruptions = set()
        if episodic_context:
            for mem in episodic_context:
                if "monsoon" in str(mem.get("content", "")).lower():
                    known_disruptions.add(mem.get("entity_scope"))

        for item in inventory_items:
            store_id = item.get("store_id", "GLOBAL")
            sku = item.get("sku", "UNKNOWN_SKU")
            on_hand = float(item.get("on_hand_units", item.get("stock", 100)))
            safety_stock = float(item.get("safety_stock_units", item.get("safety_stock", 50)))
            reorder_point = float(item.get("reorder_point_units", item.get("reorder_point", 80)))
            daily_demand = float(item.get("avg_daily_demand", 12.0))
            days_of_supply = on_hand / max(daily_demand, 0.1)

            # 1. Critical Stockout Risk
            if days_of_supply < 3.0 or on_hand < safety_stock * 0.5:
                urgency = "CRITICAL" if days_of_supply < 2.0 else "HIGH"
                risks.append({
                    "risk_id": f"RISK_STOCKOUT_{store_id}_{sku}",
                    "risk_type": "STOCKOUT_EXPOSURE",
                    "store_id": store_id,
                    "sku": sku,
                    "urgency": urgency,
                    "days_of_supply": round(days_of_supply, 1),
                    "on_hand": on_hand,
                    "safety_stock": safety_stock,
                    "projected_lost_sales_units": max(0, int((safety_stock - on_hand) * 1.5)),
                    "estimated_revenue_at_risk_inr": round(max(0, (safety_stock - on_hand) * 280), 2),
                    "description": f"Stockout imminent in {days_of_supply:.1f} days at {store_id}. Inventory ({on_hand:.0f}) breached safety buffer ({safety_stock:.0f}).",
                    "episodic_flag": "High priority: Matches historical disruption pattern" if store_id in known_disruptions else None
                })
            # 2. Overstock / Capital Lock Risk
            elif days_of_supply > 45.0:
                risks.append({
                    "risk_id": f"RISK_OVERSTOCK_{store_id}_{sku}",
                    "risk_type": "CAPITAL_LOCKUP",
                    "store_id": store_id,
                    "sku": sku,
                    "urgency": "MEDIUM",
                    "days_of_supply": round(days_of_supply, 1),
                    "on_hand": on_hand,
                    "excess_units": int(on_hand - (daily_demand * 25)),
                    "estimated_carrying_cost_inr": round((on_hand - (daily_demand * 25)) * 14.5, 2),
                    "description": f"Excess inventory ({days_of_supply:.1f} days) ties up working capital at {store_id}."
                })

        # Store detected risks to working memory
        if self.memory:
            self.memory.store_memory(
                session_id="agentic_run",
                memory_type="working",
                agent_name=self.name,
                key="ACTIVE_RISKS_SUMMARY",
                summary=f"Detected {len(risks)} operational risks ({sum(1 for r in risks if r['urgency'] == 'CRITICAL')} critical)",
                importance_score=0.90,
                content={"total_risks": len(risks), "top_risks": risks[:5]}
            )

        return risks
