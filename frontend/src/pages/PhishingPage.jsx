import React from 'react';
import PhishingAlert from '../components/PhishingAlert';

const PhishingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Phishing Scanner</h1>
      <div className="max-w-2xl">
        <PhishingAlert />
      </div>
    </div>
  );
};

export default PhishingPage;
