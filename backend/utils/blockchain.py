from web3 import Web3
import json
import hashlib
from datetime import datetime
import os

# Connect to Ethereum node (use Infura or local Ganache)
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")

def get_web3():
    try:
        w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
        return w3 if w3.is_connected() else None
    except:
        return None

def log_to_blockchain(threat_id: str, threat_data: dict) -> str:
    """
    Log threat data to blockchain for immutable record
    """
    w3 = get_web3()
    
    # Fallback to hash-based logging if blockchain unavailable
    if not w3 or not CONTRACT_ADDRESS:
        return create_hash_proof(threat_id, threat_data)
    
    try:
        # Load contract ABI
        with open("smart_contract/compiled_contract.json", "r") as f:
            contract_json = json.load(f)
        
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=contract_json["abi"]
        )
        
        # Prepare transaction
        account = w3.eth.account.from_key(PRIVATE_KEY)
        
        # Create threat hash
        threat_hash = hashlib.sha256(
            json.dumps(threat_data, sort_keys=True).encode()
        ).hexdigest()
        
        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        transaction = contract.functions.logThreat(
            threat_id,
            threat_hash,
            threat_data.get("severity", "medium"),
            int(datetime.utcnow().timestamp())
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': w3.eth.gas_price
        })
        
        # Sign and send
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()
        
    except Exception as e:
        print(f"Blockchain error: {e}")
        return create_hash_proof(threat_id, threat_data)

def create_hash_proof(threat_id: str, threat_data: dict) -> str:
    """
    Create cryptographic hash as proof (fallback when blockchain unavailable)
    """
    data_string = json.dumps({
        "threat_id": threat_id,
        "timestamp": str(datetime.utcnow()),
        "data": threat_data
    }, sort_keys=True)
    
    return hashlib.sha256(data_string.encode()).hexdigest()

def verify_blockchain_record(threat_id: str, blockchain_hash: str) -> bool:
    """
    Verify if threat exists on blockchain
    """
    w3 = get_web3()
    if not w3 or not CONTRACT_ADDRESS:
        return False
    
    try:
        with open("smart_contract/compiled_contract.json", "r") as f:
            contract_json = json.load(f)
        
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=contract_json["abi"]
        )
        
        # Query contract
        threat_record = contract.functions.getThreat(threat_id).call()
        
        return threat_record[0] != ""  # Check if threat exists
        
    except:
        return False

def get_blockchain_stats() -> dict:
    """
    Get blockchain connection stats
    """
    w3 = get_web3()
    if not w3:
        return {"connected": False, "message": "Blockchain unavailable"}
    
    try:
        return {
            "connected": True,
            "block_number": w3.eth.block_number,
            "chain_id": w3.eth.chain_id,
            "contract_address": CONTRACT_ADDRESS
        }
    except:
        return {"connected": False, "error": "Failed to fetch stats"}