import os
import hashlib
from typing import Optional
from datetime import datetime
import aiofiles

UPLOAD_DIR = "static/uploads"
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'exe', 'dll', 'zip', 'rar'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def ensure_upload_directory():
    """Ensure upload directory exists"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename with timestamp"""
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    name, ext = os.path.splitext(original_filename)
    safe_name = "".join(c for c in name if c.isalnum() or c in ('-', '_'))[:50]
    return f"{safe_name}_{timestamp}{ext}"

async def save_upload_file(file_content: bytes, filename: str) -> str:
    """Save uploaded file and return path"""
    ensure_upload_directory()
    
    unique_filename = generate_unique_filename(filename)
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(file_content)
    
    return file_path

def delete_file(file_path: str) -> bool:
    """Delete file from disk"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    return False

def get_file_hash(file_path: str) -> dict:
    """Calculate file hashes"""
    hash_md5 = hashlib.md5()
    hash_sha256 = hashlib.sha256()
    
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            hash_md5.update(chunk)
            hash_sha256.update(chunk)
    
    return {
        'md5': hash_md5.hexdigest(),
        'sha256': hash_sha256.hexdigest()
    }

def get_file_info(file_path: str) -> dict:
    """Get file metadata"""
    if not os.path.exists(file_path):
        return None
    
    stat = os.stat(file_path)
    
    return {
        'size': stat.st_size,
        'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
        'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
        'extension': os.path.splitext(file_path)[1]
    }

async def process_threat_screenshot(file_path: str) -> dict:
    """Process screenshot for threat analysis"""
    from utils.ai import analyze_with_cv
    
    result = analyze_with_cv(file_path)
    file_hashes = get_file_hash(file_path)
    
    return {
        "cv_analysis": result,
        "file_hash": file_hashes['sha256'],
        "processed_at": datetime.utcnow().isoformat()
    }