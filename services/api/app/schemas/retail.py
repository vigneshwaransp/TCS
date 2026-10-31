from typing import Optional, List
from pydantic import BaseModel

class StoreResponse(BaseModel):
    store_id: str
    store_name: str
    store_code: str
    locality: str
    city: str
    latitude: float
    longitude: float
    store_type: str
    storage_capacity_units: int
    is_active: bool

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    sku: str
    product_name: str
    brand: str
    category: str
    subcategory: str
    selling_price_inr: float
    unit_cost_inr: float
    gross_margin_rate: float
    shelf_life_days: int
    supplier_id: str
    is_active: bool

    class Config:
        from_attributes = True

class InventoryPositionResponse(BaseModel):
    store_id: str
    store_name: str
    sku: str
    product_name: str
    category: str
    on_hand_units: int
    reserved_units: int
    confirmed_incoming_units: int
    net_inventory_position: int # on_hand + confirmed_incoming - reserved
    safety_stock_units: int
    reorder_point_units: int
    target_stock_units: int
    days_of_supply: float
    inventory_status: str # IMMINENT_STOCKOUT, LOW_STOCK, HEALTHY, EXCESS_INVENTORY
    expiry_in_days: int

class KPISummaryResponse(BaseModel):
    active_stores: int
    active_skus: int
    total_inventory_value_inr: float
    products_at_stockout_risk: int
    excess_inventory_count: int
    pending_approvals: int
    expected_profit_exposure_inr: float
    supplier_delivery_risks: int
    transfer_opportunities_count: int
    demonstration_mode: bool = True
