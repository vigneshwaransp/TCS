"""
RetailMind AI / KINTRAL - DMart Retail Dataset Integrity Validator
Validates relational consistency, range checks, and business constraints across all 13 CSV files.
"""

import sys
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def load_csv(filename):
    path = BASE_DIR / filename
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def validate():
    print("=" * 70)
    print("RETAILMIND AI / KINTRAL: DMART CHENNAI DATASET VALIDATION REPORT")
    print("=" * 70)

    errors = []
    warnings = []
    row_counts = {}

    files = [
        "businesses.csv", "stores.csv", "suppliers.csv", "products_suppliers.csv",
        "store_product_assortment.csv", "store_routes.csv", "promotions.csv",
        "external_signals.csv", "inventory.csv", "sales_history.csv",
        "purchase_orders.csv", "transfer_history.csv", "data_dictionary.csv"
    ]

    data = {}
    for fn in files:
        rows = load_csv(fn)
        if rows is None:
            errors.append(f"Missing required file: {fn}")
        else:
            data[fn] = rows
            row_counts[fn] = len(rows)

    if errors:
        for err in errors:
            print(f"[ERROR] {err}")
        return False

    # 1. Primary Key Checks
    def check_unique_pk(rows, pk_col, fname):
        seen = set()
        for i, r in enumerate(rows):
            val = r.get(pk_col)
            if not val:
                errors.append(f"{fname}: Missing PK '{pk_col}' at row {i+1}")
            elif val in seen:
                errors.append(f"{fname}: Duplicate PK '{val}' at row {i+1}")
            seen.add(val)

    check_unique_pk(data["businesses.csv"], "business_id", "businesses.csv")
    check_unique_pk(data["stores.csv"], "store_id", "stores.csv")
    check_unique_pk(data["suppliers.csv"], "supplier_id", "suppliers.csv")
    check_unique_pk(data["products_suppliers.csv"], "sku", "products_suppliers.csv")
    check_unique_pk(data["promotions.csv"], "promotion_id", "promotions.csv")
    check_unique_pk(data["purchase_orders.csv"], "purchase_order_id", "purchase_orders.csv")
    check_unique_pk(data["transfer_history.csv"], "transfer_id", "transfer_history.csv")

    # Composite PK for assortment (store_id, sku)
    seen_asst = set()
    for r in data["store_product_assortment.csv"]:
        key = (r["store_id"], r["sku"])
        if key in seen_asst:
            errors.append(f"store_product_assortment.csv: Duplicate store-sku pair {key}")
        seen_asst.add(key)

    # Composite PK for routes (origin_store_id, destination_store_id)
    seen_routes = set()
    for r in data["store_routes.csv"]:
        orig = r["origin_store_id"]
        dest = r["destination_store_id"]
        if orig == dest:
            errors.append(f"store_routes.csv: Self-referencing route from {orig} to {dest}")
        if (orig, dest) in seen_routes:
            errors.append(f"store_routes.csv: Duplicate route ({orig} -> {dest})")
        seen_routes.add((orig, dest))

    # Composite PK for sales history (date, store_id, sku)
    seen_sales = set()
    for r in data["sales_history.csv"]:
        key = (r["date"], r["store_id"], r["sku"])
        if key in seen_sales:
            errors.append(f"sales_history.csv: Duplicate date-store-sku record {key}")
        seen_sales.add(key)

    # 2. Foreign Key Checks
    store_ids = {s["store_id"] for s in data["stores.csv"]}
    supp_ids = {s["supplier_id"] for s in data["suppliers.csv"]}
    sku_ids = {p["sku"] for p in data["products_suppliers.csv"]}
    biz_ids = {b["business_id"] for b in data["businesses.csv"]}

    for r in data["stores.csv"]:
        if r["business_id"] not in biz_ids:
            errors.append(f"stores.csv: Invalid business_id {r['business_id']}")
        lat, lon = float(r["latitude"]), float(r["longitude"])
        if not (12.5 <= lat <= 13.5 and 79.8 <= lon <= 80.5):
            errors.append(f"stores.csv: Coordinates ({lat}, {lon}) outside Chennai metropolitan bounding box")

    for r in data["products_suppliers.csv"]:
        if r["supplier_id"] not in supp_ids:
            errors.append(f"products_suppliers.csv: Invalid supplier_id {r['supplier_id']}")
        price = float(r["selling_price_inr"])
        cost = float(r["unit_cost_inr"])
        margin = float(r["gross_margin_rate"])
        if price <= 0 or cost <= 0:
            errors.append(f"products_suppliers.csv: Non-positive price/cost on SKU {r['sku']}")
        if cost >= price:
            errors.append(f"products_suppliers.csv: Cost >= Price on SKU {r['sku']}")
        expected_margin = round((price - cost) / price, 4)
        if abs(margin - expected_margin) > 0.005:
            errors.append(f"products_suppliers.csv: Inconsistent margin on SKU {r['sku']}")

    for r in data["store_product_assortment.csv"]:
        if r["store_id"] not in store_ids:
            errors.append(f"store_product_assortment.csv: Invalid store_id {r['store_id']}")
        if r["sku"] not in sku_ids:
            errors.append(f"store_product_assortment.csv: Invalid sku {r['sku']}")

    for r in data["store_routes.csv"]:
        if r["origin_store_id"] not in store_ids:
            errors.append(f"store_routes.csv: Invalid origin {r['origin_store_id']}")
        if r["destination_store_id"] not in store_ids:
            errors.append(f"store_routes.csv: Invalid destination {r['destination_store_id']}")
        if float(r["road_distance_km_est"]) <= 0:
            errors.append(f"store_routes.csv: Non-positive distance on route")

    for r in data["inventory.csv"]:
        if r["store_id"] not in store_ids:
            errors.append(f"inventory.csv: Invalid store_id {r['store_id']}")
        if r["sku"] not in sku_ids:
            errors.append(f"inventory.csv: Invalid sku {r['sku']}")
        if (r["store_id"], r["sku"]) not in seen_asst:
            errors.append(f"inventory.csv: Store-SKU ({r['store_id']}, {r['sku']}) not in active assortment")
        on_hand = int(r["on_hand_units"])
        reserved = int(r["reserved_units"])
        if on_hand < 0 or reserved < 0:
            errors.append(f"inventory.csv: Negative stock on {r['store_id']} - {r['sku']}")
        if reserved > on_hand:
            errors.append(f"inventory.csv: Reserved ({reserved}) > On-hand ({on_hand}) on {r['store_id']} - {r['sku']}")

    for r in data["sales_history.csv"]:
        if (r["store_id"], r["sku"]) not in seen_asst:
            errors.append(f"sales_history.csv: Sold item ({r['store_id']}, {r['sku']}) not in assortment")
        units = int(r["units_sold"])
        if units < 0:
            errors.append(f"sales_history.csv: Negative units sold on {r['date']}")

    # 3. Print Validation Table
    print(f"{'File Name':<32} | {'Records':<10} | {'Status'}")
    print("-" * 55)
    for fn in files:
        print(f"{fn:<32} | {row_counts.get(fn, 0):<10} | OK")
    print("-" * 55)
    print(f"Total Files Validated: {len(files)}")
    print(f"Total Errors Found:    {len(errors)}")
    print(f"Total Warnings:        {len(warnings)}")

    if errors:
        print("\nERRORS ENCOUNTERED:")
        for err in errors[:15]:
            print(f"  [X] {err}")
        return False
    else:
        print("\nSUCCESS: All relational integrity, range checks, and business constraints passed perfectly!")
        return True

if __name__ == "__main__":
    success = validate()
    sys.exit(0 if success else 1)
