import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Database, Globe, Lock, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white mb-16">
          <Shield className="w-24 h-24 mx-auto mb-6 text-blue-400" />
          <h1 className="text-5xl font-bold mb-4">Cyber Threat Intelligence Platform</h1>
          <p className="text-xl text-gray-300 mb-8">
            Real-time threat detection, AI-powered analysis, and blockchain verification
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<AlertTriangle className="w-12 h-12" />}
            title="Threat Detection"
            description="AI-powered classification with MITRE ATT&CK framework integration"
          />
          <FeatureCard
            icon={<Database className="w-12 h-12" />}
            title="Blockchain Logging"
            description="Immutable threat records stored on blockchain for verification"
          />
          <FeatureCard
            icon={<Globe className="w-12 h-12" />}
            title="Global Dashboard"
            description="Real-time threat mapping and analytics from around the world"
          />
          <FeatureCard
            icon={<Lock className="w-12 h-12" />}
            title="Phishing Scanner"
            description="Advanced URL and email analysis for phishing detection"
          />
          <FeatureCard
            icon={<Activity className="w-12 h-12" />}
            title="Malware Analysis"
            description="VirusTotal integration and computer vision analysis"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Real-time Alerts"
            description="WebSocket-powered instant notifications for new threats"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Key Features</h2>
          <ul className="space-y-3 text-lg">
            <li className="flex items-center">
              <span className="text-blue-400 mr-3">✓</span>
              MITRE ATT&CK technique mapping for threat categorization
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 mr-3">✓</span>
              Computer vision analysis for screenshot-based threat detection
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 mr-3">✓</span>
              AI-powered threat classification and severity assessment
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 mr-3">✓</span>
              Interactive chatbot for cybersecurity queries
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 mr-3">✓</span>
              Admin panel for threat moderation and user management
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition">
    <div className="text-blue-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default Home;