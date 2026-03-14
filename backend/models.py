import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from .database import Base

class Role(str, enum.Enum):
    manager = "manager"
    staff = "staff"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.staff)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    unit = Column(String)
    stock_quantity = Column(Float, default=0.0)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)

class DocumentStatus(str, enum.Enum):
    draft = "Draft"
    waiting = "Waiting"
    ready = "Ready"
    done = "Done"
    canceled = "Canceled"

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    supplier = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.draft)
    items = relationship("ReceiptItem", back_populates="receipt")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)
    product = relationship("Product")
    receipt = relationship("Receipt", back_populates="items")

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.draft)
    items = relationship("DeliveryItem", back_populates="delivery")

class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)
    product = relationship("Product")
    delivery = relationship("Delivery", back_populates="items")

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String)
    to_location = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.draft)
    items = relationship("TransferItem", back_populates="transfer")

class TransferItem(Base):
    __tablename__ = "transfer_items"
    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("transfers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)
    product = relationship("Product")
    transfer = relationship("Transfer", back_populates="items")

class OperationType(str, enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    transfer = "transfer"
    adjustment = "adjustment"

class StockLedger(Base):
    __tablename__ = "stock_ledger"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    operation_type = Column(Enum(OperationType))
    quantity = Column(Float) # Can be positive or negative
    location = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    product = relationship("Product")
