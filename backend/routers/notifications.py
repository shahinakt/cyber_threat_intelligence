from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from database import get_db
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    notifications = await db.notifications.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    return [
        {
            "id": str(n["_id"]),
            "message": n["message"],
            "type": n.get("type", "info"),
            "timestamp": n["timestamp"],
            "read": n.get("read", False)
        }
        for n in notifications
    ]

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    return {"message": "Marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    await db.notifications.delete_one({"_id": ObjectId(notification_id)})
    
    return {"message": "Notification deleted"}