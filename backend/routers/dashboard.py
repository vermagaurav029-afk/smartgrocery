# routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, UserSavings, PriceAlert, Cart
from utils.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    savings = db.query(UserSavings).filter(UserSavings.user_id == current_user.id).first()
    alerts_count = db.query(PriceAlert).filter(
        PriceAlert.user_id == current_user.id, PriceAlert.is_active == True
    ).count()
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
