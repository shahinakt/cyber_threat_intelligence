from fastapi import APIRouter, HTTPException
from models.user import User
from database import db
from utils.jwt_handler import create_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: User):
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="User already exists")
    db.users.insert_one(user.dict())
    return {"message": "User registered"}

@router.post("/login")
def login(user: User):
    if not db.users.find_one({"username": user.username, "password": user.password}):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user.username)
    return {"token": token}