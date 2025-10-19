// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThreatLogger {
    struct ThreatRecord {
        string threatId;
        string threatHash;
        string severity;
        uint256 timestamp;
        address reporter;
    }
    
    mapping(string => ThreatRecord) public threats;
    string[] public threatIds;
    
    event ThreatLogged(
        string indexed threatId,
        string threatHash,
        string severity,
        uint256 timestamp,
        address reporter
    );
    
    function logThreat(
        string memory _threatId,
        string memory _threatHash,
        string memory _severity,
        uint256 _timestamp
    ) public {
        require(bytes(threats[_threatId].threatId).length == 0, "Threat already exists");
        
        ThreatRecord memory newThreat = ThreatRecord({
            threatId: _threatId,
            threatHash: _threatHash,
            severity: _severity,
            timestamp: _timestamp,
            reporter: msg.sender
        });
        
        threats[_threatId] = newThreat;
        threatIds.push(_threatId);
        
        emit ThreatLogged(_threatId, _threatHash, _severity, _timestamp, msg.sender);
    }
    
    function getThreat(string memory _threatId) public view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ) {
        ThreatRecord memory threat = threats[_threatId];
        return (
            threat.threatId,
            threat.threatHash,
            threat.severity,
            threat.timestamp,
            threat.reporter
        );
    }
    
    function getThreatCount() public view returns (uint256) {
        return threatIds.length;
    }
}