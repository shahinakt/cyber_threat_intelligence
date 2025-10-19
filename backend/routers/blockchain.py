from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from utils.blockchain import verify_blockchain_record, get_blockchain_stats

router = APIRouter()

@router.get("/stats")
async def blockchain_stats(current_user: dict = Depends(get_current_user)):
    return get_blockchain_stats()

@router.get("/verify/{threat_id}")
async def verify_threat(threat_id: str, current_user: dict = Depends(get_current_user)):
    from database import get_db
    from bson import ObjectId
    
    db = get_db()
    threat = await db.threats.find_one({"_id": ObjectId(threat_id)})
    
    if not threat:
        return {"verified": False, "message": "Threat not found"}
    
    blockchain_hash = threat.get("blockchain_hash")
    if not blockchain_hash:
        return {"verified": False, "message": "No blockchain record"}
    
    is_verified = verify_blockchain_record(threat_id, blockchain_hash)
    
    return {
        "verified": is_verified,
        "blockchain_hash": blockchain_hash,
        "message": "Verified on blockchain" if is_verified else "Verification failed"
    }