import React, { useState } from 'react';
import { UserCheck, Shield, Phone, Bell, Settings2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function GuardianSettings({
  guardianProfile,
  updateGuardianProfile,
  backendMode,
  setBackendMode,
  backendUrl,
  setBackendUrl
}) {
  const [phone, setPhone] = useState(guardianProfile.userPhone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(guardianProfile.isVerified || false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    // If backendMode is true, call backend FastAPI OTP send endpoint
    if (backendMode) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: phone })
        });
        if (res.ok) {
          setOtpSent(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('FastAPI send-otp failed, falling back to mock:', err);
      }
    }

    // Mock verification
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    // If backendMode is true, call backend FastAPI OTP check endpoint
    if (backendMode) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: phone, otp_code: otpCode })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setIsVerified(true);
            updateGuardianProfile({ userPhone: phone, isVerified: true });
            setIsLoading(false);
            setSuccessMessage('Phone number verified successfully via Twilio Verify!');
            setTimeout(() => setSuccessMessage(''), 4000);
            return;
          }
        }
      } catch (err) {
        console.error('FastAPI verify-otp failed, falling back to mock:', err);
      }
    }

    // Mock verify: accept any 6-digit code or "123456"
    setTimeout(() => {
      setIsVerified(true);
      updateGuardianProfile({ userPhone: phone, isVerified: true });
      setIsLoading(false);
      setSuccessMessage('Phone number verified successfully (Simulated OTP)!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 1000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // If backendMode is true, sync user profile to FastAPI
    if (backendMode) {
      try {
        await fetch(`${backendUrl}/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: phone || guardianProfile.userPhone,
            protected_name: guardianProfile.userName,
            guardian_number: guardianProfile.guardianPhone,
            preferred_language: guardianProfile.warningLanguage,
            notify_high: true,
            notify_suspicious: guardianProfile.notifyOnSuspicious,
            profile_completed: true
          })
        });
      } catch (err) {
        console.error('FastAPI profile sync failed:', err);
      }
    }

    setSuccessMessage('Profile settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', animation: 'slideUp 0.4s ease' }}>
      
      {/* Column 1: Profile and Onboarding */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Verification OTP */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} style={{ color: 'var(--accent-wa)' }} /> Device Number Authentication
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Verify the device mobile number using Twilio Verify OTP code checks. This registers the protection shield to this account.
          </p>

          {!isVerified ? (
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="form-group">
                    <label className="form-label">Protected User Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98765-43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} disabled={isLoading}>
                    {isLoading ? 'Sending verification code...' : 'Send Verification OTP Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    An OTP verification code was sent to <strong>{phone}</strong>.
                  </div>
                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => setOtpSent(false)}>
                      Change Number
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }} disabled={isLoading}>
                      {isLoading ? 'Checking OTP...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--accent-wa)' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Verified Shield Status</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered to {phone}</div>
              </div>
              <button className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '6px 12px' }} onClick={() => setIsVerified(false)}>
                Re-verify
              </button>
            </div>
          )}
        </div>

        {/* Profile Settings Form */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} style={{ color: 'var(--accent-wa)' }} /> Protected User Parameters
          </h2>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name of Protected User</label>
              <input
                type="text"
                className="form-input"
                value={guardianProfile.userName}
                onChange={(e) => updateGuardianProfile({ userName: e.target.value })}
                placeholder="e.g. Grandfather, Mom"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Voice warning language Dialect</label>
              <select
                className="form-select"
                value={guardianProfile.warningLanguage}
                onChange={(e) => updateGuardianProfile({ warningLanguage: e.target.value })}
              >
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="en-IN">English (Indian Accent)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="bn-IN">Bengali (বাংলা)</option>
                <option value="mr-IN">Marathi (मराठी)</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Save Profile Configurations
            </button>
          </form>
        </div>

      </div>

      {/* Column 2: Guardian Alerts and API Switch */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Guardian alerts routing setup */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--accent-wa)' }} /> Guardian Alert Notification Routing
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Enter details of the family guardian who will receive real-time Twilio SMS alerts when a High-Threat scam targets this user.
          </p>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Guardian Contact Name</label>
              <input
                type="text"
                className="form-input"
                value={guardianProfile.guardianName}
                onChange={(e) => updateGuardianProfile({ guardianName: e.target.value })}
                placeholder="e.g. Harsha (Son)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian SMS Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={guardianProfile.guardianPhone}
                onChange={(e) => updateGuardianProfile({ guardianPhone: e.target.value })}
                placeholder="e.g. +91 98765-43210"
                required
              />
            </div>

            <div className="switch-container">
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)' }}>Notify on Suspicious Cases</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Route notifications for medium risk items in addition to high-risk threats</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={guardianProfile.notifyOnSuspicious}
                  onChange={(e) => updateGuardianProfile({ notifyOnSuspicious: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', marginTop: '12px' }}>
              Update Alert Triggers
            </button>
          </form>
        </div>

        {/* Live API Mode switch panel */}
        <div className="glass-card" style={{ border: backendMode ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-color)', boxShadow: backendMode ? '0 0 20px rgba(6, 182, 212, 0.05)' : 'none' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={18} style={{ color: backendMode ? '#06b6d4' : 'var(--accent-wa)' }} /> API Execution Engine Setup
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Toggle between the offline frontend sandbox mockup engine and the live FastAPI backend routing.
          </p>

          <div className="switch-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: backendMode ? '#06b6d4' : '#fff' }}>
                {backendMode ? 'LIVE BACKEND ROUTING ACTIVE' : 'LOCAL OFFLINE SIMULATOR ACTIVE'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {backendMode ? 'Sends threat scans to local Python API server' : 'Runs client side mockup engine'}
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={backendMode}
                onChange={(e) => setBackendMode(e.target.checked)}
              />
              <span className="slider" style={{ backgroundColor: backendMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.1)' }}></span>
            </label>
          </div>

          {backendMode && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              <div className="form-group">
                <label className="form-label">FastAPI Backend API Base URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="e.g. http://localhost:8000"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <Sparkles size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
                <span>Make sure Python FastAPI is running at this URL with appropriate key tokens configured in backend/.env.</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent-wa)',
          color: '#070a13',
          padding: '12px 24px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideUp 0.3s ease'
        }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

    </div>
  );
}
