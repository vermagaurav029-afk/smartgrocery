# routers/planner.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import Product, ProductPlatformPrice

router = APIRouter()

class PlannerRequest(BaseModel):
    family_size: int
    monthly_budget: float
    food_preference: str
    shopping_frequency: str

@router.post("/generate")
def generate_plan(req: PlannerRequest, db: Session = Depends(get_db)):
    size_multiplier = max(1, req.family_size / 2)

    base_list = [
        {"category": "Grains & Pulses", "items": ["Basmati Rice", "Toor Dal", "Whole Wheat Atta"]},
        {"category": "Dairy & Eggs",    "items": ["Full Cream Milk", "Curd", "Butter"]},
        {"category": "Vegetables",      "items": ["Onion", "Tomato", "Potato", "Spinach (Palak)"]},
        {"category": "Fruits",          "items": ["Banana", "Apple (Shimla)"]},
        {"category": "Oils & Ghee",     "items": ["Sunflower Oil"]},
        {"category": "Bakery",          "items": ["Britannia Bread"]},
        {"category": "Household",       "items": ["Surf Excel Matic", "Vim Dishwash Bar"]},
    ]

    if req.food_preference != "vegetarian":
        base_list[1]["items"].append("Eggs")

    products_db = db.query(Product).all()
    name_map = {p.name: p for p in products_db}
    result_items = []

    for group in base_list:
        for item_name in group["items"]:
            if item_name in name_map:
                p = name_map[item_name]
                prices = db.query(ProductPlatformPrice).filter(
                    ProductPlatformPrice.product_id == p.id,
                    ProductPlatformPrice.is_available == True,
                ).all()
                min_price = min((pr.selling_price for pr in prices), default=None)
                result_items.append({
                    "product_id": p.id,
                    "name": p.name,
                    "brand": p.brand,
                    "unit": p.unit,
                    "recommended_qty": max(1, round(size_multiplier)),
                    "min_price": min_price,
                    "category": group["category"],
                })

    total_estimate = sum((i["min_price"] or 0) * i["recommended_qty"] for i in result_items)

    return {
        "recommended_list": result_items,
        "estimated_total": round(total_estimate, 2),
        "budget": req.monthly_budget,
        "within_budget": total_estimate <= req.monthly_budget,
        "message": f"Recommended {len(result_items)} items for a family of {req.family_size}.",
    }
