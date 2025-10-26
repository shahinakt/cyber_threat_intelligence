from database import get_db
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId

async def get_pending_threats(limit: int = 100) -> List[Dict]:
    """Get all pending threat reports"""
    db = get_db()
    cursor = db.threats.find({"status": "pending"}).sort("timestamp", -1).limit(limit)
    threats = await cursor.to_list(length=limit)
    return threats

async def moderate_threat(threat_id: str, status: str, moderator_id: str) -> bool:
    """Moderate a threat report"""
    db = get_db()
    
    valid_statuses = ["verified", "flagged", "resolved", "rejected"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of {valid_statuses}")
    
    result = await db.threats.update_one(
        {"_id": ObjectId(threat_id)},
        {
            "$set": {
                "status": status,
                "moderated_by": moderator_id,
                "moderated_at": datetime.utcnow()
            }
        }
    )
    
    return result.modified_count > 0

async def get_flagged_threats(limit: int = 50) -> List[Dict]:
    """Get all flagged threat reports"""
    db = get_db()
    cursor = db.threats.find({"status": "flagged"}).sort("timestamp", -1).limit(limit)
    threats = await cursor.to_list(length=limit)
    return threats

async def bulk_moderate_threats(threat_ids: List[str], status: str, moderator_id: str) -> int:
    """Bulk moderate multiple threats"""
    db = get_db()
    
    object_ids = [ObjectId(tid) for tid in threat_ids]
    
    result = await db.threats.update_many(
        {"_id": {"$in": object_ids}},
        {
            "$set": {
                "status": status,
                "moderated_by": moderator_id,
                "moderated_at": datetime.utcnow()
            }
        }
    )
    
    return result.modified_count

async def get_user_activity(user_id: str) -> Dict:
    """Get user activity statistics"""
    db = get_db()
    
    total_reports = await db.threats.count_documents({"user_id": user_id})
    verified_reports = await db.threats.count_documents({
        "user_id": user_id,
        "status": "verified"
    })
    flagged_reports = await db.threats.count_documents({
        "user_id": user_id,
        "status": "flagged"
    })
    
    # Get recent reports
    recent = await db.threats.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(5).to_list(length=5)
    
    return {
        "total_reports": total_reports,
        "verified_reports": verified_reports,
        "flagged_reports": flagged_reports,
        "verification_rate": verified_reports / total_reports if total_reports > 0 else 0,
        "recent_reports": [
            {
                "id": str(r["_id"]),
                "title": r["title"],
                "status": r["status"],
                "timestamp": r["timestamp"]
            }
            for r in recent
        ]
    }

async def moderate_user(user_id: str, is_active: bool, reason: Optional[str] = None) -> bool:
    """Activate or deactivate a user"""
    db = get_db()
    
    update_data = {
        "is_active": is_active,
        "moderated_at": datetime.utcnow()
    }
    
    if reason:
        update_data["moderation_reason"] = reason
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    return result.modified_count > 0

async def get_moderation_statistics() -> Dict:
    """Get overall moderation statistics"""
    db = get_db()
    
    total_threats = await db.threats.count_documents({})
    pending_threats = await db.threats.count_documents({"status": "pending"})
    verified_threats = await db.threats.count_documents({"status": "verified"})
    flagged_threats = await db.threats.count_documents({"status": "flagged"})
    resolved_threats = await db.threats.count_documents({"status": "resolved"})
    
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    inactive_users = await db.users.count_documents({"is_active": False})
    
    return {
        "threats": {
            "total": total_threats,
            "pending": pending_threats,
            "verified": verified_threats,
            "flagged": flagged_threats,
            "resolved": resolved_threats
        },
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users
        },
        "pending_review_percentage": (pending_threats / total_threats * 100) if total_threats > 0 else 0
    }

async def add_moderation_note(threat_id: str, moderator_id: str, note: str) -> bool:
    """Add a moderation note to a threat"""
    db = get_db()
    
    moderation_note = {
        "moderator_id": moderator_id,
        "note": note,
        "timestamp": datetime.utcnow()
    }
    
    result = await db.threats.update_one(
        {"_id": ObjectId(threat_id)},
        {"$push": {"moderation_notes": moderation_note}}
    )
    
    return result.modified_count > 0

async def get_top_contributors(limit: int = 10) -> List[Dict]:
    """Get top threat reporters"""
    db = get_db()
    
    pipeline = [
        {
            "$group": {
                "_id": "$user_id",
                "total_reports": {"$sum": 1},
                "verified_reports": {
                    "$sum": {"$cond": [{"$eq": ["$status", "verified"]}, 1, 0]}
                }
            }
        },
        {"$sort": {"total_reports": -1}},
        {"$limit": limit}
    ]
    
    contributors = await db.threats.aggregate(pipeline).to_list(length=limit)
    
    # Get user details
    result = []
    for contrib in contributors:
        user = await db.users.find_one({"_id": ObjectId(contrib["_id"])})
        if user:
            result.append({
                "user_id": contrib["_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "total_reports": contrib["total_reports"],
                "verified_reports": contrib["verified_reports"]
            })
    
    return result