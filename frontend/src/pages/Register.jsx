import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [user, setUser] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await registerUser(user);
    if (success) navigate('/');
    else alert('Registration failed!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" onChange={(e) => setUser({ ...user, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={(e) => setUser({ ...user, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
