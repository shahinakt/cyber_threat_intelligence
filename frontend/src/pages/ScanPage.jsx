import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { malwareScanner } from '../services/malwareScanner';

const ScanPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file to scan');

    setLoading(true);
    setError(null);
    try {
      const res = await malwareScanner.scanFile(file);
      // assume API returns an object with scan_id
      const scanId = res.scan_id || res.id || res.scanId;
      if (scanId) {
        navigate(`/scan/${scanId}`);
      } else {
        // if API returned a full result, we could show it in-place; for now redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Malware Scanner</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input type="file" onChange={handleFileChange} />
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded border"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScanPage;
