from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database

router = APIRouter()

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(database.get_db)):
    total_products = db.query(models.Product).count()
    low_stock_items = db.query(models.Product).filter(models.Product.stock_quantity <= 10).count()
    
    pending_receipts = db.query(models.Receipt).filter(models.Receipt.status != models.DocumentStatus.done).count()
    pending_deliveries = db.query(models.Delivery).filter(models.Delivery.status != models.DocumentStatus.done).count()
    pending_transfers = db.query(models.Transfer).filter(models.Transfer.status != models.DocumentStatus.done).count()
    
    # Recent activity from ledger
    recent_activity = db.query(models.StockLedger).order_by(models.StockLedger.date.desc()).limit(5).all()
    recent_activity_data = [
        {
            "id": activity.id,
            "operation": activity.operation_type,
            "quantity": activity.quantity,
            "location": activity.location,
            "date": activity.date,
            "product": activity.product.name if activity.product else "Unknown"
        }
        for activity in recent_activity
    ]

    return {
        "kpis": {
            "totalProducts": total_products,
            "lowStock": low_stock_items,
            "pendingReceipts": pending_receipts,
            "pendingDeliveries": pending_deliveries,
            "scheduledTransfers": pending_transfers,
        },
        "recentActivity": recent_activity_data
    }
