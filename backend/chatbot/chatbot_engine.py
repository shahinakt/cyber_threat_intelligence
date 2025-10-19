import json
import re
from typing import Dict, List
import random

class ChatbotEngine:
    def __init__(self):
        self.intents = self.load_dataset()
        
    def load_dataset(self) -> Dict:
        try:
            with open('chatbot/dataset.json', 'r') as f:
                return json.load(f)
        except:
            return self.get_default_dataset()
    
    def get_default_dataset(self) -> Dict:
        return {
            "intents": [
                {
                    "tag": "greeting",
                    "patterns": ["hello", "hi", "hey", "good morning", "good afternoon"],
                    "responses": ["Hello! How can I assist you with cybersecurity today?", "Hi there! I'm here to help with threat intelligence."]
                },
                {
                    "tag": "malware_info",
                    "patterns": ["what is malware", "types of malware", "malware definition", "tell me about malware"],
                    "responses": ["Malware is malicious software designed to harm, exploit, or otherwise compromise systems. Common types include viruses, trojans, ransomware, spyware, and worms."]
                },
                {
                    "tag": "phishing_info",
                    "patterns": ["what is phishing", "phishing attack", "how to detect phishing", "phishing email"],
                    "responses": ["Phishing is a cyber attack where attackers impersonate legitimate entities to steal sensitive information. Look for suspicious links, urgent language, spelling errors, and unverified sender addresses."]
                },
                {
                    "tag": "ransomware_info",
                    "patterns": ["what is ransomware", "ransomware attack", "how does ransomware work"],
                    "responses": ["Ransomware is malware that encrypts your files and demands payment for decryption. Prevention includes regular backups, updated software, and security awareness training."]
                },
                {
                    "tag": "mitre_attack",
                    "patterns": ["what is mitre attack", "mitre att&ck", "mitre framework", "attack techniques"],
                    "responses": ["MITRE ATT&CK is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations. It helps organizations understand and defend against cyber threats."]
                },
                {
                    "tag": "report_threat",
                    "patterns": ["how to report", "report threat", "submit threat", "report attack"],
                    "responses": ["To report a threat, go to the 'Report Threat' page and fill in details including threat type, severity, description, and any indicators of compromise (IoCs)."]
                },
                {
                    "tag": "ioc_info",
                    "patterns": ["what are iocs", "indicators of compromise", "threat indicators"],
                    "responses": ["Indicators of Compromise (IoCs) are forensic artifacts that suggest a system has been breached. These include IP addresses, file hashes, domains, and URLs associated with malicious activity."]
                },
                {
                    "tag": "data_breach",
                    "patterns": ["data breach", "what is data breach", "breach response"],
                    "responses": ["A data breach is an incident where sensitive data is accessed without authorization. Immediate steps include containment, investigation, notification, and remediation."]
                },
                {
                    "tag": "ddos_info",
                    "patterns": ["ddos attack", "denial of service", "what is ddos"],
                    "responses": ["DDoS (Distributed Denial of Service) attacks overwhelm systems with traffic from multiple sources, making services unavailable. Mitigation includes traffic filtering and load balancing."]
                },
                {
                    "tag": "security_best_practices",
                    "patterns": ["security tips", "best practices", "how to stay safe", "security advice"],
                    "responses": ["Key security practices: use strong passwords, enable 2FA, keep software updated, be wary of suspicious emails, backup data regularly, and use reputable security software."]
                }
            ]
        }
    
    def get_response(self, message: str) -> Dict:
        message_lower = message.lower()
        best_match = None
        best_score = 0
        
        for intent in self.intents["intents"]:
            for pattern in intent["patterns"]:
                score = self.calculate_similarity(message_lower, pattern.lower())
                if score > best_score:
                    best_score = score
                    best_match = intent
        
        if best_match and best_score > 0.3:
            return {
                "response": random.choice(best_match["responses"]),
                "confidence": round(best_score, 2),
                "intent": best_match["tag"]
            }
        else:
            return {
                "response": "I'm not sure about that. Could you rephrase or ask about malware, phishing, ransomware, or threat reporting?",
                "confidence": 0.0,
                "intent": "unknown"
            }
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Simple word overlap similarity"""
        words1 = set(re.findall(r'\w+', text1))
        words2 = set(re.findall(r'\w+', text2))
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def get_intents(self) -> List[str]:
        return [intent["tag"] for intent in self.intents["intents"]]