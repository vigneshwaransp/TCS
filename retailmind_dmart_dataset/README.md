# RetailMind AI / KINTRAL - DMart Retail Dataset Package
## Avenue Supermarts Limited (DMart) - Chennai Pilot Network

### 1. Overview & Provenance
This dataset package provides an end-to-end relational schema and calibrated synthetic operational data for **Avenue Supermarts Limited (DMart)** across 5 verified physical branches in Chennai, Tamil Nadu, India.

- **Operator Identity:** Avenue Supermarts Limited (DMart), Powai, Mumbai.
- **Physical Locations:** Verified real store branches in Chennai (Velachery, Chromepet, Virugambakkam, Madipakkam, Kolathur). Coordinates and street addresses verified against official public store locators.
- **Data Integrity:** All operational sales transactions, inventory positions, purchase orders, and transfer histories are **calibrated synthetic data** created for decision intelligence prototyping and supply chain optimization. It does not represent DMart's confidential internal financial ledgers.
- **Road Logistics:** Inter-store distances and transit times are derived from verified branch coordinates combined with a calibrated 1.35x Chennai urban circuity factor and arterial transit speeds.

### 2. Files in this Package
1. `businesses.csv`: Corporate entity profile & transfer policy.
2. `stores.csv`: 5 verified physical DMart branches with coordinates and storage capacity.
3. `products_suppliers.csv`: Full retail supermarket SKU catalogue across 16 categories.
4. `store_product_assortment.csv`: Store-SKU availability, display limits, and store demand factors.
5. `sales_history.csv`: 365-day daily sales history with promotions, holidays, weather, and stockout flags.
6. `inventory.csv`: Current physical inventory snapshot with on-hand, reserved, safety stock, and expiry.
7. `store_routes.csv`: 20 directed inter-store transit routes with travel times and vehicle dispatch costs.
8. `promotions.csv`: Active and planned promotional campaigns with discount depths and budgets.
9. `suppliers.csv`: Regional FMCG suppliers with lead times, reliability, and MOQs.
10. `purchase_orders.csv`: Procurement order history and in-transit supplier deliveries.
11. `transfer_history.csv`: Historical inter-store stock transfers with timestamps and status.
12. `external_signals.csv`: Daily Chennai weather (temp, rainfall, humidity) and Indian festival calendar.
13. `data_dictionary.csv`: Full attribute specification, data types, and validation rules.
14. `generate_dataset.py`: Reproducible generator script.
15. `validate_dataset.py`: Comprehensive relational integrity and business rule validator.
16. `requirements.txt`: Python package dependencies.
17. `README.md`: Dataset documentation and quickstart instructions.

### 3. Running Validation
```bash
python validate_dataset.py
```
