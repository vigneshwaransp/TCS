import io
import csv
from typing import Dict, Any, List

CANONICAL_SCHEMAS = {
    "inventory": {
        "required_columns": ["store_id", "sku", "on_hand_units", "safety_stock_units", "reorder_point_units"],
        "numeric_columns": ["on_hand_units", "safety_stock_units", "reorder_point_units", "reserved_units"],
    },
    "sales": {
        "required_columns": ["date", "store_id", "sku", "units_sold", "price_inr"],
        "numeric_columns": ["units_sold", "price_inr"],
    },
    "products": {
        "required_columns": ["sku", "product_name", "category", "selling_price_inr", "unit_cost_inr"],
        "numeric_columns": ["selling_price_inr", "unit_cost_inr"],
    },
}

def validate_and_parse_csv(file_content: str, dataset_type: str = "inventory") -> Dict[str, Any]:
    schema = CANONICAL_SCHEMAS.get(dataset_type, CANONICAL_SCHEMAS["inventory"])
    reader = csv.DictReader(io.StringIO(file_content))
    
    headers = reader.fieldnames or []
    missing_required = [col for col in schema["required_columns"] if col not in headers]

    if missing_required:
        return {
            "status": "FAILED",
            "message": f"Missing required canonical columns: {', '.join(missing_required)}",
            "total_rows": 0,
            "valid_rows_count": 0,
            "failed_rows_count": 0,
            "errors": [f"Missing required header: {col}" for col in missing_required],
            "failed_rows_csv": "",
        }

    valid_rows = []
    failed_rows = []
    errors = []

    for row_idx, row in enumerate(reader):
        row_num = row_idx + 1
        row_errors = []

        # Check required fields not empty
        for col in schema["required_columns"]:
            val = row.get(col, "").strip()
            if not val:
                row_errors.append(f"Row {row_num}: Missing required field '{col}'")

        # Check numeric fields
        for col in schema["numeric_columns"]:
            if col in row and row[col].strip():
                try:
                    num = float(row[col])
                    if num < 0:
                        row_errors.append(f"Row {row_num}: Column '{col}' cannot be negative (found {num})")
                except ValueError:
                    row_errors.append(f"Row {row_num}: Column '{col}' must be numeric (found '{row[col]}')")

        if row_errors:
            failed_rows.append({"row_number": row_num, "data": row, "errors": row_errors})
            errors.extend(row_errors)
        else:
            valid_rows.append(row)

    # Generate failed rows CSV for download
    failed_csv_buffer = io.StringIO()
    if failed_rows:
        writer = csv.writer(failed_csv_buffer)
        failed_headers = headers + ["validation_errors"]
        writer.writerow(failed_headers)
        for fr in failed_rows:
            row_data = [fr["data"].get(h, "") for h in headers] + ["; ".join(fr["errors"])]
            writer.writerow(row_data)

    return {
        "status": "SUCCESS" if len(failed_rows) == 0 else "PARTIAL_SUCCESS",
        "dataset_type": dataset_type,
        "total_rows": len(valid_rows) + len(failed_rows),
        "valid_rows_count": len(valid_rows),
        "failed_rows_count": len(failed_rows),
        "errors": errors[:25],
        "failed_rows_csv": failed_csv_buffer.getvalue(),
        "preview": valid_rows[:5],
    }
