# routers/products.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.models import Product, Category, ProductPlatformPrice

router = APIRouter()

@router.get("/")
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

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon} for c in cats]

@router.get("/autocomplete")
def autocomplete(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.name.ilike(f"%{q}%")).limit(8).all()
    return [{"id": p.id, "name": p.name, "brand": p.brand, "unit": p.unit} for p in products]

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    from services.comparison import get_product_price_comparison
    return get_product_price_comparison(product_id, db)
