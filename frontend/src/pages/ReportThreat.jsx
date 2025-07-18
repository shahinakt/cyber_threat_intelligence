import React, { useState } from 'react';
import { reportThreat } from '../services/api';

const ReportThreat = () => {
  const [form, setForm] = useState({ title: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await reportThreat(form, token);
      alert('Threat reported!');
    } catch (err) {
      alert('Failed to report threat');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Threat Title" onChange={e => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ReportThreat;
