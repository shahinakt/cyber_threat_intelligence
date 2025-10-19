from fastapi import APIRouter, Depends
from routers.auth import get_current_user
from database import get_db
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    # Total threats
    total_threats = await db.threats.count_documents({})
    
    # Threats by severity
    severity_pipeline = [
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
    ]
    severity_data = await db.threats.aggregate(severity_pipeline).to_list(None)
    severity_counts = {item["_id"]: item["count"] for item in severity_data}
    
    # Threats by type
    type_pipeline = [
        {"$group": {"_id": "$threat_type", "count": {"$sum": 1}}}
    ]
    type_data = await db.threats.aggregate(type_pipeline).to_list(None)
    type_counts = {item["_id"]: item["count"] for item in type_data}
    
    # Recent threats (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_count = await db.threats.count_documents({
        "timestamp": {"$gte": week_ago}
    })
    
    # Top countries
    country_pipeline = [
        {"$match": {"country": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    country_data = await db.threats.aggregate(country_pipeline).to_list(None)
    
    return {
        "total_threats": total_threats,
        "recent_threats": recent_count,
        "severity_distribution": severity_counts,
        "type_distribution": type_counts,
        "top_countries": [{"country": item["_id"], "count": item["count"]} for item in country_data]
    }

@router.get("/timeline")
async def get_threat_timeline(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$timestamp"},
                    "month": {"$month": "$timestamp"},
                    "day": {"$dayOfMonth": "$timestamp"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    timeline_data = await db.threats.aggregate(pipeline).to_list(None)
    
    formatted_data = [
        {
            "date": f"{item['_id']['year']}-{item['_id']['month']:02d}-{item['_id']['day']:02d}",
            "count": item["count"]
        }
        for item in timeline_data
    ]
    
    return {"timeline": formatted_data}

@router.get("/user-stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    # User's submitted threats
    user_threats = await db.threats.count_documents({"user_id": user_id})
    
    # User's threat breakdown
    severity_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
    ]
    severity_data = await db.threats.aggregate(severity_pipeline).to_list(None)
    
    return {
        "total_submitted": user_threats,
        "severity_breakdown": {item["_id"]: item["count"] for item in severity_data},
        "user_since": current_user["created_at"]
    }

@router.get("/mitre-mapping")
async def get_mitre_mapping(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    pipeline = [
        {"$match": {"mitre_attack_id": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$mitre_attack_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]
    
    mitre_data = await db.threats.aggregate(pipeline).to_list(None)
    
    return {
        "mitre_techniques": [
            {"technique_id": item["_id"], "count": item["count"]}
            for item in mitre_data
        ]
    }

@router.get("/threat-map")
async def get_threat_map(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    pipeline = [
        {
            "$match": {
                "location": {"$exists": True, "$ne": None}
            }
        },
        {
            "$group": {
                "_id": {
                    "coordinates": "$location.coordinates",
                    "country": "$country"
                },
                "count": {"$sum": 1},
                "severity": {"$push": "$severity"}
            }
        },
        {"$limit": 500}
    ]
    
    map_data = await db.threats.aggregate(pipeline).to_list(None)
    
    formatted_data = []
    for item in map_data:
        if item["_id"]["coordinates"]:
            formatted_data.append({
                "coordinates": item["_id"]["coordinates"],
                "country": item["_id"].get("country", "Unknown"),
                "count": item["count"],
                "severity": max(item["severity"], key=item["severity"].count) if item["severity"] else "medium"
            })
    
    return {"locations": formatted_data}