from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user_model import UserLogin, UserRegister, UserResponse
from auth.jwt_handler import hash_password, verify_password, create_access_token, decode_access_token
from database import get_db
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    db = get_db()
    user = await db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", response_model=dict)
async def register(user: UserRegister):
    db = get_db()
    
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["role"] = "user"
    user_dict["is_active"] = True
    
    result = await db.users.insert_one(user_dict)
    token = create_access_token({"sub": user.email})
    
    return {
        "message": "Registration successful",
        "token": token,
        "user_id": str(result.inserted_id)
    }

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")
    
    token = create_access_token({"sub": user["email"]})
    
    return {
        "token": token,
        "user_id": str(user["_id"]),
        "role": user.get("role", "user")
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        organization=current_user.get("organization"),
        role=current_user.get("role", "user"),
        created_at=current_user["created_at"]
    )