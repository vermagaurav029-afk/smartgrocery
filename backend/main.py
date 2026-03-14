# main.py — SmartGrocery FastAPI Application Entry Point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import auth, products, cart, comparison, alerts, dashboard, planner, admin

# Create all tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="SmartGrocery API",
    description="Compare grocery prices across Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon & Flipkart",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://smartgrocery.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(cart.router,       prefix="/api/cart",       tags=["Cart"])
app.include_router(comparison.router, prefix="/api/comparison", tags=["Comparison"])
app.include_router(alerts.router,     prefix="/api/alerts",     tags=["Alerts"])
app.include_router(dashboard.router,  prefix="/api/dashboard",  tags=["Dashboard"])
app.include_router(planner.router,    prefix="/api/planner",    tags=["Planner"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["Admin"])

@app.get("/")
def root():
    return {"message": "SmartGrocery API v1.0 — Visit /docs for API reference"}

@app.get("/health")
def health():
    return {"status": "ok"}
