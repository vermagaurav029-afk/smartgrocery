"""
SmartGrocery - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.routers import auth, products, cart, comparison, alerts, planner, savings, admin
from app.core.config import settings
from app.core.database import engine, Base

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartGrocery API",
    description="Compare grocery prices across Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon & Flipkart",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(cart.router,       prefix="/api/cart",       tags=["Cart"])
app.include_router(comparison.router, prefix="/api/compare",    tags=["Price Comparison"])
app.include_router(alerts.router,     prefix="/api/alerts",     tags=["Price Alerts"])
app.include_router(planner.router,    prefix="/api/planner",    tags=["AI Planner"])
app.include_router(savings.router,    prefix="/api/savings",    tags=["Savings Dashboard"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["Admin"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
