from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from models.threat_model import ThreatReport, ThreatResponse, ThreatUpdate
from routers.auth import get_current_user
from database import get_db
from utils.ai import classify_threat
from utils.blockchain import log_to_blockchain
from websocket import websocket_manager
from datetime import datetime

router = APIRouter()

@router.post("/report", response_model=dict)
async def report_threat(threat: ThreatReport, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    threat_dict = threat.dict()
    threat_dict["user_id"] = str(current_user["_id"])
    threat_dict["timestamp"] = datetime.utcnow()
    threat_dict["status"] = "pending"
    
    # AI classification
    ai_result = classify_threat(threat.description, threat.threat_type)
    threat_dict["ai_classification"] = ai_result
    
    # Insert to database
    result = await db.threats.insert_one(threat_dict)
    threat_id = str(result.inserted_id)
    
    # Log to blockchain (async)
    try:
        blockchain_hash = log_to_blockchain(threat_id, threat_dict)
        await db.threats.update_one(
            {"_id": result.inserted_id},
            {"$set": {"blockchain_hash": blockchain_hash}}
        )
    except Exception as e:
        print(f"Blockchain logging failed: {e}")
    
    # Real-time notification
    await websocket_manager.notify_threat({
        "id": threat_id,
        "title": threat.title,
        "severity": threat.severity,
        "threat_type": threat.threat_type
    })
    
    return {
        "message": "Threat reported successfully",
        "threat_id": threat_id,
        "ai_classification": ai_result
    }

@router.get("/", response_model=List[ThreatResponse])
async def get_threats(
    limit: int = 50,
    severity: Optional[str] = None,
    threat_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    query = {}
    
    if severity:
        query["severity"] = severity
    if threat_type:
        query["threat_type"] = threat_type
    
    cursor = db.threats.find(query).sort("timestamp", -1).limit(limit)
    threats = await cursor.to_list(length=limit)
    
    return [ThreatResponse(id=str(t["_id"]), **{k: v for k, v in t.items() if k != "_id"}) for t in threats]

@router.get("/{threat_id}", response_model=ThreatResponse)
async def get_threat(threat_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    from bson import ObjectId
    
    threat = await db.threats.find_one({"_id": ObjectId(threat_id)})
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    return ThreatResponse(id=str(threat["_id"]), **{k: v for k, v in threat.items() if k != "_id"})

@router.patch("/{threat_id}", response_model=dict)
async def update_threat(
    threat_id: str,
    update: ThreatUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    from bson import ObjectId
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    result = await db.threats.update_one(
        {"_id": ObjectId(threat_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    return {"message": "Threat updated successfully"}

@router.delete("/{threat_id}")
async def delete_threat(threat_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    from bson import ObjectId
    
    # Only admin or threat owner can delete
    threat = await db.threats.find_one({"_id": ObjectId(threat_id)})
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    if threat["user_id"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.threats.delete_one({"_id": ObjectId(threat_id)})
    return {"message": "Threat deleted successfully"}