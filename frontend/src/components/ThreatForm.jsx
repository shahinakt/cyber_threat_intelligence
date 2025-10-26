import React, { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import api from '../services/api';

const ThreatForm = ({ onSuccess }) => {
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
  const [error, setError] = useState('');

  const threatTypes = [
    'malware',
    'phishing',
    'ransomware',
    'ddos',
    'data_breach',
    'sql_injection',
    'xss',
    'zero_day',
    'insider_threat',
    'social_engineering'
  ];

  const severityLevels = ['low', 'medium', 'high', 'critical'];

  const commonMitreTechniques = [
    { id: 'T1566', name: 'Phishing' },
    { id: 'T1059', name: 'Command and Scripting Interpreter' },
    { id: 'T1055', name: 'Process Injection' },
    { id: 'T1486', name: 'Data Encrypted for Impact' },
    { id: 'T1498', name: 'Network Denial of Service' },
    { id: 'T1190', name: 'Exploit Public-Facing Application' },
    { id: 'T1567', name: 'Exfiltration Over Web Service' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Threat Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief description of the threat"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description *
        </label>
        <textarea
          name="description"
          required
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide comprehensive details about the threat, including behavior, impact, and timeline..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Threat Type *
          </label>
          <select
            name="threat_type"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.threat_type}
            onChange={handleChange}
          >
            {threatTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level *
          </label>
          <select
            name="severity"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.severity}
            onChange={handleChange}
          >
            {severityLevels.map(level => (
              <option key={level} value={level}>
                {level.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          MITRE ATT&CK Technique (Optional)
        </label>
        <input
          type="text"
          name="mitre_attack_id"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.mitre_attack_id}
          onChange={handleChange}
          placeholder="e.g., T1566"
          list="mitre-techniques"
        />
        <datalist id="mitre-techniques">
          {commonMitreTechniques.map(tech => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </datalist>
        <p className="text-xs text-gray-500 mt-1">
          Common: T1566 (Phishing), T1059 (Command Execution), T1486 (Ransomware)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Indicators of Compromise (IoCs)
        </label>
        <input
          type="text"
          name="indicators"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.indicators}
          onChange={handleChange}
          placeholder="Comma-separated: IPs, domains, file hashes..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Example: 192.168.1.1, malicious.com, abc123def456...
        </p>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-gray-700">Location Information (Optional)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., USA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="latitude"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="40.7128"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="longitude"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="-74.0060"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-blue-400 flex items-center justify-center space-x-2"
      >
        <AlertTriangle className="w-5 h-5" />
        <span>{loading ? 'Submitting...' : 'Submit Threat Report'}</span>
      </button>
    </form>
  );
};

export default ThreatForm;