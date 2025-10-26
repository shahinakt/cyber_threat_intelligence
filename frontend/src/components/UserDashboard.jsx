import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    cleanFiles: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScanHistory(data.scanHistory || []);
        setStats(data.stats || stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNewScan = () => {
    navigate('/scan');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Scans</h3>
            <p className="stat-value">{stats.totalScans}</p>
          </div>
          <div className="stat-card threat">
            <h3>Threats Detected</h3>
            <p className="stat-value">{stats.threatsDetected}</p>
          </div>
          <div className="stat-card clean">
            <h3>Clean Files</h3>
            <p className="stat-value">{stats.cleanFiles}</p>
          </div>
        </div>

        <div className="action-section">
          <button onClick={handleNewScan} className="btn-primary btn-large">
            Start New Scan
          </button>
        </div>

        <div className="scan-history">
          <h2>Recent Scans</h2>
          {scanHistory.length === 0 ? (
            <p className="no-data">No scan history yet. Start your first scan!</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan, index) => (
                  <tr key={index}>
                    <td>{new Date(scan.date).toLocaleDateString()}</td>
                    <td>{scan.fileName}</td>
                    <td>
                      <span className={`status ${scan.status.toLowerCase()}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td>{scan.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;