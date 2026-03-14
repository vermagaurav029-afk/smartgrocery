# SmartGrocery — Architecture, Roadmap & Business Strategy

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  Landing · Search · Cart · Compare · Dashboard · Planner · Admin│
│              Vite + Tailwind + Recharts + Axios                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                             │
│  /auth  /products  /cart  /comparison  /alerts  /planner /admin │
│              JWT Auth · Pydantic · SQLAlchemy ORM               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        PostgreSQL      APScheduler   (Redis)
        (Primary DB)   (Price Jobs)   (Cache)
```

---

## Database Schema (ERD Summary)

```
users ──────────────── carts ──── cart_items ──── products
  │                      │                           │
  ├── price_alerts        └── saved_lists         categories
  ├── notifications                                   │
  └── user_savings                            product_platform_prices
                                                       │
                                                  platforms
```

---

## API Endpoint Summary

### Auth
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/auth/register    | Create account        |
| POST   | /api/auth/login       | Login, get JWT token  |
| GET    | /api/auth/me          | Get current user      |

### Products
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/products         | Search + filter       |
| GET    | /api/products/{id}    | Product + all prices  |
| GET    | /api/products/categories | All categories     |

### Cart
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/cart             | Get active cart       |
| POST   | /api/cart/add         | Add item to cart      |
| PUT    | /api/cart/item/{id}   | Update quantity       |
| DELETE | /api/cart/item/{id}   | Remove item           |
| DELETE | /api/cart/clear       | Clear entire cart     |

### Comparison
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/comparison/cart  | Full cart comparison  |
| POST   | /api/comparison/guest | Compare without auth  |

### Alerts
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/alerts           | All user alerts       |
| POST   | /api/alerts           | Create alert          |
| DELETE | /api/alerts/{id}      | Delete alert          |
| GET    | /api/alerts/notifications | Notification feed |

### Dashboard & Planner
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/dashboard        | User savings stats    |
| POST   | /api/planner/generate | AI grocery plan       |

### Admin
| Method | Endpoint                        | Description     |
|--------|---------------------------------|-----------------|
| GET    | /api/admin/stats                | Platform stats  |
| GET    | /api/admin/users                | All users       |
| GET    | /api/admin/products             | All products    |
| PUT    | /api/admin/products/{id}/toggle | Toggle active   |

---

## MVP Scope (v1 — Launch Ready)

✅ User registration and JWT auth
✅ 50+ products across 10 categories  
✅ 6 platforms: Blinkit, Zepto, Swiggy, BigBasket, Amazon, Flipkart
✅ Cart management (add, remove, update qty)
✅ Full price comparison engine (single + mixed basket)
✅ Savings breakdown with delivery charges
✅ Price drop alerts
✅ AI Grocery Planner (rule-based, upgradeable to GPT)
✅ Savings dashboard with charts
✅ Admin dashboard (users, products, stats)
✅ Responsive mobile-first UI
✅ Docker deployment ready

---

## Version 2 Roadmap

### Real-time Pricing
- **Playwright scrapers** for each platform (run every 2-4h)
- Store price history per product per platform
- Display price trend charts (last 7/30/90 days)
- Flag "price just dropped" on product cards

### User Experience
- WhatsApp / SMS price alert notifications (Twilio)
- Share grocery list via link
- Browser extension to track prices while shopping
- Voice search integration
- OCR receipt upload to auto-build cart

### Business Features
- **Affiliate deep links** per platform (commission per click/order)
- Premium tier: unlimited alerts, advanced analytics, AI assistant
- Coupon/promo code aggregator per platform
- Bulk buy calculator (club orders with neighbors)
- Loyalty points tracker across platforms

### Technical
- Redis caching for product search (sub-50ms response)
- Elasticsearch for fuzzy product search
- React Native mobile app (iOS + Android)
- GraphQL API for mobile (selective field fetching)
- A/B testing infrastructure
- Multi-city support (prices vary by city)

---

## Real-time Pricing Integration Strategy

### Option 1: Web Scraping (Playwright)
```python
# Example: Blinkit scraper skeleton
async def scrape_blinkit(product_name: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f"https://blinkit.com/s/?q={product_name}")
        # Extract price from DOM
        price = await page.locator(".Price__value").first.text_content()
        return float(price.replace("₹", "").strip())
```
**Pros:** Works immediately, no API dependency  
**Cons:** Fragile (DOM changes break it), TOS risk, rate limiting

### Option 2: Unofficial APIs
- Some platforms expose internal APIs via their mobile apps
- Intercept with Charles Proxy / mitmproxy
- More stable than scraping but still unofficial

### Option 3: Official Partnerships (v3+)
- Apply to Blinkit/BigBasket partner programs
- Use affiliate APIs (they provide product + pricing feeds)
- Most stable, earns commission, legally sound

**Recommendation:** Start with scraping → migrate to affiliate API partnerships.

---

## Affiliate Monetization Strategy

1. **Cost-per-click (CPC):** Earn ₹2-8 per click on "Buy on Blinkit" button
2. **Cost-per-order (CPO):** Earn 1-3% of order value when user completes purchase
3. **Featured placement:** Platforms pay to be shown first (always disclose)
4. **Premium subscriptions:** ₹49/month for unlimited alerts + AI planner

### Projected Revenue (per 10,000 MAU)
- 20% click-through on comparison page = 2,000 daily clicks
- ₹5 avg CPC × 2,000 = ₹10,000/day = ₹3L/month
- At 100,000 MAU: ~₹30L/month from affiliate alone

---

## Scraping Infrastructure (v2)

```
APScheduler (every 2h)
    │
    ├── ScraperWorker (Blinkit)
    ├── ScraperWorker (Zepto)
    ├── ScraperWorker (Swiggy)
    ├── ScraperWorker (BigBasket)
    ├── ScraperWorker (Amazon)
    └── ScraperWorker (Flipkart)
            │
            ▼
    Update ProductPlatformPrice
            │
            ▼
    Check PriceAlerts → Trigger Notifications
```

### Proxy rotation (to avoid IP bans)
- Use rotating residential proxies (Bright Data, Oxylabs)
- Estimated cost: $50-200/month
- Alternative: run scrapers from different cloud regions

---

## City-wise Pricing (v3)

Quick-commerce prices vary significantly by city. Architecture:

```sql
-- Add city to ProductPlatformPrice
ALTER TABLE product_platform_prices ADD COLUMN city VARCHAR(50) DEFAULT 'mumbai';
ALTER TABLE product_platform_prices ADD COLUMN pincode VARCHAR(10);
```

Users set their delivery pincode → see city-specific prices.
