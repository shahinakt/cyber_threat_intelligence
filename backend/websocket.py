from fastapi import WebSocket
from typing import Dict
import json

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

    async def broadcast(self, message: str, sender_id: str = None):
        for user_id, connection in self.active_connections.items():
            if user_id != sender_id:
                try:
                    await connection.send_text(message)
                except:
                    self.disconnect(user_id)

    async def notify_threat(self, threat_data: dict):
        message = {
            "type": "threat_alert",
            "data": threat_data
        }
        for connection in self.active_connections.values():
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

websocket_manager = WebSocketManager()