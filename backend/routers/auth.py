from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .. import models, schemas, database
from datetime import datetime, timedelta
from jose import JWTError, jwt

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key" # For demo purposes
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

import random
from typing import Dict, Any
otp_store: Dict[str, Any] = {}

@router.post("/reset-password-otp")
def reset_password_otp(email: str):
    # Simulated OTP generation
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=10)
    }
    # In a real app we'd email this. For testing/demo, we return it in the response so the frontend can pre-fill or the user can see it
    return {"message": f"OTP sent to {email}. Demo OTP: {otp}", "demo_otp": otp}

@router.post("/reset-password-verify")
def reset_password_verify(req: schemas.OTPVerifyRequest, db: Session = Depends(database.get_db)):
    if req.email not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    
    otp_data = otp_store[req.email]
    if datetime.utcnow() > otp_data["expires"]:
        del otp_store[req.email]
        raise HTTPException(status_code=400, detail="OTP expired")
        
    if otp_data["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    del otp_store[req.email]
    return {"message": "Password reset successfully! You can now login."}
