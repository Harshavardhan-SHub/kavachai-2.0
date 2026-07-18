import React, { useState, useEffect } from 'react';
import { ShieldAlert, MessageSquare, BarChart3, UserCheck, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import LandingPage from './components/LandingPage';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import GuardianSettings from './components/GuardianSettings';

export default function App() {
  const [activeView, setActiveView] = useState('landing');
  const [backendMode, setBackendMode] = useState(true); // Defaulting to TRUE based on user preference
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  
  const [incidentLogs, setIncidentLogs] = useState([]);
  const [guardianProfile, setGuardianProfile] = useState({
    userName: 'Grandfather',
    userPhone: '',
    isVerified: false,
    guardianName: 'Harsha',
    guardianPhone: '',
    warningLanguage: 'hi-IN',
    notifyOnSuspicious: false
  });

  // 1. Fetch data from backend on mount (if live mode is true)
  useEffect(() => {
    if (backendMode) {
      fetchHistory();
      fetchProfile();
    }
  }, [backendMode, backendUrl]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/history`);
      if (res.ok) {
        const data = await res.json();
        // Convert API schema to frontend UI schema
        const mapped = data.map(item => ({
          id: item.id,
          original_text: item.original_text,
          input_type: item.input_type || 'SMS',
          threat_score: item.threat_score,
          confidence_score: item.confidence_score,
          risk_level: item.risk_level,
          threat_type: item.threat_type,
          reason_flags: item.reason_flags || [],
          recommended_action: item.recommended_action || '',
          timestamp: item.timestamp || new Date().toLocaleString()
        }));
        setIncidentLogs(mapped.reverse()); // Show newest first
      }
    } catch (err) {
      console.warn('Could not load history from FastAPI server. Backend might be offline:', err);
    }
  };

  const fetchProfile = async () => {
    // If phone number is configured, check backend profile settings
    const phoneToQuery = guardianProfile.userPhone || 'default_user';
    try {
      const res = await fetch(`${backendUrl}/api/profile?phone_number=${encodeURIComponent(phoneToQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile_completed) {
          setGuardianProfile({
            userName: data.protected_name || 'Grandfather',
            userPhone: data.phone_number || '',
            isVerified: true,
            guardianName: data.guardian_name || 'Harsha',
            guardianPhone: data.guardian_number || '',
            warningLanguage: data.preferred_language || 'hi-IN',
            notifyOnSuspicious: data.notify_suspicious || false
          });
        }
      }
    } catch (err) {
      console.warn('Could not load profile from FastAPI server. Backend might be offline:', err);
    }
  };

  const addIncidentLog = (newLog) => {
    setIncidentLogs(prev => [newLog, ...prev]);
  };

  const clearIncidentLogs = async () => {
    if (backendMode) {
      try {
        const res = await fetch(`${backendUrl}/api/history`, { method: 'DELETE' });
        if (res.ok) {
          setIncidentLogs([]);
          return;
        }
      } catch (err) {
        console.error('Failed to clear backend history:', err);
      }
    }
    setIncidentLogs([]);
  };

  const updateGuardianProfile = (updates) => {
    setGuardianProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">🛡️</div>
          <div>
            <h1 className="brand-name">Kavach AI</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-wa)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> ASSISTANT v2.5
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-link ${activeView === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveView('landing')}
          >
            <ShieldAlert className="nav-icon" />
            <span>Product Mission</span>
          </div>

          <div
            className={`nav-link ${activeView === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveView('whatsapp')}
          >
            <MessageSquare className="nav-icon" />
            <span>WhatsApp Bot</span>
          </div>

          <div
            className={`nav-link ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <BarChart3 className="nav-icon" />
            <span>Incident Dashboard</span>
          </div>

          <div
            className={`nav-link ${activeView === 'guardian' ? 'active' : ''}`}
            onClick={() => setActiveView('guardian')}
          >
            <UserCheck className="nav-icon" />
            <span>Guardian Config</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', background: backendMode ? 'cyan' : 'var(--accent-wa)', borderRadius: '50%', boxShadow: backendMode ? '0 0 8px cyan' : 'var(--shadow-neon)' }} />
            <span>{backendMode ? 'Live API Connected' : 'Local Simulator Mode'}</span>
          </div>
          <div>HackPrix Season 3 Project</div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        <header className="section-header">
          <h2 className="section-title">
            {activeView === 'landing' && 'Product Positioning'}
            {activeView === 'whatsapp' && 'WhatsApp Conversational Shield'}
            {activeView === 'analytics' && 'Cognitive Threat Dashboard'}
            {activeView === 'guardian' && 'Shield Configuration'}
          </h2>
          <p className="section-desc">
            {activeView === 'landing' && 'Redesigning the interaction model of cybersecurity protection'}
            {activeView === 'whatsapp' && 'Simulate forwarding digital scams to the chatbot interface'}
            {activeView === 'analytics' && 'Real-time telemetry reports on scanned digital assets'}
            {activeView === 'guardian' && 'Verify endpoints and register family notification pathways'}
          </p>
        </header>

        {activeView === 'landing' && (
          <LandingPage onStartChat={() => setActiveView('whatsapp')} />
        )}
        {activeView === 'whatsapp' && (
          <WhatsAppSimulator
            addIncidentLog={addIncidentLog}
            guardianProfile={guardianProfile}
            backendMode={backendMode}
            backendUrl={backendUrl}
          />
        )}
        {activeView === 'analytics' && (
          <AnalyticsDashboard
            incidentLogs={incidentLogs}
            clearIncidentLogs={clearIncidentLogs}
          />
        )}
        {activeView === 'guardian' && (
          <GuardianSettings
            guardianProfile={guardianProfile}
            updateGuardianProfile={updateGuardianProfile}
            backendMode={backendMode}
            setBackendMode={setBackendMode}
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
          />
        )}
      </main>
    </div>
  );
}
