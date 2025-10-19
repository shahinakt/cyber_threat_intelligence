import React, { useState } from 'react';
import { AlertTriangle, Send, Upload } from 'lucide-react';
import api from '../services/api';

const ReportThreat = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    threat_type: 'malware',
    severity: 'medium',
    mitre_attack_id: '',
    indicators: '',
    country: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const threatTypes = [
    'malware', 'phishing', 'ransomware', 'ddos', 'data_breach',
    'sql_injection', 'xss', 'zero_day', 'insider_threat'
  ];

  const severityLevels = ['low', 'medium', 'high', 'critical'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        indicators: formData.indicators.split(',').map(i => i.trim()).filter(i => i),
        location: formData.latitude && formData.longitude ? {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
        } : null
      };

      const response = await api.post('/threats/report', payload);
      setSuccess(`Threat reported successfully! ID: ${response.data.threat_id}`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        threat_type: 'malware',
        severity: 'medium',
        mitre_attack_id: '',
        indicators: '',
        country: '',
        latitude: '',
        longitude: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to report threat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Report Threat</h1>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threat Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the threat..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threat Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.threat_type}
                  onChange={(e) => setFormData({ ...formData, threat_type: e.target.value })}
                >
                  {threatTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  {severityLevels.map(level => (
                    <option key={level} value={level}>{level.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MITRE ATT&CK Technique ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., T1566, T1059"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.mitre_attack_id}
                onChange={(e) => setFormData({ ...formData, mitre_attack_id: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indicators of Compromise (comma-separated)
              </label>
              <input
                type="text"
                placeholder="IPs, domains, file hashes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.indicators}
                onChange={(e) => setFormData({ ...formData, indicators: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., USA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-blue-400 flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Submitting...' : 'Submit Threat Report'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportThreat;
