# routers/comparison.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Cart, CartItem, Product
from utils.auth import get_current_user

router = APIRouter()

@router.get("/cart")
def compare_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if not cart or not cart.items:
        raise HTTPException(400, "Cart is empty")
    from services.comparison import compare_cart as do_compare
    return do_compare(cart.items, db)

@router.post("/guest")
def compare_guest(items: list, db: Session = Depends(get_db)):
    cart_items = []
    for it in items:
        ci = CartItem(product_id=it["product_id"], quantity=it["quantity"])
        ci.product = db.query(Product).filter(Product.id == it["product_id"]).first()
        if ci.product:
            cart_items.append(ci)
    from services.comparison import compare_cart as do_compare
    return do_compare(cart_items, db)
