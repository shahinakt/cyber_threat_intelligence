from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class ChatResponse(BaseModel):
    response: str
    confidence: float
    intent: str
    timestamp: datetime = datetime.utcnow()

class ChatHistory(BaseModel):
    user_id: str
    messages: list
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()