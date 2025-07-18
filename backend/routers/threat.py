from fastapi import APIRouter, Depends, HTTPException
from models.threat import Threat
from database import db
from utils.jwt_handler import verify_token
from bson import ObjectId 

router = APIRouter(prefix="/threat", tags=["threat"])

@router.post("/report")
def report_threat(threat: Threat, user=Depends(verify_token)):
    try:
        threat_dict = threat.dict()
        threat_dict["username"] = user
        db.threats.insert_one(threat_dict)
        return {"message": "Threat reported"}
    except Exception as e:
        print("🔥 Report Error:", e)
        raise HTTPException(status_code=500, detail="Report submission failed")


@router.get("/my")
def get_user_threats(user=Depends(verify_token)):
    try:
        threats = list(db.threats.find({"username": user}, {"_id": 0}))  # ✅ Already excluding _id
        return threats
    except Exception as e:
        print("🔥 Get User Threats Error:", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve threats")