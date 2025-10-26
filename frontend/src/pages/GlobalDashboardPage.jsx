import React, { useState, useEffect } from 'react';
import { Globe, Map, BarChart3 } from 'lucide-react';
import api from '../services/api';

const GlobalDashboardPage = () => {
  const [threatMap, setThreatMap] = useState([]);
  const [mitreData, setMitreData] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      const [mapRes, mitreRes, timelineRes] = await Promise.all([
        api.get('/dashboard/threat-map'),
        api.get('/dashboard/mitre-mapping'),
        api.get('/dashboard/timeline?days=30')
      ]);

      setThreatMap(mapRes.data.locations || []);
      setMitreData(mitreRes.data.mitre_techniques || []);
      setTimeline(timelineRes.data.timeline || []);
    } catch (error) {
      console.error('Failed to fetch global data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading global dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Globe className="w-10 h-10 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Global Threat Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Map className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">Threat Locations</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {threatMap.slice(0, 10).map((location, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold">{location.country}</div>
                  <div className="text-sm text-gray-600">
                    {location.coordinates[1].toFixed(2)}, {location.coordinates[0].toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{location.count}</div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    location.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    location.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {location.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">MITRE ATT&CK Techniques</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mitreData.map((technique, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-semibold text-blue-600">{technique.technique_id}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {technique.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">30-Day Threat Timeline</h2>
        <div className="h-64 flex items-end space-x-2">
          {timeline.map((day, idx) => {
            const maxCount = Math.max(...timeline.map(d => d.count));
            const height = (day.count / maxCount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.count} threats`}
                ></div>
                <div className="text-xs text-gray-600 mt-2 transform rotate-45 origin-left">
                  {day.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboardPage;