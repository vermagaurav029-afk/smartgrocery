# data/seed.py — Seed 50+ grocery products with realistic prices across 6 platforms

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.models import Category, Platform, Product, ProductPlatformPrice, User, UserSavings
from utils.auth import get_password_hash

db = SessionLocal()

# ─── CATEGORIES ────────────────────────────────────────────────────────────────
CATEGORIES = [
    {"name": "Dairy & Eggs",    "slug": "dairy-eggs",    "icon": "🥛"},
    {"name": "Fruits",          "slug": "fruits",         "icon": "🍎"},
    {"name": "Vegetables",      "slug": "vegetables",     "icon": "🥦"},
    {"name": "Grains & Pulses", "slug": "grains-pulses",  "icon": "🌾"},
    {"name": "Snacks",          "slug": "snacks",         "icon": "🍿"},
    {"name": "Beverages",       "slug": "beverages",      "icon": "🧃"},
    {"name": "Oils & Ghee",     "slug": "oils-ghee",      "icon": "🫙"},
    {"name": "Household",       "slug": "household",      "icon": "🧹"},
    {"name": "Personal Care",   "slug": "personal-care",  "icon": "🧴"},
    {"name": "Bakery",          "slug": "bakery",         "icon": "🍞"},
]

# ─── PLATFORMS ─────────────────────────────────────────────────────────────────
PLATFORMS = [
    {"name": "Blinkit",          "slug": "blinkit",   "color": "#F9D72C", "min_order_value": 99,  "delivery_charge": 25, "free_delivery_above": 199},
    {"name": "Zepto",            "slug": "zepto",     "color": "#8B5CF6", "min_order_value": 99,  "delivery_charge": 25, "free_delivery_above": 199},
    {"name": "Swiggy Instamart", "slug": "swiggy",    "color": "#FF6B35", "min_order_value": 99,  "delivery_charge": 30, "free_delivery_above": 299},
    {"name": "BigBasket",        "slug": "bigbasket", "color": "#84CC16", "min_order_value": 500, "delivery_charge": 40, "free_delivery_above": 500},
    {"name": "Amazon",           "slug": "amazon",    "color": "#FF9900", "min_order_value": 0,   "delivery_charge": 40, "free_delivery_above": 499},
    {"name": "Flipkart Minutes", "slug": "flipkart",  "color": "#2874F0", "min_order_value": 99,  "delivery_charge": 20, "free_delivery_above": 149},
]

# ─── PRODUCTS ──────────────────────────────────────────────────────────────────
# Format: (name, brand, unit, category_slug, image_url,
#          {platform_slug: (mrp, selling_price)})
# Prices are in INR — realistic 2024 values with platform variation

PRODUCTS = [
    # DAIRY & EGGS
    ("Full Cream Milk",       "Amul",      "1 L",     "dairy-eggs",    "https://images.meesho.com/images/products/225186697/thumbnail.jpg",
     {"blinkit":(68,62), "zepto":(68,60), "swiggy":(68,64), "bigbasket":(68,58), "amazon":(68,65), "flipkart":(68,61)}),
    ("Toned Milk",            "Mother Dairy","1 L",   "dairy-eggs",    "https://images.meesho.com/images/products/225186697/thumbnail.jpg",
     {"blinkit":(55,52), "zepto":(55,50), "swiggy":(55,53), "bigbasket":(55,48), "amazon":(55,54), "flipkart":(55,51)}),
    ("Paneer",                "Amul",      "200 g",   "dairy-eggs",    "https://via.placeholder.com/200",
     {"blinkit":(85,82), "zepto":(85,79), "swiggy":(85,84), "bigbasket":(85,76), "amazon":(85,83), "flipkart":(85,80)}),
    ("Curd",                  "Amul",      "400 g",   "dairy-eggs",    "https://via.placeholder.com/200",
     {"blinkit":(48,45), "zepto":(48,44), "swiggy":(48,47), "bigbasket":(48,42), "amazon":(48,46), "flipkart":(48,43)}),
    ("Eggs",                  "Country",   "12 pcs",  "dairy-eggs",    "https://via.placeholder.com/200",
     {"blinkit":(84,80), "zepto":(84,78), "swiggy":(84,82), "bigbasket":(84,75), "amazon":(84,81), "flipkart":(84,77)}),
    ("Butter",                "Amul",      "500 g",   "dairy-eggs",    "https://via.placeholder.com/200",
     {"blinkit":(268,255), "zepto":(268,250), "swiggy":(268,260), "bigbasket":(268,245), "amazon":(268,258), "flipkart":(268,252)}),
    ("Cheese Slices",         "Amul",      "200 g",   "dairy-eggs",    "https://via.placeholder.com/200",
     {"blinkit":(130,125), "zepto":(130,122), "swiggy":(130,128), "bigbasket":(130,118), "amazon":(130,126), "flipkart":(130,121)}),

    # FRUITS
    ("Banana",                "Fresh",     "1 dozen", "fruits",        "https://via.placeholder.com/200",
     {"blinkit":(45,42), "zepto":(45,40), "swiggy":(45,44), "bigbasket":(45,38), "amazon":(45,43), "flipkart":(45,41)}),
    ("Apple (Shimla)",        "Fresh",     "1 kg",    "fruits",        "https://via.placeholder.com/200",
     {"blinkit":(160,152), "zepto":(160,148), "swiggy":(160,155), "bigbasket":(160,142), "amazon":(160,158), "flipkart":(160,150)}),
    ("Watermelon",            "Fresh",     "1 kg",    "fruits",        "https://via.placeholder.com/200",
     {"blinkit":(28,25), "zepto":(28,24), "swiggy":(28,27), "bigbasket":(28,22), "amazon":(28,None), "flipkart":(28,26)}),
    ("Mango (Alphonso)",      "Fresh",     "1 kg",    "fruits",        "https://via.placeholder.com/200",
     {"blinkit":(350,335), "zepto":(350,328), "swiggy":(350,342), "bigbasket":(350,315), "amazon":(350,338), "flipkart":(350,330)}),

    # VEGETABLES
    ("Onion",                 "Fresh",     "1 kg",    "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(42,38), "zepto":(42,36), "swiggy":(42,40), "bigbasket":(42,34), "amazon":(42,39), "flipkart":(42,37)}),
    ("Potato",                "Fresh",     "1 kg",    "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(32,28), "zepto":(32,27), "swiggy":(32,30), "bigbasket":(32,25), "amazon":(32,29), "flipkart":(32,26)}),
    ("Tomato",                "Fresh",     "500 g",   "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(35,32), "zepto":(35,30), "swiggy":(35,34), "bigbasket":(35,28), "amazon":(35,33), "flipkart":(35,31)}),
    ("Spinach (Palak)",       "Fresh",     "250 g",   "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(20,18), "zepto":(20,17), "swiggy":(20,19), "bigbasket":(20,16), "amazon":(20,None), "flipkart":(20,18)}),
    ("Garlic",                "Fresh",     "100 g",   "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(28,25), "zepto":(28,24), "swiggy":(28,27), "bigbasket":(28,22), "amazon":(28,26), "flipkart":(28,24)}),
    ("Capsicum",              "Fresh",     "500 g",   "vegetables",    "https://via.placeholder.com/200",
     {"blinkit":(55,50), "zepto":(55,48), "swiggy":(55,52), "bigbasket":(55,45), "amazon":(55,51), "flipkart":(55,49)}),

    # GRAINS & PULSES
    ("Basmati Rice",          "India Gate","5 kg",    "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(595,565), "zepto":(595,558), "swiggy":(595,578), "bigbasket":(595,545), "amazon":(595,570), "flipkart":(595,560)}),
    ("Toor Dal",              "Tata Sampann","1 kg",  "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(165,158), "zepto":(165,155), "swiggy":(165,162), "bigbasket":(165,150), "amazon":(165,160), "flipkart":(165,156)}),
    ("Whole Wheat Atta",      "Aashirvaad","5 kg",    "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(285,270), "zepto":(285,265), "swiggy":(285,278), "bigbasket":(285,258), "amazon":(285,272), "flipkart":(285,268)}),
    ("Chana Dal",             "Tata Sampann","1 kg",  "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(145,138), "zepto":(145,135), "swiggy":(145,142), "bigbasket":(145,130), "amazon":(145,140), "flipkart":(145,136)}),
    ("Moong Dal",             "Patanjali",  "1 kg",   "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(125,118), "zepto":(125,115), "swiggy":(125,122), "bigbasket":(125,110), "amazon":(125,120), "flipkart":(125,116)}),
    ("Poha",                  "Lion",       "500 g",  "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(48,45), "zepto":(48,44), "swiggy":(48,47), "bigbasket":(48,42), "amazon":(48,46), "flipkart":(48,43)}),

    # SNACKS
    ("Lay's Classic Salted",  "Lay's",     "73 g",    "snacks",        "https://via.placeholder.com/200",
     {"blinkit":(20,20), "zepto":(20,20), "swiggy":(20,20), "bigbasket":(20,20), "amazon":(20,18), "flipkart":(20,19)}),
    ("Digestive Biscuits",    "McVitie's", "400 g",   "snacks",        "https://via.placeholder.com/200",
     {"blinkit":(115,110), "zepto":(115,108), "swiggy":(115,112), "bigbasket":(115,105), "amazon":(115,109), "flipkart":(115,107)}),
    ("Maggi Noodles",         "Nestle",    "280 g",   "snacks",        "https://via.placeholder.com/200",
     {"blinkit":(62,60), "zepto":(62,58), "swiggy":(62,61), "bigbasket":(62,56), "amazon":(62,59), "flipkart":(62,57)}),
    ("Kurkure Masala Munch",  "PepsiCo",   "90 g",    "snacks",        "https://via.placeholder.com/200",
     {"blinkit":(20,20), "zepto":(20,20), "swiggy":(20,20), "bigbasket":(20,20), "amazon":(20,18), "flipkart":(20,20)}),
    ("Dark Fantasy Chocofills","Sunfeast", "300 g",   "snacks",        "https://via.placeholder.com/200",
     {"blinkit":(95,90), "zepto":(95,88), "swiggy":(95,92), "bigbasket":(95,85), "amazon":(95,89), "flipkart":(95,87)}),

    # BEVERAGES
    ("Tropicana Orange Juice","Tropicana", "1 L",     "beverages",     "https://via.placeholder.com/200",
     {"blinkit":(128,120), "zepto":(128,118), "swiggy":(128,124), "bigbasket":(128,115), "amazon":(128,122), "flipkart":(128,119)}),
    ("Coca-Cola",             "Coca-Cola", "2 L",     "beverages",     "https://via.placeholder.com/200",
     {"blinkit":(95,90), "zepto":(95,90), "swiggy":(95,92), "bigbasket":(95,88), "amazon":(95,90), "flipkart":(95,90)}),
    ("Green Tea",             "Lipton",    "25 bags", "beverages",     "https://via.placeholder.com/200",
     {"blinkit":(130,125), "zepto":(130,122), "swiggy":(130,128), "bigbasket":(130,118), "amazon":(130,120), "flipkart":(130,123)}),
    ("Coffee (Instant)",      "Nescafe",   "200 g",   "beverages",     "https://via.placeholder.com/200",
     {"blinkit":(398,378), "zepto":(398,372), "swiggy":(398,385), "bigbasket":(398,362), "amazon":(398,375), "flipkart":(398,370)}),
    ("Tender Coconut Water",  "Raw Pressery","200 ml","beverages",     "https://via.placeholder.com/200",
     {"blinkit":(45,42), "zepto":(45,40), "swiggy":(45,44), "bigbasket":(45,38), "amazon":(45,43), "flipkart":(45,None)}),

    # OILS & GHEE
    ("Sunflower Oil",         "Fortune",   "1 L",     "oils-ghee",     "https://via.placeholder.com/200",
     {"blinkit":(148,140), "zepto":(148,138), "swiggy":(148,145), "bigbasket":(148,132), "amazon":(148,142), "flipkart":(148,136)}),
    ("Desi Ghee",             "Amul",      "500 ml",  "oils-ghee",     "https://via.placeholder.com/200",
     {"blinkit":(340,325), "zepto":(340,318), "swiggy":(340,335), "bigbasket":(340,308), "amazon":(340,328), "flipkart":(340,320)}),
    ("Mustard Oil",           "Patanjali", "1 L",     "oils-ghee",     "https://via.placeholder.com/200",
     {"blinkit":(178,168), "zepto":(178,165), "swiggy":(178,175), "bigbasket":(178,158), "amazon":(178,170), "flipkart":(178,162)}),
    ("Olive Oil (Extra Virgin)","Bertolli","500 ml",  "oils-ghee",     "https://via.placeholder.com/200",
     {"blinkit":(598,568), "zepto":(598,558), "swiggy":(598,580), "bigbasket":(598,545), "amazon":(598,555), "flipkart":(598,562)}),

    # HOUSEHOLD
    ("Surf Excel Matic",      "HUL",       "1 kg",    "household",     "https://via.placeholder.com/200",
     {"blinkit":(265,252), "zepto":(265,248), "swiggy":(265,258), "bigbasket":(265,238), "amazon":(265,250), "flipkart":(265,245)}),
    ("Vim Dishwash Bar",      "HUL",       "4×155 g", "household",     "https://via.placeholder.com/200",
     {"blinkit":(70,66), "zepto":(70,64), "swiggy":(70,68), "bigbasket":(70,60), "amazon":(70,65), "flipkart":(70,63)}),
    ("Lizol Floor Cleaner",   "Reckitt",   "975 ml",  "household",     "https://via.placeholder.com/200",
     {"blinkit":(195,185), "zepto":(195,182), "swiggy":(195,190), "bigbasket":(195,175), "amazon":(195,188), "flipkart":(195,180)}),
    ("Harpic Toilet Cleaner", "Reckitt",   "1 L",     "household",     "https://via.placeholder.com/200",
     {"blinkit":(155,148), "zepto":(155,145), "swiggy":(155,152), "bigbasket":(155,138), "amazon":(155,150), "flipkart":(155,142)}),
    ("Tissue Paper Roll",     "Origami",   "6 rolls", "household",     "https://via.placeholder.com/200",
     {"blinkit":(135,128), "zepto":(135,125), "swiggy":(135,132), "bigbasket":(135,120), "amazon":(135,122), "flipkart":(135,124)}),

    # PERSONAL CARE
    ("Dove Body Wash",        "HUL",       "250 ml",  "personal-care", "https://via.placeholder.com/200",
     {"blinkit":(248,235), "zepto":(248,230), "swiggy":(248,242), "bigbasket":(248,222), "amazon":(248,228), "flipkart":(248,232)}),
    ("Head & Shoulders Shampoo","P&G",     "340 ml",  "personal-care", "https://via.placeholder.com/200",
     {"blinkit":(295,280), "zepto":(295,275), "swiggy":(295,288), "bigbasket":(295,265), "amazon":(295,272), "flipkart":(295,278)}),
    ("Colgate Strong Teeth",  "Colgate",   "300 g",   "personal-care", "https://via.placeholder.com/200",
     {"blinkit":(155,148), "zepto":(155,145), "swiggy":(155,152), "bigbasket":(155,138), "amazon":(155,142), "flipkart":(155,146)}),
    ("Dettol Hand Wash",      "Reckitt",   "200 ml",  "personal-care", "https://via.placeholder.com/200",
     {"blinkit":(95,90), "zepto":(95,88), "swiggy":(95,93), "bigbasket":(95,84), "amazon":(95,88), "flipkart":(95,87)}),

    # BAKERY
    ("Britannia Bread",       "Britannia", "400 g",   "bakery",        "https://via.placeholder.com/200",
     {"blinkit":(42,40), "zepto":(42,39), "swiggy":(42,41), "bigbasket":(42,37), "amazon":(42,40), "flipkart":(42,38)}),
    ("Good Day Butter Cookies","Britannia","150 g",   "bakery",        "https://via.placeholder.com/200",
     {"blinkit":(35,33), "zepto":(35,32), "swiggy":(35,34), "bigbasket":(35,30), "amazon":(35,32), "flipkart":(35,31)}),
    ("Croissant",             "Local Bakery","2 pcs", "bakery",        "https://via.placeholder.com/200",
     {"blinkit":(55,52), "zepto":(55,50), "swiggy":(55,54), "bigbasket":(55,None), "amazon":(55,None), "flipkart":(55,48)}),
    ("Brown Bread",           "Harvest Gold","400 g", "bakery",        "https://via.placeholder.com/200",
     {"blinkit":(52,50), "zepto":(52,48), "swiggy":(52,51), "bigbasket":(52,46), "amazon":(52,49), "flipkart":(52,47)}),
    ("Milk Rusk",             "Britannia", "585 g",   "bakery",        "https://via.placeholder.com/200",
     {"blinkit":(98,93), "zepto":(98,91), "swiggy":(98,96), "bigbasket":(98,88), "amazon":(98,92), "flipkart":(98,90)}),

    # More grains
    ("Salt",                  "Tata",      "1 kg",    "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(22,20), "zepto":(22,20), "swiggy":(22,21), "bigbasket":(22,19), "amazon":(22,20), "flipkart":(22,20)}),
    ("Sugar",                 "Uttam",     "1 kg",    "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(52,48), "zepto":(52,47), "swiggy":(52,50), "bigbasket":(52,45), "amazon":(52,49), "flipkart":(52,46)}),
    ("Turmeric Powder",       "Everest",   "200 g",   "grains-pulses", "https://via.placeholder.com/200",
     {"blinkit":(78,74), "zepto":(78,72), "swiggy":(78,76), "bigbasket":(78,68), "amazon":(78,73), "flipkart":(78,71)}),
]


def run_seed():
    print("🌱 Seeding database...")

    # Admin user
    admin_exists = db.query(User).filter(User.email == "admin@smartgrocery.in").first()
    if not admin_exists:
        from models.models import UserRole
        admin = User(
            email="admin@smartgrocery.in",
            full_name="Admin User",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print("  ✓ Admin user created")

    # Categories
    cat_map = {}
    for c in CATEGORIES:
        existing = db.query(Category).filter(Category.slug == c["slug"]).first()
        if not existing:
            obj = Category(**c)
            db.add(obj)
            db.flush()
            cat_map[c["slug"]] = obj
        else:
            cat_map[c["slug"]] = existing
    db.commit()
    print(f"  ✓ {len(CATEGORIES)} categories")

    # Platforms
    plat_map = {}
    for p in PLATFORMS:
        existing = db.query(Platform).filter(Platform.slug == p["slug"]).first()
        if not existing:
            obj = Platform(**p)
            db.add(obj)
            db.flush()
            plat_map[p["slug"]] = obj
        else:
            plat_map[p["slug"]] = existing
    db.commit()
    print(f"  ✓ {len(PLATFORMS)} platforms")

    # Products + prices
    count = 0
    for row in PRODUCTS:
        name, brand, unit, cat_slug, image, price_data = row
        existing = db.query(Product).filter(Product.name == name, Product.brand == brand).first()
        if not existing:
            prod = Product(
                name=name, brand=brand, unit=unit,
                image_url=image,
                category_id=cat_map[cat_slug].id,
            )
            db.add(prod)
            db.flush()

            for p_slug, (mrp, selling_price) in price_data.items():
                if p_slug not in plat_map:
                    continue
                available = selling_price is not None
                sp = selling_price or mrp
                discount = round((1 - sp / mrp) * 100, 1) if mrp else 0
                price = ProductPlatformPrice(
                    product_id=prod.id,
                    platform_id=plat_map[p_slug].id,
                    mrp=mrp,
                    selling_price=sp,
                    discount_pct=discount,
                    is_available=available,
                )
                db.add(price)
            count += 1

    db.commit()
    print(f"  ✓ {count} products with platform prices")
    print("✅ Seed complete!")

if __name__ == "__main__":
    run_seed()
