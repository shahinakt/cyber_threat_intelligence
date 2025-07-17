from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Threat(BaseModel):
    type: str
    description: Optional[str] = None
    created_at: Optional[datetime] = datetime.utcnow()
    