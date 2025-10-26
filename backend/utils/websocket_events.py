from websocket import websocket_manager
from typing import Dict, Any
from datetime import datetime

async def broadcast_threat_alert(threat_data: Dict[Any, Any]):
    """Broadcast new threat alert to all connected clients"""
    message = {
        "type": "threat_alert",
        "data": {
            "id": threat_data.get("id"),
            "title": threat_data.get("title"),
            "severity": threat_data.get("severity"),
            "threat_type": threat_data.get("threat_type"),
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    await websocket_manager.notify_threat(message)

async def send_user_notification(user_id: str, notification: Dict[Any, Any]):
    """Send notification to specific user"""
    message = {
        "type": "notification",
        "data": notification
    }
    await websocket_manager.send_personal_message(message, user_id)

async def broadcast_system_message(message_text: str, level: str = "info"):
    """Broadcast system-wide message"""
    message = {
        "type": "system_message",
        "data": {
            "message": message_text,
            "level": level,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    await websocket_manager.broadcast(str(message))

async def notify_threat_update(threat_id: str, status: str):
    """Notify about threat status update"""
    message = {
        "type": "threat_update",
        "data": {
            "threat_id": threat_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    await websocket_manager.broadcast(str(message))