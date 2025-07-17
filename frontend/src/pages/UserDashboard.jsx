import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
      <Link to="/report-threat">Report a Threat</Link>
    </div>
  );
};

export default UserDashboard;
