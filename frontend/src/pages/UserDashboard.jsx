import React, { useEffect, useState } from 'react';
import { getUserData } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    getUserData(token)
      .then(res => setUserData(res.data))
      .catch(() => navigate('/'));
  }, []);

  return (
    <div>
      <h2>User Dashboard</h2>
      <pre>{JSON.stringify(userData, null, 2)}</pre>
    </div>
  );
};

export default UserDashboard;
