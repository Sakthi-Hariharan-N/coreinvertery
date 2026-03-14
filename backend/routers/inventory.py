from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
import datetime

router = APIRouter()

# --- Receipts (Incoming) ---
@router.post("/receipts", response_model=schemas.ReceiptResponse)
def create_receipt(receipt: schemas.ReceiptCreate, db: Session = Depends(database.get_db)):
    db_receipt = models.Receipt(supplier=receipt.supplier, status=receipt.status)
    db.add(db_receipt)
    db.flush()
    
    for item in receipt.items:
        db_item = models.ReceiptItem(receipt_id=db_receipt.id, product_id=item.product_id, quantity=item.quantity)
        db.add(db_item)
        
        # If validating immediately (status == 'Done')
        if receipt.status == models.DocumentStatus.done:
            update_stock(db, item.product_id, item.quantity, models.OperationType.receipt, "Supplier -> Warehouse")
            
    db.commit()
    db.refresh(db_receipt)
    return db_receipt

@router.put("/receipts/{receipt_id}/validate")
def validate_receipt(receipt_id: int, db: Session = Depends(database.get_db)):
    db_receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not db_receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if db_receipt.status == models.DocumentStatus.done:
        raise HTTPException(status_code=400, detail="Already validated")
        
    db_receipt.status = models.DocumentStatus.done
    for item in db_receipt.items:
        update_stock(db, item.product_id, item.quantity, models.OperationType.receipt, "Supplier -> Warehouse")
        
    db.commit()
    return {"message": "Receipt validated successfully"}

# --- Deliveries (Outgoing) ---
@router.post("/deliveries", response_model=schemas.DeliveryResponse)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(database.get_db)):
    db_delivery = models.Delivery(customer=delivery.customer, status=delivery.status)
    db.add(db_delivery)
    db.flush()
    
    for item in delivery.items:
        db_item = models.DeliveryItem(delivery_id=db_delivery.id, product_id=item.product_id, quantity=item.quantity)
        db.add(db_item)
        
        if delivery.status == models.DocumentStatus.done:
            update_stock(db, item.product_id, -item.quantity, models.OperationType.delivery, "Warehouse -> Customer")
            
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@router.put("/deliveries/{delivery_id}/validate")
def validate_delivery(delivery_id: int, db: Session = Depends(database.get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if db_delivery.status == models.DocumentStatus.done:
        raise HTTPException(status_code=400, detail="Already validated")
        
    db_delivery.status = models.DocumentStatus.done
    for item in db_delivery.items:
        update_stock(db, item.product_id, -item.quantity, models.OperationType.delivery, "Warehouse -> Customer")
        
    db.commit()
    return {"message": "Delivery validated successfully"}

# --- Internal Transfers ---
@router.post("/transfers", response_model=schemas.TransferResponse)
def create_transfer(transfer: schemas.TransferCreate, db: Session = Depends(database.get_db)):
    db_transfer = models.Transfer(from_location=transfer.from_location, to_location=transfer.to_location, status=transfer.status)
    db.add(db_transfer)
    db.flush()
    
    for item in transfer.items:
        db_item = models.TransferItem(transfer_id=db_transfer.id, product_id=item.product_id, quantity=item.quantity)
        db.add(db_item)
        
        if transfer.status == models.DocumentStatus.done:
            # Transfer doesn't change total stock, just moves location. But we log it.
            update_stock(db, item.product_id, 0, models.OperationType.transfer, f"{transfer.from_location} -> {transfer.to_location}")
            
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

# --- Adjustments ---
@router.post("/adjustments")
def create_adjustment(adjustment: schemas.StockLedgerBase, db: Session = Depends(database.get_db)):
    # Create ledger entry
    update_stock(db, adjustment.product_id, adjustment.quantity, models.OperationType.adjustment, adjustment.location)
    db.commit()
    return {"message": "Adjustment created successfully"}


# --- Helper Function for Stock Updates ---
def update_stock(db: Session, product_id: int, quantity_change: float, operation: models.OperationType, location: str):
    # 1. Add to ledger
    ledger_entry = models.StockLedger(
        product_id=product_id,
        operation_type=operation,
        quantity=quantity_change,
        location=location
    )
    db.add(ledger_entry)
    
    # 2. Update actual product stock quantity (cache)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        product.stock_quantity += quantity_change
