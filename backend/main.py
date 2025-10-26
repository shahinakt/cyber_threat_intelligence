from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
from contextlib import asynccontextmanager
import uvicorn
from database import connect_db, close_db, get_db
from routers import auth, threats, dashboard, chatbot, blockchain, notifications, phishing, malware_scan, admin
from websocket import websocket_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="Cyber Threat Intelligence Platform", lifespan=lifespan)

# Configure basic logging to ensure exception traces from routers are visible
logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# Make sure uvicorn loggers propagate to the root logger
logging.getLogger("uvicorn.error").handlers = logging.getLogger().handlers
logging.getLogger("uvicorn.access").handlers = logging.getLogger().handlers

app.add_middleware(
    CORSMiddleware,
    # Allow the frontend dev server origin. Using a specific origin is safer
    # and avoids issues when allow_credentials=True together with a wildcard.
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(threats.router, prefix="/api/threats", tags=["threats"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(phishing.router, prefix="/api/phishing", tags=["phishing"])
app.include_router(malware_scan.router, prefix="/api/malware", tags=["malware"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket_manager.broadcast(data, user_id)
    except:
        websocket_manager.disconnect(user_id)

@app.get("/")
async def root():
    return {"message": "Cyber Threat Intelligence Platform API", "status": "active"}


@app.get("/health")
async def health():
    """Basic health check to verify app and DB connection."""
    db = get_db()
    return {
        "status": "ok" if db is not None else "error",
        "db_connected": db is not None,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)