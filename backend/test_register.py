import asyncio
from database import connect_db, get_db
from auth.jwt_handler import hash_password

async def test():
    await connect_db()
    db = get_db()
    
    # Test password hashing
    hashed = hash_password("test123")
    print(f"Password hash: {hashed[:20]}...")
    
    # Test database insert
    user = {
        "email": "debug@test.com",
        "password": hashed,
        "full_name": "Debug User",
        "role": "user",
        "is_active": True
    }
    
    try:
        result = await db.users.insert_one(user)
        print(f"✅ User created: {result.inserted_id}")
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test())