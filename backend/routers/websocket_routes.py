from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from websocket import websocket_manager
from routers.auth import get_current_user
import json

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get("type")
                
                # Handle different message types
                if message_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                
                elif message_type == "subscribe_threats":
                    # Client wants to subscribe to threat updates
                    await websocket.send_text(json.dumps({
                        "type": "subscribed",
                        "channel": "threats"
                    }))
                
                else:
                    # Broadcast message to other users
                    await websocket_manager.broadcast(data, user_id)
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON"
                }))
    
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        websocket_manager.disconnect(user_id)