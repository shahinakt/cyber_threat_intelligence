import React, { useState } from 'react';
import { reportThreat } from '../services/api';

const ReportThreat = () => {
  const [report, setReport] = useState({ title: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await reportThreat(report);
    if (success) alert('Threat reported!');
    else alert('Report failed');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Threat Title" onChange={(e) => setReport({ ...report, title: e.target.value })} />
      <textarea placeholder="Description" onChange={(e) => setReport({ ...report, description: e.target.value })}></textarea>
      <button type="submit">Report</button>
    </form>
  );
};

export default ReportThreat;
