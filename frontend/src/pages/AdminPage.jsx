import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingThreats, setPendingThreats] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, threatsRes, usersRes] = await Promise.all([
        api.get('/admin/stats/overview'),
        api.get('/admin/threats/pending'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data);
      setPendingThreats(threatsRes.data.threats || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderateThreat = async (threatId, status) => {
    try {
      await api.patch(`/admin/threats/${threatId}/moderate`, { status });
      setPendingThreats(prev => prev.filter(t => t.id !== threatId));
      alert(`Threat ${status} successfully`);
    } catch (error) {
      alert('Failed to moderate threat');
    }
  };

  const moderateUser = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}/moderate`, { is_active: isActive });
      setUsers(prev => prev.map(u => u.id === userId ? {...u, is_active: isActive} : u));
      alert(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      alert('Failed to moderate user');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="w-10 h-10 text-red-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.total_users || 0} color="blue" />
        <StatCard title="Active Users" value={stats?.active_users || 0} color="green" />
        <StatCard title="Total Threats" value={stats?.total_threats || 0} color="purple" />
        <StatCard title="Pending" value={stats?.pending_threats || 0} color="orange" />
        <StatCard title="Flagged" value={stats?.flagged_threats || 0} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 font-semibold ${activeTab === 'threats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('threats')}
          >
            Pending Threats ({pendingThreats.length})
          </button>
          <button
            className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">System Overview</h2>
              <p className="text-gray-600">Monitor and manage the cyber threat intelligence platform.</p>
            </div>
          )}

          {activeTab === 'threats' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pending Threat Reports</h2>
              <div className="space-y-4">
                {pendingThreats.map(threat => (
                  <div key={threat.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{threat.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="capitalize">{threat.threat_type}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {threat.severity}
                          </span>
                          <span>{new Date(threat.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moderateThreat(threat.id, 'verified')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => moderateThreat(threat.id, 'flagged')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Flag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{user.full_name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3 capitalize">{user.role}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => moderateUser(user.id, !user.is_active)}
                            className={`px-3 py-1 rounded text-sm ${
                              user.is_active ? 
                              'bg-red-600 hover:bg-red-700 text-white' : 
                              'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className={`${colors[color]} w-10 h-10 rounded flex items-center justify-center mb-2`}>
        <Users className="w-6 h-6 text-white" />
      </div>
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default AdminPage;