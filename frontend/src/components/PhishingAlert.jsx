import React, { useState } from 'react';
import { Shield, AlertTriangle, Search } from 'lucide-react';
import { phishingScanner } from '../services/phishingScanner';

const PhishingAlert = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const scanResult = await phishingScanner.scanUrl(url);
      setResult(scanResult);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Shield className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold">Phishing URL Scanner</h2>
      </div>

      <form onSubmit={handleScan} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:bg-blue-400 flex items-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>{loading ? 'Scanning...' : 'Scan'}</span>
          </button>
        </div>
      </form>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.error ? 'bg-red-100 border border-red-400' :
          result.is_phishing ? 'bg-red-100 border border-red-400' :
          result.risk_level === 'medium' ? 'bg-yellow-100 border border-yellow-400' :
          'bg-green-100 border border-green-400'
        }`}>
          {result.error ? (
            <div className="text-red-700">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              {result.error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">
                  Risk Level: {result.risk_level.toUpperCase()}
                </span>
                <span className="text-sm">Score: {result.risk_score}/100</span>
              </div>
              {result.is_phishing && (
                <div className="text-red-700 font-semibold mb-2">
                  ⚠️ This URL appears to be phishing!
                </div>
              )}
              <div className="mt-3">
                <div className="font-semibold mb-1">Indicators:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.indicators.map((indicator, idx) => (
                    <li key={idx}>{indicator}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PhishingAlert;