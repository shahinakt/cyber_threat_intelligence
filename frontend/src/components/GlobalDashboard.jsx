import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalDashboard.css';

const GlobalDashboard = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleScan = async () => {
    if (!file) {
      alert('Please select a file to scan');
      return;
    }

    setScanning(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/scans/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          navigate(`/scan-result/${data.scanId}`);
        }, 500);
      } else {
        alert('Scan failed. Please try again.');
        setScanning(false);
        setProgress(0);
      }
    } catch (err) {
      console.error('Error scanning file:', err);
      alert('Network error. Please try again.');
      setScanning(false);
      setProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="global-dashboard">
      <header className="dashboard-header">
        <h1>Malware Scanner</h1>
        <nav>
          <button onClick={() => navigate('/dashboard')} className="btn-nav">
            My Dashboard
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }} 
            className="btn-logout"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="scanner-container">
        <div className="scanner-card">
          <h2>Upload File for Scanning</h2>
          <p className="subtitle">Detect malware, viruses, and other threats in your files</p>

          <div 
            className={`upload-area ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="upload-icon">📁</div>
                <p>Drag and drop a file here or</p>
                <label htmlFor="file-input" className="btn-upload">
                  Choose File
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <p className="file-info">Maximum file size: 50MB</p>
              </>
            ) : (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h3>{file.name}</h3>
                  <p>{formatFileSize(file.size)}</p>
                </div>
                {!scanning && (
                  <button onClick={handleRemoveFile} className="btn-remove">
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {scanning && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">Scanning... {progress}%</p>
            </div>
          )}

          {file && !scanning && (
            <button onClick={handleScan} className="btn-scan">
              Start Scan
            </button>
          )}
        </div>

        <div className="info-section">
          <h3>How It Works</h3>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload File</h4>
                <p>Select or drag and drop a file to scan</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Analysis</h4>
                <p>Our system analyzes the file for threats</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Results</h4>
                <p>Get detailed scan results and recommendations</p>
              </div>
            </div>
          </div>

          <div className="security-badges">
            <div className="badge">
              <span className="badge-icon">🔒</span>
              <span>Secure Upload</span>
            </div>
            <div className="badge">
              <span className="badge-icon">⚡</span>
              <span>Fast Scanning</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🛡️</span>
              <span>Advanced Detection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;