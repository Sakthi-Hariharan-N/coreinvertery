from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import Role, DocumentStatus, OperationType

# --- User ---
class UserBase(BaseModel):
    name: str
    email: str
    role: Role = Role.staff

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    unit: str
    stock_quantity: float = 0.0

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Warehouse ---
class WarehouseBase(BaseModel):
    name: str
    location: str

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    class Config:
        from_attributes = True

# --- Receipt ---
class ReceiptItemBase(BaseModel):
    product_id: int
    quantity: float

class ReceiptItemCreate(ReceiptItemBase):
    pass

class ReceiptItemResponse(ReceiptItemBase):
    id: int
    receipt_id: int
    class Config:
        from_attributes = True

class ReceiptBase(BaseModel):
    supplier: str
    status: DocumentStatus = DocumentStatus.draft

class ReceiptCreate(ReceiptBase):
    items: List[ReceiptItemCreate]

class ReceiptResponse(ReceiptBase):
    id: int
    date: datetime
    items: List[ReceiptItemResponse] = []
    class Config:
        from_attributes = True

# --- Delivery ---
class DeliveryItemBase(BaseModel):
    product_id: int
    quantity: float

class DeliveryItemCreate(DeliveryItemBase):
    pass

class DeliveryItemResponse(DeliveryItemBase):
    id: int
    delivery_id: int
    class Config:
        from_attributes = True

class DeliveryBase(BaseModel):
    customer: str
    status: DocumentStatus = DocumentStatus.draft

class DeliveryCreate(DeliveryBase):
    items: List[DeliveryItemCreate]

class DeliveryResponse(DeliveryBase):
    id: int
    date: datetime
    items: List[DeliveryItemResponse] = []
    class Config:
        from_attributes = True

# --- Transfer ---
class TransferItemBase(BaseModel):
    product_id: int
    quantity: float

class TransferItemCreate(TransferItemBase):
    pass

class TransferItemResponse(TransferItemBase):
    id: int
    transfer_id: int
    class Config:
        from_attributes = True

class TransferBase(BaseModel):
    from_location: str
    to_location: str
    status: DocumentStatus = DocumentStatus.draft

class TransferCreate(TransferBase):
    items: List[TransferItemCreate]

class TransferResponse(TransferBase):
    id: int
    date: datetime
    items: List[TransferItemResponse] = []
    class Config:
        from_attributes = True

# --- Stock Ledger ---
class StockLedgerBase(BaseModel):
    product_id: int
    operation_type: OperationType
    quantity: float
    location: str

class StockLedgerResponse(StockLedgerBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# --- Auth ---
class OTPVerifyRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
