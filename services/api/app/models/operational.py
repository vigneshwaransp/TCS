import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Index
from app.db.session import Base

class SalesRecord(Base):
    __tablename__ = "sales_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(32), nullable=False, index=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"))
    store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False, index=True)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False, index=True)
    units_sold = Column(Integer, nullable=False)
    price_inr = Column(Float, nullable=False)
    discount_pct = Column(Float, default=0.0)
    promotion_flag = Column(Boolean, default=False)
    promotion_id = Column(String(64), nullable=True)
    day_of_week = Column(String(16))
    is_weekend = Column(Boolean, default=False)
    day_of_month = Column(Integer)
    month = Column(Integer)
    quarter = Column(Integer)
    is_public_holiday = Column(Boolean, default=False)
    festival_name = Column(String(128), nullable=True)
    temperature_c = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    stock_available_at_start = Column(Integer, nullable=True)
    stockout_flag = Column(Boolean, default=False)
    data_quality_flag = Column(String(32), default="VALIDATED")
    data_provenance = Column(String(255))

    __table_args__ = (
        Index("ix_sales_date_store_sku", "date", "store_id", "sku"),
    )

class InventorySnapshot(Base):
    __tablename__ = "inventory_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(String(32), nullable=False, index=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"))
    store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False, index=True)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False, index=True)
    on_hand_units = Column(Integer, nullable=False)
    reserved_units = Column(Integer, default=0)
    confirmed_incoming_units = Column(Integer, default=0)
    safety_stock_units = Column(Integer, nullable=False)
    reorder_point_units = Column(Integer, nullable=False)
    target_stock_units = Column(Integer, nullable=False)
    nearest_batch_expiry_date = Column(String(32))
    expiry_in_days_of_nearest_batch = Column(Integer)
    storage_capacity_units_for_sku = Column(Integer)
    last_restock_date = Column(String(32))
    inventory_status = Column(String(64), default="HEALTHY")
    data_provenance = Column(String(255))

    __table_args__ = (
        Index("ix_inv_snapshot_store_sku", "snapshot_date", "store_id", "sku"),
    )

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    purchase_order_id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"))
    store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    supplier_id = Column(String(64), ForeignKey("suppliers.supplier_id"), nullable=False)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False)
    order_date = Column(String(32), nullable=False)
    expected_delivery_date = Column(String(32), nullable=False)
    actual_delivery_date = Column(String(32), nullable=True)
    ordered_units = Column(Integer, nullable=False)
    received_units = Column(Integer, default=0)
    unit_cost_inr = Column(Float, nullable=False)
    purchase_order_status = Column(String(64), default="PLACED")
    data_provenance = Column(String(255))

class StoreTransfer(Base):
    __tablename__ = "store_transfers"

    transfer_id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"))
    source_store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    destination_store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False)
    request_date = Column(String(32), nullable=False)
    dispatch_date = Column(String(32), nullable=True)
    arrival_date = Column(String(32), nullable=True)
    requested_units = Column(Integer, nullable=False)
    transferred_units = Column(Integer, default=0)
    transfer_cost_inr = Column(Float, nullable=False)
    estimated_travel_time_min = Column(Integer)
    actual_travel_time_min = Column(Integer, nullable=True)
    transfer_status = Column(String(64), default="PENDING")
    reason = Column(String(255))
    data_provenance = Column(String(255))

class ExternalSignal(Base):
    __tablename__ = "external_signals"

    date = Column(String(32), primary_key=True)
    city = Column(String(64), primary_key=True)
    temperature_c = Column(Float)
    rainfall_mm = Column(Float)
    humidity_pct = Column(Integer)
    is_public_holiday = Column(Boolean, default=False)
    festival_name = Column(String(128))
    local_event_flag = Column(Boolean, default=False)
    event_type = Column(String(64))
    signal_source = Column(String(255))
    data_provenance = Column(String(255))
