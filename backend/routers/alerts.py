# routers/alerts.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import User, PriceAlert, Notification
from utils.auth import get_current_user

router = APIRouter()

class AlertRequest(BaseModel):
    product_id: int
    target_price: float

@router.get("/")
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(PriceAlert).filter(PriceAlert.user_id == current_user.id).all()
    return [{"id": a.id, "product_id": a.product_id,
             "product_name": a.product.name,
             "target_price": a.target_price,
             "is_active": a.is_active,
             "triggered": a.triggered} for a in alerts]

@router.post("/")
def create_alert(req: AlertRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = PriceAlert(user_id=current_user.id, product_id=req.product_id, target_price=req.target_price)
    db.add(alert)
    db.commit()
    return {"message": "Alert created"}

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id, PriceAlert.user_id == current_user.id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"message": "Alert deleted"}

@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return [{"id": n.id, "title": n.title, "message": n.message,
             "type": n.type, "is_read": n.is_read,
             "created_at": str(n.created_at)} for n in notifs]
