from fastapi import APIRouter, Depends
from pydantic import BaseModel
from routers.auth import get_current_user
from utils.phishing import analyze_url, check_email_phishing

router = APIRouter()

class URLScan(BaseModel):
    url: str

class EmailScan(BaseModel):
    email_body: str
    sender: str

@router.post("/scan-url")
async def scan_url(data: URLScan, current_user: dict = Depends(get_current_user)):
    result = analyze_url(data.url)
    return result

@router.post("/scan-email")
async def scan_email(data: EmailScan, current_user: dict = Depends(get_current_user)):
    result = check_email_phishing(data.email_body, data.sender)
    return result