from fastapi import APIRouter, Depends
from models.threat import Threat
from database import db
from utils.jwt_handler import verify_token

router = APIRouter(prefix="/threat", tags=["threat"])

@router.post("/report")
def report_threat(threat: Threat, user=Depends(verify_token)):
    db.threats.insert_one({**threat.dict(), "username": user})
    return {"message": "Threat reported"}

@router.get("/my")
def get_user_threats(user=Depends(verify_token)):
    return list(db.threats.find({"username": user}))
