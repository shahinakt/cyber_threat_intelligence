from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Notification(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"  # info, warning, alert, threat_alert
    severity: str = "medium"  # low, medium, high, critical
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    link: Optional[str] = None
    metadata: Optional[dict] = None

class NotificationResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    message: str
    type: str
    severity: str
    read: bool
    created_at: datetime
    link: Optional[str] = None

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    severity: str = "medium"
    link: Optional[str] = None