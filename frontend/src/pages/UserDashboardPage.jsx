import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../services/api';
import Chatbot from '../components/Chatbot';

const UserDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, userStatsRes, threatsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/user-stats'),
        api.get('/threats?limit=10')
      ]);

      setStats(statsRes.data);
      setUserStats(userStatsRes.data);
      setRecentThreats(threatsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Activity className="w-8 h-8" />}
          title="Total Threats"
          value={stats?.total_threats || 0}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-8 h-8" />}
          title="Recent (7 days)"
          value={stats?.recent_threats || 0}
          color="orange"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="My Submissions"
          value={userStats?.total_submitted || 0}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Critical Threats"
          value={stats?.severity_distribution?.critical || 0}
          color="red"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Threat Types Distribution</h2>
          <div className="space-y-3">
            {stats?.type_distribution && Object.entries(stats.type_distribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Severity Distribution</h2>
          <div className="space-y-3">
            {stats?.severity_distribution && Object.entries(stats.severity_distribution).map(([severity, count]) => {
              const colors = {
                low: 'bg-green-100 text-green-800',
                medium: 'bg-yellow-100 text-yellow-800',
                high: 'bg-orange-100 text-orange-800',
                critical: 'bg-red-100 text-red-800'
              };
              return (
                <div key={severity} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{severity}</span>
                  <span className={`${colors[severity]} px-3 py-1 rounded-full text-sm font-semibold`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Threats</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{threat.title}</td>
                  <td className="px-4 py-3 capitalize">{threat.threat_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(threat.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className={`${colors[color]} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-gray-600 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

export default UserDashboardPage;