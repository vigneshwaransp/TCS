import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Business(Base):
    __tablename__ = "businesses"

    business_id = Column(String(64), primary_key=True)
    business_name = Column(String(128), nullable=False)
    legal_entity_name = Column(String(255), nullable=False)
    business_type = Column(String(128))
    headquarters_address = Column(String(255))
    headquarters_city = Column(String(64))
    headquarters_state = Column(String(64))
    country = Column(String(64), default="India")
    transfer_policy = Column(String(64), default="INTRA_CHAIN_PERMITTED")
    is_active = Column(Boolean, default=True)
    data_source = Column(String(128))
    verification_status = Column(String(64))

class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"), nullable=False)
    store_name = Column(String(128), nullable=False)
    store_code = Column(String(64), unique=True)
    address = Column(String(255))
    locality = Column(String(64))
    city = Column(String(64), default="Chennai")
    district = Column(String(64))
    state = Column(String(64), default="Tamil Nadu")
    postal_code = Column(String(16))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    opening_time = Column(String(16), default="08:00:00")
    closing_time = Column(String(16), default="22:00:00")
    store_type = Column(String(64))
    storage_capacity_units = Column(Integer, default=70000)
    is_active = Column(Boolean, default=True)
    location_source_url = Column(String(255))
    verification_status = Column(String(64))
    verification_date = Column(String(32))
    data_provenance = Column(String(255))

class Supplier(Base):
    __tablename__ = "suppliers"

    supplier_id = Column(String(64), primary_key=True)
    supplier_name = Column(String(128), nullable=False)
    supplier_city = Column(String(64))
    supplier_state = Column(String(64))
    supplier_lead_time_days = Column(Integer, default=4)
    supplier_reliability_rate = Column(Float, default=0.95)
    minimum_order_value_inr = Column(Float, default=25000.0)
    minimum_order_quantity = Column(Integer, default=50)
    delivery_cost_inr = Column(Float, default=1200.0)
    delivery_cost_per_km_inr = Column(Float, default=18.0)
    is_active = Column(Boolean, default=True)
    data_provenance = Column(String(255))

class Product(Base):
    __tablename__ = "products"

    sku = Column(String(64), primary_key=True)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(128))
    category = Column(String(128), nullable=False)
    subcategory = Column(String(128))
    product_description = Column(Text)
    unit_of_measure = Column(String(32), default="UNIT")
    pack_size = Column(Float, default=1.0)
    pack_size_units = Column(String(32), default="UNIT")
    selling_price_inr = Column(Float, nullable=False)
    unit_cost_inr = Column(Float, nullable=False)
    gross_margin_rate = Column(Float, nullable=False)
    shelf_life_days = Column(Integer, default=365)
    perishability_class = Column(String(32), default="LOW")
    storage_requirement = Column(String(32), default="AMBIENT")
    minimum_order_quantity = Column(Integer, default=25)
    reorder_pack_multiple = Column(Integer, default=10)
    supplier_id = Column(String(64), ForeignKey("suppliers.supplier_id"))
    supplier_lead_time_days = Column(Integer, default=4)
    supplier_reliability_rate = Column(Float, default=0.95)
    demand_volatility_class = Column(String(32), default="MEDIUM")
    is_seasonal = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    data_provenance = Column(String(255))

class StoreProductAssortment(Base):
    __tablename__ = "store_product_assortment"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    sku = Column(String(64), ForeignKey("products.sku"), nullable=False)
    assortment_status = Column(String(32), default="ACTIVE")
    assortment_start_date = Column(String(32))
    assortment_end_date = Column(String(32))
    minimum_display_stock = Column(Integer, default=10)
    maximum_display_stock = Column(Integer, default=100)
    storage_capacity_units_for_sku = Column(Integer, default=300)
    store_specific_demand_factor = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)

class StoreRoute(Base):
    __tablename__ = "store_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    origin_store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    destination_store_id = Column(String(64), ForeignKey("stores.store_id"), nullable=False)
    road_distance_km_est = Column(Float, nullable=False)
    estimated_travel_time_min = Column(Integer, nullable=False)
    fixed_dispatch_cost_inr = Column(Float, default=450.0)
    cost_per_km_inr = Column(Float, default=22.0)
    estimated_route_cost_inr = Column(Float, nullable=False)
    route_available = Column(Boolean, default=True)
    vehicle_type = Column(String(64), default="Tata Ace LCV")
    estimated_vehicle_capacity_units = Column(Integer, default=1500)
    traffic_level_assumption = Column(String(64))
    route_source = Column(String(255))
    verification_status = Column(String(64))
    data_provenance = Column(String(255))

class Promotion(Base):
    __tablename__ = "promotions"

    promotion_id = Column(String(64), primary_key=True)
    business_id = Column(String(64), ForeignKey("businesses.business_id"))
    store_id = Column(String(64), ForeignKey("stores.store_id"))
    sku = Column(String(64), ForeignKey("products.sku"))
    promotion_name = Column(String(255), nullable=False)
    promotion_type = Column(String(64), default="PERCENT_DISCOUNT")
    start_date = Column(String(32), nullable=False)
    end_date = Column(String(32), nullable=False)
    discount_pct = Column(Float, default=0.0)
    promotion_budget_inr = Column(Float, default=10000.0)
    planned_flag = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    data_provenance = Column(String(255))
