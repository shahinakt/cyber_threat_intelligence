from fastapi import APIRouter, Depends
from pydantic import BaseModel
from routers.auth import get_current_user
from chatbot.chatbot_engine import ChatbotEngine

router = APIRouter()
chatbot = ChatbotEngine()

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    confidence: float
    intent: str

@router.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage, current_user: dict = Depends(get_current_user)):
    response = chatbot.get_response(msg.message)
    return ChatResponse(**response)

@router.get("/intents")
async def get_available_intents(current_user: dict = Depends(get_current_user)):
    return {"intents": chatbot.get_intents()}