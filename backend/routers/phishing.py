from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from routers.auth import get_current_user
from utils.phishing import analyze_url, check_email_phishing, analyze_content
from utils.malware_scanner import basic_file_analysis
import aiofiles
import os

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


@router.post("/scan-file")
async def scan_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Accept a file upload and run phishing-oriented checks:
    - basic file analysis (extension, filename keywords)
    - attempt to decode text and run content analysis for phishing indicators
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        basic_result = basic_file_analysis(file_path)

        # Try to analyze textual content for phishing indicators
        content_text = None
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as fh:
                content_text = fh.read()
        except Exception:
            content_text = None

        content_analysis = None
        if content_text:
            c_score, c_inds = analyze_content(content_text, file.filename)
            content_analysis = {"content_score": c_score, "content_indicators": c_inds}

        # Clean up
        os.remove(file_path)

        return {
            "filename": file.filename,
            "basic_analysis": basic_result,
            "content_analysis": content_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))