# models/models.py — SQLAlchemy ORM Models

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    full_name     = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.user)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    carts         = relationship("Cart", back_populates="user")
    alerts        = relationship("PriceAlert", back_populates="user")
    saved_lists   = relationship("SavedList", back_populates="user")
    savings       = relationship("UserSavings", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, unique=True, nullable=False)
    slug     = Column(String, unique=True, nullable=False)
    icon     = Column(String)           # emoji or icon name
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False, index=True)
    brand        = Column(String)
    description  = Column(Text)
    image_url    = Column(String)
    unit         = Column(String)       # e.g. "1 kg", "500 ml", "12 pcs"
    category_id  = Column(Integer, ForeignKey("categories.id"))
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    category     = relationship("Category", back_populates="products")
    prices       = relationship("ProductPlatformPrice", back_populates="product")
    cart_items   = relationship("CartItem", back_populates="product")
    alerts       = relationship("PriceAlert", back_populates="product")


class Platform(Base):
    __tablename__ = "platforms"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, unique=True, nullable=False)
    slug            = Column(String, unique=True, nullable=False)
    logo_url        = Column(String)
    color           = Column(String)    # hex color for UI
    min_order_value = Column(Float, default=0)
    delivery_charge = Column(Float, default=0)
    free_delivery_above = Column(Float, default=199)
    is_active       = Column(Boolean, default=True)

    prices          = relationship("ProductPlatformPrice", back_populates="platform")


class ProductPlatformPrice(Base):
    __tablename__ = "product_platform_prices"

    id              = Column(Integer, primary_key=True, index=True)
    product_id      = Column(Integer, ForeignKey("products.id"), index=True)
    platform_id     = Column(Integer, ForeignKey("platforms.id"), index=True)
    mrp             = Column(Float)         # Maximum Retail Price
    selling_price   = Column(Float)         # Platform's selling price
    discount_pct    = Column(Float, default=0)
    delivery_charge = Column(Float, default=0)
    is_available    = Column(Boolean, default=True)
    affiliate_url   = Column(String)        # deep link for affiliate
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product         = relationship("Product", back_populates="prices")
    platform        = relationship("Platform", back_populates="prices")


class Cart(Base):
    __tablename__ = "carts"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    name       = Column(String, default="My Cart")
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user       = relationship("User", back_populates="carts")
    items      = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    cart_id    = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)
    added_at   = Column(DateTime(timezone=True), server_default=func.now())

    cart       = relationship("Cart", back_populates="items")
    product    = relationship("Product", back_populates="cart_items")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"))
    product_id      = Column(Integer, ForeignKey("products.id"))
    target_price    = Column(Float, nullable=False)
    is_active       = Column(Boolean, default=True)
    triggered       = Column(Boolean, default=False)
    triggered_at    = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    user            = relationship("User", back_populates="alerts")
    product         = relationship("Product", back_populates="alerts")


class SavedList(Base):
    __tablename__ = "saved_lists"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    name       = Column(String, nullable=False)     # "Weekly", "Monthly", etc.
    items      = Column(JSON, default=list)          # [{product_id, qty}, ...]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="saved_lists")


class UserSavings(Base):
    __tablename__ = "user_savings"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True)
    total_saved     = Column(Float, default=0)
    total_orders    = Column(Integer, default=0)
    best_platform   = Column(String)
    monthly_data    = Column(JSON, default=list)     # [{month, saved, spent}, ...]

    user            = relationship("User", back_populates="savings")


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    title      = Column(String, nullable=False)
    message    = Column(Text, nullable=False)
    type       = Column(String, default="info")     # info, alert, promo
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="notifications")
