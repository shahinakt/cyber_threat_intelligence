import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportThreat from './pages/ReportThreat';
import UserDashboardPage from './pages/UserDashboardPage';
import GlobalDashboardPage from './pages/GlobalDashboardPage';
import ScanPage from './pages/ScanPage';
import MalwareScanResult from './components/MalwareScanResult';
import PhishingPage from './pages/PhishingPage';
import AdminPage from './pages/AdminPage';
import { authService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      authService.logout();
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (token, userData) => {
    authService.setToken(token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLogout={handleLogout}
          user={user}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Register onRegister={handleLogin} />
            } 
          />
          <Route 
            path="/report" 
            element={
              isAuthenticated ? 
              <ReportThreat /> : 
              <Navigate to="/login" />
            } 
          />
          <Route
            path="/scan"
            element={
              isAuthenticated ?
              <ScanPage /> :
              <Navigate to="/login" />
            }
          />
          <Route
            path="/scan/:scanId"
            element={
              isAuthenticated ?
              <MalwareScanResult /> :
              <Navigate to="/login" />
            }
          />
          <Route
            path="/phishing"
            element={
              isAuthenticated ?
              <PhishingPage /> :
              <Navigate to="/login" />
            }
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <UserDashboardPage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/global" 
            element={
              isAuthenticated ? 
              <GlobalDashboardPage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && user?.role === 'admin' ? 
              <AdminPage /> : 
              <Navigate to="/dashboard" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;