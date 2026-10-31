from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.services.ingestion import validate_and_parse_csv

router = APIRouter(prefix="/data", tags=["Data Ingestion & Quality"])

@router.post("/validate-upload")
async def upload_and_validate(
    dataset_type: str = Form("inventory"),
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for ingestion.")

    content = await file.read()
    decoded = content.decode("utf-8", errors="replace")

    res = validate_and_parse_csv(decoded, dataset_type=dataset_type)
    return res

@router.get("/template/{dataset_type}")
def get_csv_template(dataset_type: str):
    templates = {
        "inventory": "store_id,sku,on_hand_units,reserved_units,confirmed_incoming_units,safety_stock_units,reorder_point_units\nSTORE_001,SKU_DM_0001,45,5,0,20,52\nSTORE_002,SKU_DM_0001,150,10,30,30,70\n",
        "sales": "date,store_id,sku,units_sold,price_inr\n2026-10-30,STORE_001,SKU_DM_0001,24,125.00\n",
        "products": "sku,product_name,category,selling_price_inr,unit_cost_inr\nSKU_DM_0001,DMart Premia Basmati Rice 1KG,Staples,125.00,102.50\n",
    }
    content = templates.get(dataset_type, templates["inventory"])
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={dataset_type}_template.csv"}
    )
