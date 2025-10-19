from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "cyber_threat_intel"

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL, server_api=ServerApi('1'))
    db = client[DB_NAME]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.threats.create_index([("timestamp", -1)])
    await db.threats.create_index([("location", "2dsphere")])
    
    print("✓ Connected to MongoDB")
    return db

async def close_db():
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")

def get_db():
    return db

