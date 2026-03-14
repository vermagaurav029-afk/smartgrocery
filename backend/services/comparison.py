# services/comparison.py — Core Price Comparison Engine

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models.models import Product, Platform, ProductPlatformPrice, CartItem


class PlatformCartResult:
    def __init__(self, platform: Platform):
        self.platform        = platform
        self.items           = []          # list of item detail dicts
        self.subtotal        = 0.0
        self.delivery_charge = 0.0
        self.total           = 0.0
        self.missing_items   = []          # products unavailable on this platform
        self.savings_vs_mrp  = 0.0
        self.is_complete     = True        # all items available?


def compare_cart(cart_items: List[CartItem], db: Session) -> Dict:
    """
    Main comparison engine.
    Given a list of cart items, returns:
    - Per-platform totals with delivery charges
    - Cheapest single platform
    - Mixed basket (best price per item across platforms)
    - Savings breakdown
    """

    platforms   = db.query(Platform).filter(Platform.is_active == True).all()
    plat_results: Dict[int, PlatformCartResult] = {p.id: PlatformCartResult(p) for p in platforms}

    all_item_details = []

    for cart_item in cart_items:
        product = cart_item.product
        qty     = cart_item.quantity

        # Fetch all platform prices for this product
        price_rows = (
            db.query(ProductPlatformPrice)
            .filter(ProductPlatformPrice.product_id == product.id)
            .all()
        )
        price_map = {row.platform_id: row for row in price_rows}

        item_platform_data = {}
        min_price = None
        min_plat_id = None

        for plat in platforms:
            prow = price_map.get(plat.id)
            if prow and prow.is_available:
                effective = prow.selling_price * qty
                item_platform_data[plat.id] = {
                    "platform_id":   plat.id,
                    "platform_name": plat.name,
                    "platform_color":plat.color,
                    "mrp":           prow.mrp,
                    "unit_price":    prow.selling_price,
                    "total_price":   effective,
                    "discount_pct":  prow.discount_pct,
                    "is_available":  True,
                    "affiliate_url": prow.affiliate_url,
                }
                if min_price is None or prow.selling_price < min_price:
                    min_price   = prow.selling_price
                    min_plat_id = plat.id
            else:
                item_platform_data[plat.id] = {
                    "platform_id":   plat.id,
                    "platform_name": plat.name,
                    "platform_color":plat.color,
                    "is_available":  False,
                }

        # Mark cheapest platform for this item
        if min_plat_id:
            item_platform_data[min_plat_id]["is_cheapest"] = True

        all_item_details.append({
            "product_id":   product.id,
            "product_name": product.name,
            "brand":        product.brand,
            "unit":         product.unit,
            "image_url":    product.image_url,
            "quantity":     qty,
            "platforms":    item_platform_data,
            "cheapest_platform_id": min_plat_id,
            "cheapest_unit_price":  min_price,
        })

        # Accumulate into per-platform result
        for plat in platforms:
            r = plat_results[plat.id]
            d = item_platform_data[plat.id]
            if d.get("is_available"):
                r.subtotal       += d["total_price"]
                r.savings_vs_mrp += (d["mrp"] - d["unit_price"]) * qty if d.get("mrp") else 0
                r.items.append(d)
            else:
                r.missing_items.append(product.name)
                r.is_complete = False

    # Apply delivery charges
    for plat in platforms:
        r = plat_results[plat.id]
        if r.subtotal > 0:
            if r.subtotal < plat.free_delivery_above:
                r.delivery_charge = plat.delivery_charge
            r.total = r.subtotal + r.delivery_charge

    # Rank platforms (complete carts only, by total)
    complete_results = [r for r in plat_results.values() if r.is_complete and r.total > 0]
    complete_results.sort(key=lambda x: x.total)

    cheapest_total   = complete_results[0].total if complete_results else None
    most_expensive   = complete_results[-1].total if complete_results else None

    # Mixed basket — best per item
    mixed_items      = []
    mixed_subtotal   = 0.0
    platform_split   = {}  # how many items from each platform

    for item in all_item_details:
        best_plat_id = item["cheapest_platform_id"]
        if best_plat_id:
            pd = item["platforms"][best_plat_id]
            mixed_items.append({
                "product_id":    item["product_id"],
                "product_name":  item["product_name"],
                "quantity":      item["quantity"],
                "platform_id":   best_plat_id,
                "platform_name": pd["platform_name"],
                "platform_color":pd["platform_color"],
                "unit_price":    item["cheapest_unit_price"],
                "total_price":   item["cheapest_unit_price"] * item["quantity"],
            })
            mixed_subtotal += item["cheapest_unit_price"] * item["quantity"]
            platform_split[pd["platform_name"]] = platform_split.get(pd["platform_name"], 0) + 1

    # Add delivery charges for mixed basket (per platform used)
    mixed_delivery   = 0.0
    platforms_used   = set(mi["platform_id"] for mi in mixed_items)
    for plat in platforms:
        if plat.id in platforms_used:
            # Would need separate order per platform
            if mixed_subtotal < plat.free_delivery_above:
                mixed_delivery += plat.delivery_charge

    mixed_total = mixed_subtotal + mixed_delivery

    # Savings calculation
    savings_vs_cheapest_single = (cheapest_total - mixed_total) if cheapest_total and mixed_total < cheapest_total else 0
    savings_vs_expensive       = (most_expensive - cheapest_total) if most_expensive and cheapest_total else 0

    return {
        "items": all_item_details,
        "platforms": [
            {
                "platform_id":    r.platform.id,
                "platform_name":  r.platform.name,
                "platform_slug":  r.platform.slug,
                "platform_color": r.platform.color,
                "subtotal":       round(r.subtotal, 2),
                "delivery_charge":round(r.delivery_charge, 2),
                "total":          round(r.total, 2),
                "savings_vs_mrp": round(r.savings_vs_mrp, 2),
                "missing_items":  r.missing_items,
                "is_complete":    r.is_complete,
                "is_cheapest":    r.is_complete and r.total == cheapest_total,
                "rank":           (complete_results.index(r) + 1) if r in complete_results else None,
            }
            for r in plat_results.values()
        ],
        "mixed_basket": {
            "items":          mixed_items,
            "subtotal":       round(mixed_subtotal, 2),
            "delivery_charge":round(mixed_delivery, 2),
            "total":          round(mixed_total, 2),
            "platforms_used": list(platform_split.keys()),
            "platform_split": platform_split,
        },
        "summary": {
            "cheapest_single_total":   round(cheapest_total, 2) if cheapest_total else None,
            "mixed_basket_total":      round(mixed_total, 2),
            "savings_mixed_vs_single": round(savings_vs_cheapest_single, 2),
            "savings_single_vs_worst": round(savings_vs_expensive, 2),
            "cheapest_platform":       complete_results[0].platform.name if complete_results else None,
        },
    }


def get_product_price_comparison(product_id: int, db: Session) -> Dict:
    """Compare prices for a single product across all platforms."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {}

    prices   = db.query(ProductPlatformPrice).filter(
        ProductPlatformPrice.product_id == product_id
    ).all()

    results  = []
    min_price = None
    for p in prices:
        if p.is_available and (min_price is None or p.selling_price < min_price):
            min_price = p.selling_price

    for p in prices:
        results.append({
            "platform_id":   p.platform_id,
            "platform_name": p.platform.name,
            "platform_color":p.platform.color,
            "mrp":           p.mrp,
            "selling_price": p.selling_price,
            "discount_pct":  p.discount_pct,
            "is_available":  p.is_available,
            "is_cheapest":   p.is_available and p.selling_price == min_price,
            "affiliate_url": p.affiliate_url,
        })

    results.sort(key=lambda x: (not x["is_available"], x["selling_price"]))
    return {"product": product, "prices": results, "cheapest_price": min_price}
