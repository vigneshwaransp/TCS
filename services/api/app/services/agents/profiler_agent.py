"""
KINTRAL Profiler Agent
Autonomous agent for generic tabular dataset ingestion and schema inference.
Analyzes ANY dataset: detects column roles, computes distribution statistics,
identifies anomalies, and flags visualization candidates.
"""

import re
import numpy as np
from typing import List, Dict, Any
from scipy import stats

class ProfilerAgent:
    name = "ProfilerAgent"
    role = "Data Profiling & Schema Inference"

    def __init__(self, memory_engine=None):
        self.memory = memory_engine

    def profile_dataset(self, data: List[Dict[str, Any]], dataset_name: str = "Uploaded Dataset") -> Dict[str, Any]:
        """
        Generic profiling function capable of analyzing ANY tabular dataset.
        """
        if not data:
            return {
                "dataset_name": dataset_name,
                "total_rows": 0,
                "total_columns": 0,
                "columns": {},
                "semantic_mapping": {},
                "insights": ["Dataset is empty."],
            }

        total_rows = len(data)
        column_keys = list(data[0].keys())
        columns_profile = {}
        semantic_mapping = {
            "date_columns": [],
            "identifier_columns": [],
            "demand_columns": [],
            "inventory_columns": [],
            "price_cost_columns": [],
            "categorical_columns": [],
        }

        # Regex patterns for semantic classification
        re_date = re.compile(r"(date|time|timestamp|day|month|year|dt)", re.I)
        re_id = re.compile(r"(id|code|sku|key|uuid|ref)", re.I)
        re_demand = re.compile(r"(sale|sales|demand|qty|quantity|units|sold|volume|orders)", re.I)
        re_inv = re.compile(r"(stock|inventory|on_hand|available|balance|reserve|warehouse)", re.I)
        re_price = re.compile(r"(price|mrp|cost|rate|amount|revenue|margin|discount|fee|inr|usd)", re.I)

        for col in column_keys:
            raw_values = [row.get(col) for row in data]
            non_null = [v for v in raw_values if v is not None and str(v).strip() != ""]
            null_count = total_rows - len(non_null)
            null_pct = round((null_count / total_rows) * 100, 2)
            unique_count = len(set(str(v) for v in non_null))

            # Detect data type
            numeric_vals = []
            is_numeric = False
            for v in non_null:
                try:
                    numeric_vals.append(float(v))
                except (ValueError, TypeError):
                    pass

            if len(numeric_vals) >= len(non_null) * 0.85 and len(numeric_vals) > 0:
                is_numeric = True

            col_info = {
                "name": col,
                "data_type": "numeric" if is_numeric else "text",
                "null_count": null_count,
                "null_percentage": null_pct,
                "unique_count": unique_count,
                "is_numeric": is_numeric,
                "sample_values": non_null[:5],
            }

            if is_numeric and len(numeric_vals) > 0:
                arr = np.array(numeric_vals)
                raw_mean = float(np.mean(arr))
                raw_median = float(np.median(arr))
                raw_std = float(np.std(arr))
                raw_min = float(np.min(arr))
                raw_max = float(np.max(arr))
                raw_skew = float(stats.skew(arr)) if len(arr) > 2 else 0.0

                def safe_float(val, ndigits=2):
                    if np.isnan(val) or np.isinf(val):
                        return 0.0
                    return round(float(val), ndigits)

                col_info["statistics"] = {
                    "mean": safe_float(raw_mean),
                    "median": safe_float(raw_median),
                    "std_dev": safe_float(raw_std),
                    "min": safe_float(raw_min),
                    "max": safe_float(raw_max),
                    "skewness": safe_float(raw_skew),
                }
                col_info["visualization_recommended"] = True
                col_info["suggested_chart"] = "histogram"
            else:
                col_info["visualization_recommended"] = unique_count <= 20
                col_info["suggested_chart"] = "bar" if unique_count <= 20 else "none"

            # Classify semantics
            if re_date.search(col):
                semantic_mapping["date_columns"].append(col)
            elif re_demand.search(col) and is_numeric:
                semantic_mapping["demand_columns"].append(col)
            elif re_inv.search(col) and is_numeric:
                semantic_mapping["inventory_columns"].append(col)
            elif re_price.search(col) and is_numeric:
                semantic_mapping["price_cost_columns"].append(col)
            elif re_id.search(col) or unique_count == total_rows:
                semantic_mapping["identifier_columns"].append(col)
            else:
                semantic_mapping["categorical_columns"].append(col)

            columns_profile[col] = col_info

        insights = [
            f"Successfully profiled '{dataset_name}' with {total_rows} rows and {len(column_keys)} attributes.",
            f"Detected {len(semantic_mapping['demand_columns'])} demand/sales column(s): {', '.join(semantic_mapping['demand_columns']) or 'None'}.",
            f"Detected {len(semantic_mapping['inventory_columns'])} inventory column(s): {', '.join(semantic_mapping['inventory_columns']) or 'None'}.",
            f"Detected {len(semantic_mapping['price_cost_columns'])} financial/price column(s): {', '.join(semantic_mapping['price_cost_columns']) or 'None'}.",
        ]

        result = {
            "dataset_name": dataset_name,
            "total_rows": total_rows,
            "total_columns": len(column_keys),
            "columns": columns_profile,
            "semantic_mapping": semantic_mapping,
            "insights": insights,
            "recommended_histogram_columns": [c for c, p in columns_profile.items() if p["is_numeric"]],
        }

        # Store to context memory if engine is attached
        if self.memory:
            self.memory.store_memory(
                session_id="agentic_run",
                memory_type="working",
                agent_name=self.name,
                key=f"PROFILED_{dataset_name.upper().replace(' ', '_')}",
                summary=f"Profiled {dataset_name}: {total_rows} rows, {len(column_keys)} columns",
                entity_scope=dataset_name,
                importance_score=0.85,
                content={
                    "total_rows": total_rows,
                    "columns_count": len(column_keys),
                    "semantic_mapping": semantic_mapping,
                }
            )

        return result
