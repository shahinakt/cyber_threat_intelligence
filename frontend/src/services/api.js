import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Replace with FastAPI backend

export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/login`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/register`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const reportThreat = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/report-threat`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
