from database import get_db
from datetime import datetime
from typing import Dict, List

async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    severity: str = "medium"
) -> str:
    """Create a notification for a user"""
    db = get_db()
    
    notification = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "severity": severity,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.notifications.insert_one(notification)
    return str(result.inserted_id)

async def get_user_notifications(user_id: str, limit: int = 20) -> List[Dict]:
    """Get notifications for a user"""
    db = get_db()
    
    cursor = db.notifications.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    
    notifications = await cursor.to_list(length=limit)
    
    return [
        {
            "id": str(n["_id"]),
            "title": n["title"],
            "message": n["message"],
            "type": n["type"],
            "severity": n["severity"],
            "read": n["read"],
            "created_at": n["created_at"]
        }
        for n in notifications
    ]

async def mark_notification_read(notification_id: str) -> bool:
    """Mark notification as read"""
    db = get_db()
    from bson import ObjectId
    
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    return result.modified_count > 0

async def broadcast_threat_notification(threat_data: Dict):
    """Create notifications for all users about a new threat"""
    db = get_db()
    
    # Get all active users
    users = await db.users.find({"is_active": True}).to_list(length=None)
    
    notifications = []
    for user in users:
        notification = {
            "user_id": str(user["_id"]),
            "title": f"New {threat_data['severity']} threat detected",
            "message": f"{threat_data['title']}: {threat_data['description'][:100]}...",
            "type": "threat_alert",
            "severity": threat_data["severity"],
            "read": False,
            "created_at": datetime.utcnow()
        }
        notifications.append(notification)
    
    if notifications:
        await db.notifications.insert_many(notifications)

async def clear_old_notifications(days: int = 30):
    """Clear notifications older than specified days"""
    db = get_db()
    from datetime import timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    result = await db.notifications.delete_many({
        "created_at": {"$lt": cutoff_date},
        "read": True
    })
    
    return result.deleted_count