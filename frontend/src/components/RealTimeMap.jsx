import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import api from '../services/api';

const RealTimeMap = () => {
  const [threatLocations, setThreatLocations] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreatLocations();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchThreatLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchThreatLocations = async () => {
    try {
      const response = await api.get('/dashboard/threat-map');
      setThreatLocations(response.data.locations || []);
    } catch (error) {
      console.error('Failed to fetch threat locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#65a30d'
    };
    return colors[severity] || '#6b7280';
  };

  const getThreatSize = (count) => {
    if (count > 50) return 24;
    if (count > 20) return 18;
    if (count > 10) return 14;
    return 10;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MapPin className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold">Global Threat Map</h2>
        </div>
        <div className="text-sm text-gray-600">
          {threatLocations.length} locations
        </div>
      </div>

      {/* Simple visual representation (replace with actual map library like Mapbox if needed) */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 h-96 overflow-auto">
        <div className="absolute inset-0 flex flex-wrap content-start p-4">
          {threatLocations.map((location, idx) => (
            <div
              key={idx}
              className="relative m-2 cursor-pointer transform transition hover:scale-110"
              onClick={() => setSelectedThreat(location)}
              style={{
                width: getThreatSize(location.count) + 'px',
                height: getThreatSize(location.count) + 'px',
              }}
            >
              <div
                className="rounded-full opacity-75 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                style={{
                  backgroundColor: getSeverityColor(location.severity),
                  width: '100%',
                  height: '100%'
                }}
              >
                {location.count}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap bg-white px-2 py-1 rounded shadow">
                {location.country}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-orange-600 mr-2"></div>
          <span>High</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
          <span>Low</span>
        </div>
      </div>

      {/* Selected Threat Details */}
      {selectedThreat && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-bold text-lg">{selectedThreat.country}</div>
              <div className="text-sm text-gray-600 mt-1">
                Coordinates: {selectedThreat.coordinates[1].toFixed(4)}, {selectedThreat.coordinates[0].toFixed(4)}
              </div>
              <div className="mt-2">
                <span className="text-sm font-semibold">Total Threats: </span>
                <span className="text-lg font-bold text-blue-600">{selectedThreat.count}</span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-semibold">Severity: </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedThreat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  selectedThreat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  selectedThreat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedThreat.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedThreat(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <AlertCircle className="w-4 h-4 inline mr-1" />
        Map updates every 30 seconds
      </div>
    </div>
  );
};

export default RealTimeMap;