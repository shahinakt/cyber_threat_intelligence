import jwt, os
from fastapi import HTTPException, Header
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("JWT_SECRET", "secret")

def create_token(username):
    return jwt.encode({"username": username}, SECRET, algorithm="HS256")

def verify_token(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[-1]
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload.get("username")
    except:
        raise HTTPException(status_code=403, detail="Invalid token")
    