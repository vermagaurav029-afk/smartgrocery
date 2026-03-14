# routers/all_routers.py — All API Routes (split into separate files in production)

# ════════════════════════════════════════════
# routers/auth.py
# ════════════════════════════════════════════
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models.models import User, UserSavings
from utils.auth import (
    verify_password, get_password_hash,
    create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from pydantic import BaseModel, EmailStr

router_auth = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router_auth.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
    )
    db.add(user)
    db.flush()
    db.add(UserSavings(user_id=user.id))
    db.commit()
    return {"message": "Account created successfully"}

@router_auth.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@router_auth.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }


# ════════════════════════════════════════════
# routers/products.py
# ════════════════════════════════════════════
from fastapi import APIRouter, Query
from models.models import Product, Category, ProductPlatformPrice

router_products = APIRouter()

@router_products.get("/")
def search_products(
    q: str = Query(None),
    category: str = Query(None),
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active == True)
    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for p in products:
        prices = db.query(ProductPlatformPrice).filter(
            ProductPlatformPrice.product_id == p.id,
            ProductPlatformPrice.is_available == True,
        ).all()
        min_price = min((pr.selling_price for pr in prices), default=None)
        results.append({
            "id": p.id, "name": p.name, "brand": p.brand,
            "unit": p.unit, "image_url": p.image_url,
            "category": p.category.name if p.category else None,
            "min_price": min_price,
            "platforms_available": len(prices),
        })
    return {"total": total, "page": page, "results": results}

@router_products.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon} for c in cats]

@router_products.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    from services.comparison import get_product_price_comparison
    return get_product_price_comparison(product_id, db)

@router_products.get("/autocomplete")
def autocomplete(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.name.ilike(f"%{q}%")).limit(8).all()
    return [{"id": p.id, "name": p.name, "brand": p.brand, "unit": p.unit} for p in products]


# ════════════════════════════════════════════
# routers/cart.py
# ════════════════════════════════════════════
router_cart = APIRouter()
from models.models import Cart, CartItem

class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = 1

@router_cart.get("/")
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if not cart:
        cart = Cart(user_id=current_user.id, name="My Cart")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    items = []
    for ci in cart.items:
        items.append({
            "id": ci.id, "product_id": ci.product_id,
            "quantity": ci.quantity,
            "product": {"name": ci.product.name, "brand": ci.product.brand,
                        "unit": ci.product.unit, "image_url": ci.product.image_url},
        })
    return {"cart_id": cart.id, "name": cart.name, "items": items, "item_count": len(items)}

@router_cart.post("/add")
def add_to_cart(req: CartItemRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.flush()
    existing = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == req.product_id).first()
    if existing:
        existing.quantity += req.quantity
    else:
        db.add(CartItem(cart_id=cart.id, product_id=req.product_id, quantity=req.quantity))
    db.commit()
    return {"message": "Added to cart"}

@router_cart.put("/item/{item_id}")
def update_quantity(item_id: int, qty: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")
    if qty <= 0:
        db.delete(item)
    else:
        item.quantity = qty
    db.commit()
    return {"message": "Updated"}

@router_cart.delete("/item/{item_id}")
def remove_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Removed"}

@router_cart.delete("/clear")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared"}


# ════════════════════════════════════════════
# routers/comparison.py
# ════════════════════════════════════════════
router_comparison = APIRouter()

@router_comparison.get("/cart")
def compare_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if not cart or not cart.items:
        raise HTTPException(400, "Cart is empty")
    from services.comparison import compare_cart as do_compare
    return do_compare(cart.items, db)

@router_comparison.post("/guest")
def compare_guest(items: list, db: Session = Depends(get_db)):
    """Compare a list of {product_id, quantity} without auth."""
    cart_items = []
    for it in items:
        ci = CartItem(product_id=it["product_id"], quantity=it["quantity"])
        ci.product = db.query(Product).filter(Product.id == it["product_id"]).first()
        if ci.product:
            cart_items.append(ci)
    from services.comparison import compare_cart as do_compare
    return do_compare(cart_items, db)


# ════════════════════════════════════════════
# routers/alerts.py
# ════════════════════════════════════════════
router_alerts = APIRouter()
from models.models import PriceAlert, Notification

class AlertRequest(BaseModel):
    product_id: int
    target_price: float

@router_alerts.get("/")
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(PriceAlert).filter(PriceAlert.user_id == current_user.id).all()
    return [{"id": a.id, "product_id": a.product_id,
             "product_name": a.product.name,
             "target_price": a.target_price, "is_active": a.is_active,
             "triggered": a.triggered} for a in alerts]

@router_alerts.post("/")
def create_alert(req: AlertRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = PriceAlert(user_id=current_user.id, product_id=req.product_id, target_price=req.target_price)
    db.add(alert)
    db.commit()
    return {"message": "Alert created"}

@router_alerts.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id, PriceAlert.user_id == current_user.id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"message": "Alert deleted"}

@router_alerts.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(20).all()
    return [{"id": n.id, "title": n.title, "message": n.message, "type": n.type, "is_read": n.is_read, "created_at": str(n.created_at)} for n in notifs]


# ════════════════════════════════════════════
# routers/dashboard.py
# ════════════════════════════════════════════
router_dashboard = APIRouter()

@router_dashboard.get("/")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    savings = db.query(UserSavings).filter(UserSavings.user_id == current_user.id).first()
    alerts_count = db.query(PriceAlert).filter(PriceAlert.user_id == current_user.id, PriceAlert.is_active == True).count()
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    cart_count = len(cart.items) if cart else 0
    return {
        "total_saved": savings.total_saved if savings else 0,
        "total_orders": savings.total_orders if savings else 0,
        "best_platform": savings.best_platform if savings else None,
        "active_alerts": alerts_count,
        "cart_items": cart_count,
        "monthly_data": savings.monthly_data if savings else [],
    }


# ════════════════════════════════════════════
# routers/planner.py — AI Grocery Planner
# ════════════════════════════════════════════
router_planner = APIRouter()

class PlannerRequest(BaseModel):
    family_size: int
    monthly_budget: float
    food_preference: str       # "vegetarian", "non-vegetarian", "vegan"
    shopping_frequency: str    # "weekly", "biweekly", "monthly"

@router_planner.post("/generate")
def generate_plan(req: PlannerRequest, db: Session = Depends(get_db)):
    """
    AI Grocery Planner — generates a recommended grocery list based on
    family size, budget, food preferences, and shopping frequency.
    In production, replace rule-based logic with OpenAI GPT call.
    """
    # Rule-based MVP planner (replace with GPT in v2)
    budget_per_item = req.monthly_budget / (4 if req.shopping_frequency == "weekly" else 2 if req.shopping_frequency == "biweekly" else 1)
    size_multiplier = max(1, req.family_size / 2)

    base_list = [
        {"category": "Grains & Pulses", "items": ["Basmati Rice", "Toor Dal", "Whole Wheat Atta"]},
        {"category": "Dairy & Eggs",    "items": ["Full Cream Milk", "Curd", "Butter"]},
        {"category": "Vegetables",      "items": ["Onion", "Tomato", "Potato", "Spinach (Palak)"]},
        {"category": "Fruits",          "items": ["Banana", "Apple (Shimla)"]},
        {"category": "Oils & Ghee",     "items": ["Sunflower Oil", "Desi Ghee"]},
        {"category": "Snacks",          "items": ["Britannia Bread", "Digestive Biscuits"]},
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

    total_estimate = sum(
        (i["min_price"] or 0) * i["recommended_qty"] for i in result_items
    )

    return {
        "recommended_list": result_items,
        "estimated_total": round(total_estimate, 2),
        "budget": req.monthly_budget,
        "within_budget": total_estimate <= req.monthly_budget,
        "message": f"Recommended {len(result_items)} items for a family of {req.family_size}.",
    }


# ════════════════════════════════════════════
# routers/admin.py
# ════════════════════════════════════════════
router_admin = APIRouter()
from models.models import UserRole

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Admin access required")
    return current_user

@router_admin.get("/stats")
def admin_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    from models.models import Notification
    return {
        "total_users":    db.query(User).count(),
        "total_products": db.query(Product).count(),
        "total_alerts":   db.query(PriceAlert).count(),
        "total_carts":    db.query(Cart).count(),
    }

@router_admin.get("/users")
def admin_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "created_at": str(u.created_at)} for u in users]

@router_admin.get("/products")
def admin_products(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    prods = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "brand": p.brand, "unit": p.unit, "category": p.category.name if p.category else None} for p in prods]

@router_admin.put("/products/{product_id}/toggle")
def toggle_product(product_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404)
    p.is_active = not p.is_active
    db.commit()
    return {"is_active": p.is_active}
