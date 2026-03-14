# routers/cart.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import User, Cart, CartItem
from utils.auth import get_current_user

router = APIRouter()

class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = 1

@router.get("/")
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
            "product": {
                "name": ci.product.name, "brand": ci.product.brand,
                "unit": ci.product.unit, "image_url": ci.product.image_url
            },
        })
    return {"cart_id": cart.id, "name": cart.name, "items": items, "item_count": len(items)}

@router.post("/add")
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

@router.put("/item/{item_id}")
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

@router.delete("/item/{item_id}")
def remove_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Removed"}

@router.delete("/clear")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.is_active == True).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared"}

@router.get("/saved-lists")
def get_saved_lists(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models.models import SavedList
    lists = db.query(SavedList).filter(SavedList.user_id == current_user.id).all()
    return [{"id": l.id, "name": l.name, "items": l.items} for l in lists]

@router.post("/saved-lists")
def create_saved_list(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models.models import SavedList
    sl = SavedList(user_id=current_user.id, name=data.get("name", "My List"))
    db.add(sl)
    db.commit()
    return {"message": "List created"}
