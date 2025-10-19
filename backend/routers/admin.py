from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from database import get_db
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

def admin_only(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

class ThreatModeration(BaseModel):
    status: str  # verified, flagged, resolved

@router.get("/threats/pending")
async def get_pending_threats(admin: dict = Depends(admin_only)):
    db = get_db()
    threats = await db.threats.find({"status": "pending"}).sort("timestamp", -1).limit(50).to_list(50)
    
    return [
        {
            "id": str(t["_id"]),
            "title": t["title"],
            "severity": t["severity"],
            "threat_type": t["threat_type"],
            "timestamp": t["timestamp"]
        }
        for t in threats
    ]

@router.patch("/threats/{threat_id}/moderate")
async def moderate_threat(
    threat_id: str,
    moderation: ThreatModeration,
    admin: dict = Depends(admin_only)
):
    db = get_db()
    
    result = await db.threats.update_one(
        {"_id": ObjectId(threat_id)},
        {"$set": {"status": moderation.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    return {"message": "Threat moderated successfully"}

@router.get("/users")
async def get_all_users(admin: dict = Depends(admin_only)):
    db = get_db()
    users = await db.users.find({}, {"password": 0}).to_list(100)
    
    return [
        {
            "id": str(u["_id"]),
            "email": u["email"],
            "full_name": u["full_name"],
            "role": u.get("role", "user"),
            "is_active": u.get("is_active", True),
            "created_at": u["created_at"]
        }
        for u in users
    ]

@router.patch("/users/{user_id}/toggle")
async def toggle_user_status(user_id: str, admin: dict = Depends(admin_only)):
    db = get_db()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_active", True)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status}}
    )
    
    return {"message": f"User {'activated' if new_status else 'deactivated'}"}

@router.delete("/threats/{threat_id}")
async def delete_threat_admin(threat_id: str, admin: dict = Depends(admin_only)):
    db = get_db()
    
    result = await db.threats.delete_one({"_id": ObjectId(threat_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    return {"message": "Threat deleted successfully"}