from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ThreatReport(BaseModel):
    title: str
    description: str
    threat_type: str
    severity: str
    mitre_attack_id: Optional[str] = None
    indicators: List[str] = Field(default_factory=list)
    location: Optional[dict] = None
    country: Optional[str] = None
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"
    blockchain_hash: Optional[str] = None
    ai_classification: Optional[dict] = None

class ThreatResponse(ThreatReport):
    id: str = Field(alias="_id")

class ThreatUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    mitre_attack_id: Optional[str] = None