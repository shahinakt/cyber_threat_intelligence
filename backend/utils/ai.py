import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle
import os

# MITRE ATT&CK technique mapping
MITRE_MAPPING = {
    "malware": ["T1055", "T1059", "T1204"],  # Process Injection, Command Execution, User Execution
    "phishing": ["T1566", "T1598"],  # Phishing, Phishing for Information
    "ransomware": ["T1486", "T1490"],  # Data Encrypted, Inhibit System Recovery
    "ddos": ["T1498", "T1499"],  # Network DoS, Endpoint DoS
    "data_breach": ["T1567", "T1041"],  # Exfiltration Over Web Service, C2
    "sql_injection": ["T1190"],  # Exploit Public-Facing Application
    "xss": ["T1189"],  # Drive-by Compromise
}

# Severity keywords for classification
SEVERITY_KEYWORDS = {
    "critical": ["ransomware", "breach", "zero-day", "exploit", "compromised", "stolen credentials"],
    "high": ["malware", "trojan", "backdoor", "privilege escalation", "lateral movement"],
    "medium": ["phishing", "suspicious", "scan", "probe", "attempted"],
    "low": ["informational", "alert", "notification", "warning"]
}

def classify_threat(description: str, threat_type: str) -> dict:
    """
    Classifies threat using keyword matching and returns MITRE ATT&CK mapping
    """
    description_lower = description.lower()
    
    # Determine severity based on keywords
    severity_score = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for severity, keywords in SEVERITY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in description_lower:
                severity_score[severity] += 1
    
    predicted_severity = max(severity_score, key=severity_score.get)
    if sum(severity_score.values()) == 0:
        predicted_severity = "medium"
    
    # Get MITRE ATT&CK techniques
    mitre_techniques = MITRE_MAPPING.get(threat_type, [])
    
    # Confidence score (simple heuristic)
    confidence = min(0.95, 0.6 + (sum(severity_score.values()) * 0.1))
    
    return {
        "predicted_severity": predicted_severity,
        "confidence": round(confidence, 2),
        "mitre_techniques": mitre_techniques,
        "threat_indicators": extract_indicators(description)
    }

def extract_indicators(text: str) -> dict:
    """
    Extract IoCs (IPs, domains, hashes) using regex patterns
    """
    import re
    
    indicators = {
        "ips": [],
        "domains": [],
        "hashes": []
    }
    
    # IP pattern
    ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    indicators["ips"] = re.findall(ip_pattern, text)
    
    # Domain pattern
    domain_pattern = r'\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b'
    indicators["domains"] = re.findall(domain_pattern, text)
    
    # Hash patterns (MD5, SHA1, SHA256)
    hash_patterns = [
        r'\b[a-fA-F0-9]{32}\b',  # MD5
        r'\b[a-fA-F0-9]{40}\b',  # SHA1
        r'\b[a-fA-F0-9]{64}\b'   # SHA256
    ]
    for pattern in hash_patterns:
        indicators["hashes"].extend(re.findall(pattern, text))
    
    return indicators

def analyze_with_cv(image_path: str) -> dict:
    """
    Computer vision analysis for screenshot-based threat detection
    """
    import cv2
    
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Failed to load image"}
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect edges (useful for UI anomaly detection)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges) / (img.shape[0] * img.shape[1])
        
        # Color analysis for phishing detection (unusual color schemes)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        dominant_color = np.mean(hsv, axis=(0, 1))
        
        return {
            "edge_density": float(edge_density),
            "dominant_hue": float(dominant_color[0]),
            "is_suspicious": edge_density > 0.3,  # High edge density might indicate spoofed UI
            "analysis": "Computer vision analysis completed"
        }
    except Exception as e:
        return {"error": str(e)}