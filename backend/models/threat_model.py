from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ThreatReport(BaseModel):
    title: str
    description: str
    threat_type: str  # malware, phishing, ransomware, ddos, data_breach, etc.
    severity: str  # low, medium, high, critical
    mitre_attack_id: Optional[str] = None  # MITRE ATT&CK technique ID
    indicators: List[str] = []  # IPs, domains, hashes
    location: Optional[dict] = None  # {type: "Point", coordinates: [lng, lat]}
    country: Optional[str] = None
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, verified, flagged, resolved
    blockchain_hash: Optional[str] = None
    ai_classification: Optional[dict] = None

class ThreatResponse(ThreatReport):
    id: str = Field(alias="_id")

class ThreatUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    mitre_attack_id: Optional[str] = None