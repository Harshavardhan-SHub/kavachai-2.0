import React from 'react';
import { Shield, MessageSquare, ArrowRight, Zap, Eye, BellRing, Heart } from 'lucide-react';

export default function LandingPage({ onStartChat }) {
  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '40px 0 60px 0' }}>
        <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-wa)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} /> Redesigning Digital Fraud Protection
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
          Kavach AI <span style={{ color: 'var(--accent-wa)' }}>Shield</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
          An AI-powered conversational assistant that protects users from SMS scams, financial fraud, and voice phishing directly within WhatsApp.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button className="btn btn-primary" onClick={onStartChat} style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
            Try WhatsApp Bot <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Before vs After Journey Card */}
      <div className="glass-card" style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap style={{ color: 'var(--accent-wa)' }} /> The Journey Redesign: website to WhatsApp
        </h2>
        
        <div className="grid-2">
          {/* Old Flow */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
              <span>OLD HACKATHON: DESTINATION-BASED</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-threat)', padding: '2px 8px', borderRadius: '10px' }}>High Friction</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                <span>User receives suspicious message</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                <span>Interrupted, open browser, search website</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                <span>Sign-up/Login with credentials</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>4</span>
                <span>Upload copy or screenshot manually</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>5</span>
                <span>Wait for analysis and read report</span>
              </div>
            </div>
          </div>

          {/* New Flow */}
          <div style={{ background: 'rgba(16, 185, 129, 0.01)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.03)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-wa)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
              <span>NEW PRODUCT VISION: CONTEXT-BASED</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-wa)', padding: '2px 8px', borderRadius: '10px' }}>Zero Learning Curve</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'var(--accent-wa)', color: '#070a13', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>1</span>
                <span>User receives suspicious message</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'var(--accent-wa)', color: '#070a13', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>2</span>
                <span>Forward SMS/screenshot directly to WhatsApp bot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'var(--accent-wa)', color: '#070a13', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>3</span>
                <span>AI responds instantly with Threat Verdict & Action</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ background: 'var(--accent-wa)', color: '#070a13', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>4</span>
                <span style={{ color: 'var(--color-threat)', fontWeight: '500' }}>High threats auto-alert guardian family members via SMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Phases Section */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight style={{ color: 'var(--accent-wa)' }} /> Product Roadmap
      </h2>
      <div className="grid-3" style={{ marginBottom: '48px' }}>
        {/* Phase 1 */}
        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-wa)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '16px', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Phase 1: Conversational AI</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            WhatsApp chatbot engine. Real-time scanning of forwarded spam SMS texts, screenshot image parsing (OCR), voice note translation, and structured scam breakdown reporting.
          </p>
        </div>

        {/* Phase 2 */}
        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '16px', justifyContent: 'center' }}>
            <Eye size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Phase 2: Intelligent Assistant</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Multi-lingual support (Hindi, Telugu, Kannada, etc.). Interactive follow-up discussions. Automated user safety quizzes and scam awareness warnings in regional languages.
          </p>
        </div>

        {/* Phase 3 */}
        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-threat)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '16px', justifyContent: 'center' }}>
            <BellRing size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Phase 3: Family Protection</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Emergency alerts routed to trusted family members when high-threat activities target parents or elder relatives. Shared protection circles and unified hazard reporting.
          </p>
        </div>
      </div>

      {/* Core Design Principles */}
      <div className="glass-card" style={{ marginBottom: '40px', background: 'linear-gradient(to right, rgba(30, 41, 59, 0.2), rgba(16, 185, 129, 0.02))' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Design Principles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: 'var(--accent-wa)', marginBottom: '4px', fontSize: '0.95rem' }}>Zero Learning Curve</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Leverages communication channels that users are already familiar with.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-wa)', marginBottom: '4px', fontSize: '0.95rem' }}>Instant Assistance</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No configuration barriers, credential login paths, or dashboard delays.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-wa)', marginBottom: '4px', fontSize: '0.95rem' }}>AI Explains context</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Provides digestible reason flags and logical steps for the user.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-wa)', marginBottom: '4px', fontSize: '0.95rem' }}>Inclusive Design</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Optimized for senior citizens, non-English speakers, and first-time mobile users.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
