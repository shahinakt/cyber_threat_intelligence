import axios from 'axios';

// Set your backend base URL
const BASE_URL = 'http://localhost:8000';

// Auth routes (they're under the /auth prefix in FastAPI)
export const loginUser = (data) => axios.post(`${BASE_URL}/auth/login`, data);
export const registerUser = (data) => axios.post(`${BASE_URL}/auth/register`, data);

// Threat reporting
export const reportThreat = (data, token) =>
  axios.post(`${BASE_URL}/report`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Get user data (example route, make sure it's implemented in your backend)
export const getUserData = (token) =>
  axios.get(`${BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
