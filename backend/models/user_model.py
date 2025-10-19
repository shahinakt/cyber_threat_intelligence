from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: Optional[str] = None
    role: str = "user"  # user, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserInDB(User):
    id: str = Field(alias="_id")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization: Optional[str]
    role: str
    created_at: datetime