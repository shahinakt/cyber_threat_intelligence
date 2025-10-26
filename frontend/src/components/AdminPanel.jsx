import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [allScans, setAllScans] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    threatsDetected: 0,
    activeUsers: 0
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

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchAdminData(token);
  }, [navigate]);

  const fetchAdminData = async (token) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setAllScans(data.scans || []);
        setSystemStats(data.stats || systemStats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'scans' ? 'active' : ''} 
          onClick={() => setActiveTab('scans')}
        >
          All Scans
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{systemStats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h3>Total Scans</h3>
                <p className="stat-value">{systemStats.totalScans}</p>
              </div>
              <div className="stat-card threat">
                <h3>Threats Detected</h3>
                <p className="stat-value">{systemStats.threatsDetected}</p>
              </div>
              <div className="stat-card active">
                <h3>Active Users</h3>
                <p className="stat-value">{systemStats.activeUsers}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>User Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'scans' && (
          <div className="scans-section">
            <h2>All Scan History</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>File Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {allScans.map((scan, index) => (
                  <tr key={index}>
                    <td>{scan.userName}</td>
                    <td>{scan.fileName}</td>
                    <td>{new Date(scan.date).toLocaleString()}</td>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;