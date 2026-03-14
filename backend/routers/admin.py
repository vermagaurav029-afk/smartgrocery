# routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, UserRole, Product, PriceAlert, Cart
from utils.auth import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Admin access required")
    return current_user

@router.get("/stats")
def admin_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users":    db.query(User).count(),
        "total_products": db.query(Product).count(),
        "total_alerts":   db.query(PriceAlert).count(),
        "total_carts":    db.query(Cart).count(),
    }

@router.get("/users")
def admin_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name,
             "role": u.role, "created_at": str(u.created_at)} for u in users]

@router.get("/products")
def admin_products(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    prods = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "brand": p.brand,
             "unit": p.unit, "is_active": p.is_active,
             "category": p.category.name if p.category else None} for p in prods]

@router.put("/products/{product_id}/toggle")
def toggle_product(product_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404)
    p.is_active = not p.is_active
    db.commit()
    return {"is_active": p.is_active}
