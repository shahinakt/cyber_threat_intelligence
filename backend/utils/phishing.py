import re
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

SUSPICIOUS_KEYWORDS = [
    "verify", "suspended", "urgent", "click here", "confirm", "password",
    "account", "security", "update", "billing", "paypal", "bank", "prize"
]

SUSPICIOUS_DOMAINS = [
    # Common URL shorteners and redirect services
    "bit.ly", "tinyurl.com", "short.link", "t.co", "ow.ly", "goo.gl",
    "is.gd", "buff.ly", "adf.ly", "bitly.com", "lnkd.in", "rb.gy",
    "shorturl.at", "rebrand.ly", "cutt.ly", "tiny.cc", "soo.gd", "v.gd",
    "short.cm"
]

def analyze_url(url: str) -> dict:
    """
    Analyze URL for phishing indicators
    """
    score = 0
    indicators = []
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Check for IP address instead of domain
        if re.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
            score += 30
            indicators.append("IP address used instead of domain")
        
        # Check for suspicious TLDs
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.zip']
        if any(domain.endswith(tld) for tld in suspicious_tlds):
            score += 25
            indicators.append("Suspicious TLD detected")
        
        # Check URL length
        if len(url) > 75:
            score += 15
            indicators.append("Unusually long URL")
        
        # Check for @ symbol (URL obfuscation)
        if '@' in url:
            score += 30
            indicators.append("@ symbol detected (possible obfuscation)")
        
        # Check for excessive subdomains
        subdomain_count = domain.count('.')
        if subdomain_count > 3:
            score += 20
            indicators.append(f"Excessive subdomains ({subdomain_count})")
        
        # Check for URL shorteners and try to expand them to inspect the final destination
        if any(shortener in domain for shortener in SUSPICIOUS_DOMAINS):
            # Give shorteners slightly higher weight since they often obfuscate targets
            score += 15
            indicators.append("URL shortener detected")
            try:
                # Follow redirects to get final destination (use HEAD for speed)
                resp = requests.head(url, allow_redirects=True, timeout=5)
                final_url = getattr(resp, 'url', None)
                if final_url and final_url != url:
                    final_domain = urlparse(final_url).netloc
                    indicators.append(f"Shortener expands to {final_domain}")
                    # If expanded URL lacks HTTPS, increase score slightly
                    if urlparse(final_url).scheme != 'https':
                        score += 5
                        indicators.append("Expanded URL has no HTTPS")
                    # If final domain is suspicious or another shortener, increase score
                    if any(s in final_domain for s in SUSPICIOUS_DOMAINS):
                        score += 10
                        indicators.append("Expanded destination appears to be a shortener or suspicious domain")
            except Exception:
                # Ignore expansion failures (network/timeouts)
                pass
        
        # Check HTTPS
        if parsed.scheme != 'https':
            score += 10
            indicators.append("No HTTPS encryption")
        
        # Analyze content if accessible
        try:
            response = requests.get(url, timeout=5, allow_redirects=True)
            content_score, content_indicators = analyze_content(response.text, url)
            score += content_score
            indicators.extend(content_indicators)
        except:
            pass
        
        risk_level = "safe"
        if score >= 60:
            risk_level = "high"
        elif score >= 40:
            risk_level = "medium"
        elif score >= 20:
            risk_level = "low"
        
        return {
            "url": url,
            "risk_level": risk_level,
            "risk_score": min(score, 100),
            "indicators": indicators,
            "is_phishing": score >= 40
        }
        
    except Exception as e:
        return {
            "url": url,
            "risk_level": "unknown",
            "risk_score": 0,
            "indicators": [f"Analysis error: {str(e)}"],
            "is_phishing": False
        }

def analyze_content(html: str, url: str) -> tuple:
    """
    Analyze webpage content for phishing indicators
    """
    score = 0
    indicators = []
    
    try:
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text().lower()
        
        # Check for suspicious keywords
        keyword_count = sum(1 for keyword in SUSPICIOUS_KEYWORDS if keyword in text)
        if keyword_count > 3:
            score += 20
            indicators.append(f"Multiple suspicious keywords ({keyword_count})")
        
        # Check for forms (common in phishing)
        forms = soup.find_all('form')
        if forms:
            for form in forms:
                inputs = form.find_all('input')
                password_fields = [i for i in inputs if i.get('type') == 'password']
                if password_fields:
                    score += 15
                    indicators.append("Password input field detected")
                    break
        
        # Check for external scripts
        scripts = soup.find_all('script', src=True)
        external_scripts = [s for s in scripts if not urlparse(s['src']).netloc in url]
        if len(external_scripts) > 5:
            score += 10
            indicators.append("Multiple external scripts")
        
        # Check for missing security indicators
        if not soup.find('meta', attrs={'name': 'description'}):
            score += 5
            indicators.append("Missing meta description")
        
    except:
        pass
    
    return score, indicators

def check_email_phishing(email_body: str, sender: str) -> dict:
    """
    Analyze email for phishing characteristics
    """
    score = 0
    indicators = []
    
    # Check sender domain
    if '@' in sender:
        domain = sender.split('@')[1].lower()
        if any(suspicious in domain for suspicious in ['temp', 'fake', 'spam']):
            score += 30
            indicators.append("Suspicious sender domain")
    
    # Check for urgency keywords
    urgency_words = ['urgent', 'immediate', 'expire', 'suspended', 'limited time']
    urgency_count = sum(1 for word in urgency_words if word in email_body.lower())
    if urgency_count >= 2:
        score += 25
        indicators.append("Urgency tactics detected")
    
    # Check for suspicious links
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', email_body)
    if urls:
        suspicious_urls = [url for url in urls if analyze_url(url)['risk_score'] > 40]
        if suspicious_urls:
            score += 30
            indicators.append(f"{len(suspicious_urls)} suspicious links found")
    
    # Check for requests for sensitive information
    sensitive_requests = ['password', 'credit card', 'ssn', 'social security', 'account number']
    if any(req in email_body.lower() for req in sensitive_requests):
        score += 35
        indicators.append("Requests for sensitive information")
    
    risk_level = "high" if score >= 60 else "medium" if score >= 30 else "low"
    
    return {
        "risk_level": risk_level,
        "risk_score": min(score, 100),
        "indicators": indicators,
        "is_phishing": score >= 50
    }