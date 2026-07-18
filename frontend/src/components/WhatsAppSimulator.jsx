import React, { useState, useEffect, useRef } from 'react';
import { Send, PhoneCall, Image, AlertTriangle, ShieldCheck, CheckCheck, Play, Volume2, UserCheck, AlertOctagon, HelpCircle } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'sbi-scam',
    title: 'SBI Banking Scam (SMS)',
    type: 'SMS',
    label: 'High Risk',
    sender: '+1 800-SBI-KNC',
    content: 'Dear Customer, Your SBI NetBanking Account has been suspended due to incomplete KYC verification. Please reactivate your account immediately by clicking: http://sbi-verification-secure.com/kyc.php',
    simulatedResponse: {
      threat_score: 94,
      confidence_score: 95,
      risk_level: 'HIGH',
      threat_type: 'Bank Impersonation',
      reason_flags: [
        'Urgent verification warning ("suspended")',
        'Unverified phishing hyperlink (sbi-verification-secure.com)',
        'Impersonation of State Bank of India'
      ],
      recommended_action: 'Do NOT click the link. Confirm account status by calling your branch or visiting official SBI website.',
      tts_warning: 'सावधान! यह एक बैंक धोखाधड़ी संदेश है। कृपया लिंक पर क्लिक न करें या अपने विवरण साझा न करें।'
    }
  },
  {
    id: 'utility-scam',
    title: 'Electricity Cutoff (SMS)',
    type: 'SMS',
    label: 'High Risk',
    sender: 'Utility-Alert',
    content: 'Dear customer, your electricity power will be disconnected at 9:30 PM tonight because your previous monthly invoice remains unpaid. To stop disconnect, contact utility coordinator at 98765-43210 immediately.',
    simulatedResponse: {
      threat_score: 96,
      confidence_score: 98,
      risk_level: 'HIGH',
      threat_type: 'Utility Bill Scam',
      reason_flags: [
        'High urgency manipulation (power cutoff at 9:30 PM)',
        'Direct financial demand to clear unpaid dues',
        'Directs you to dial a personal 10-digit mobile number'
      ],
      recommended_action: 'Ignore this message. Utility companies never request immediate payment via individual mobile numbers.',
      tts_warning: 'बिजली कनेक्शन काटने की धमकी एक बड़ा धोखा है। किसी भी व्यक्तिगत नंबर पर पेमेंट न करें।'
    }
  },
  {
    id: 'lottery-audio',
    title: 'Lottery Prize (Voice Note)',
    type: 'Voice Note',
    label: 'High Risk',
    sender: 'KBC Winner Desk',
    content: 'Hello, congratulations! I am calling from KBC department. You have won 25 lakh rupees in our annual lottery drawer! To receive this money, you must transfer a processing fee of 15,000 rupees to our lottery manager account now. Please transfer immediately.',
    simulatedResponse: {
      threat_score: 89,
      confidence_score: 90,
      risk_level: 'HIGH',
      threat_type: 'Lottery Scam',
      reason_flags: [
        'Unsolicited claims of winning high cash prizes',
        'Request for upfront processing fee (15,000 Rs)',
        'Artificial urgency pressure to send money immediately'
      ],
      recommended_action: 'Do not transfer money or share banking details. Legitimate lottery schemes never require upfront deposits.',
      tts_warning: 'लाटरी के नाम पर धोखाधड़ी से बचें। प्रोसेसिंग फीस के लिए कोई भी पैसा ट्रांसफर न करें।'
    }
  },
  {
    id: 'job-scam',
    title: 'YouTube Likes Job (SMS)',
    type: 'SMS',
    label: 'Suspicious',
    sender: '+91 76543-98765',
    content: 'Earn Rs 5000 per day by working online! Part-time simple YouTube video likes and reviews job. No experience needed. Join our Telegram group: t.me/youtube-likes-pay to start earning.',
    simulatedResponse: {
      threat_score: 62,
      confidence_score: 85,
      risk_level: 'SUSPICIOUS',
      threat_type: 'Task/Job Scam',
      reason_flags: [
        'Unrealistic daily income claim (Rs 5000/day)',
        'Requests communication redirection to Telegram chat groups',
        'High likelihood of advance-fee task scam layout'
      ],
      recommended_action: 'Exercise extreme caution. Do not deposit registration fees or complete tasks demanding security deposits.',
      tts_warning: 'यूट्यूब लाइक जॉब्स के जरिए होने वाली धोखाधड़ी से सावधान रहें। कोई रजिस्ट्रेशन फीस न दें।'
    }
  },
  {
    id: 'safe-chat',
    title: 'Reaching Home (Safe)',
    type: 'Text',
    label: 'Safe',
    sender: 'Son (Rahul)',
    content: 'Hi dad, I completed my classes for the day. Reaching home by metro. Should I buy some milk on my way back? Let me know.',
    simulatedResponse: {
      threat_score: 8,
      confidence_score: 99,
      risk_level: 'SAFE',
      threat_type: 'Legitimate Communication',
      reason_flags: [
        'No urgent financial demands found',
        'Conversational family dialogue pattern'
      ],
      recommended_action: 'Safe to answer. No security flags raised.',
      tts_warning: 'यह संदेश सुरक्षित है। आप जवाब दे सकते हैं।'
    }
  }
];

export default function WhatsAppSimulator({ addIncidentLog, guardianProfile, backendMode, backendUrl }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '🛡️ *Welcome to Kavach AI Guard!*\n\nI am your conversational security assistant. Forward any suspicious SMS message, paste suspect text, upload screenshots, or voice notes here.\n\nI will instantly analyze it for scam markers!',
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGuardianAlert, setShowGuardianAlert] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSpeech = (text, lang = 'hi-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported on this browser.');
    }
  };

  const handleSend = async (text, customType = 'SMS') => {
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = Date.now().toString();

    // 1. Add User Message
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: text,
      time: timestamp
    }]);
    setInputText('');
    setIsTyping(true);

    // If using live API mode, call FastAPI endpoints
    if (backendMode) {
      try {
        // Step A: Translate text if needed (using API)
        const transRes = await fetch(`${backendUrl}/api/translate-input`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ text: text })
        });
        
        let textToAnalyze = text;
        if (transRes.ok) {
          const transData = await transRes.json();
          textToAnalyze = transData.translated_text || text;
        }

        // Step B: Run threat analysis
        const analysisRes = await fetch(`${backendUrl}/api/analyze-threat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToAnalyze,
            input_type: customType,
            guardian_enabled: true,
            guardian_on_suspicious: false
          })
        });

        if (analysisRes.ok) {
          const result = await analysisRes.json();
          const analysis = result.analysis;
          const loggedId = result.logged_id;
          
          setIsTyping(false);

          // Add bot response in chat
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            isCard: true,
            data: analysis,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

          // Push to shared global dashboard list
          addIncidentLog({
            id: loggedId || userMsgId,
            original_text: text,
            input_type: customType,
            threat_score: analysis.threat_score,
            confidence_score: analysis.confidence_score,
            risk_level: analysis.risk_level,
            threat_type: analysis.threat_type,
            reason_flags: analysis.reason_flags,
            recommended_action: analysis.recommended_action,
            timestamp: new Date().toLocaleString()
          });

          // Trigger Twilio guardian alert
          if (analysis.risk_level === 'HIGH') {
            const smsRes = await fetch(`${backendUrl}/api/notify-guardian`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone_number: guardianProfile.guardianPhone || '+919876543210',
                scam_type: analysis.threat_type,
                threat_score: analysis.threat_score,
                user_name: guardianProfile.userName || 'User',
                logged_id: loggedId
              })
            });

            // Trigger UI pop-up notification
            setActiveAlert({
              userName: guardianProfile.userName || 'User',
              guardianName: guardianProfile.guardianName || 'Guardian',
              phone: guardianProfile.guardianPhone || '+91 98765-43210',
              type: analysis.threat_type,
              score: analysis.threat_score
            });
            setShowGuardianAlert(true);
          }
          return;
        }
      } catch (err) {
        console.error('FastAPI integration failed, falling back to simulator logic:', err);
      }
    }

    // SIMULATED / OFFLINE FALLBACK ENGINE
    setTimeout(() => {
      setIsTyping(false);
      
      // Match predefined scenarios or compute heuristics
      const matchingScen = SCENARIOS.find(s => text.toLowerCase().includes(s.content.substring(0, 15).toLowerCase()));
      let responseData;

      if (matchingScen) {
        responseData = matchingScen.simulatedResponse;
      } else {
        // Fallback calculations for arbitrary text
        const lowerText = text.toLowerCase();
        let score = 15;
        let category = 'Legitimate Communication';
        let flags = ['No critical threat indicators found.'];
        let action = 'This message appears safe. Always verify the source before transfer.';
        let tts = 'यह संदेश सुरक्षित लग रहा है। सतर्क रहें।';

        if (lowerText.includes('win') || lowerText.includes('prize') || lowerText.includes('lottery')) {
          score = 85;
          category = 'Lottery Scam';
          flags = ['Offers unexpected lottery reward', 'Suspicious promotional messaging'];
          action = 'Ignore unsolicited winnings. Do not submit processing fees.';
          tts = 'लाटरी के झांसे में न आएं, पैसे न भेजें।';
        } else if (lowerText.includes('otp') || lowerText.includes('verify') || lowerText.includes('block') || lowerText.includes('bank')) {
          score = 78;
          category = 'Credential Phishing';
          flags = ['Urges account details verification', 'Promotes suspicious links or actions'];
          action = 'Contact your bank directly. Do not reveal passwords or OTPs.';
          tts = 'अपना ओटीपी या पिन कभी किसी के साथ साझा न करें।';
        } else if (lowerText.includes('bill') || lowerText.includes('disconnect') || lowerText.includes('electricity')) {
          score = 92;
          category = 'Utility Bill Scam';
          flags = ['Threat of utilities cutoff', 'Directs to phone dialers or web portals'];
          action = 'Check bill details on official government app. Never pay private numbers.';
          tts = 'बिजली कटौती की धमकी फर्जी है, किसी नंबर पर कॉल न करें।';
        }

        responseData = {
          threat_score: score,
          confidence_score: 82,
          risk_level: score >= 70 ? 'HIGH' : score >= 40 ? 'SUSPICIOUS' : 'SAFE',
          threat_type: category,
          reason_flags: flags,
          recommended_action: action,
          tts_warning: tts
        };
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        isCard: true,
        data: responseData,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      addIncidentLog({
        id: userMsgId,
        original_text: text,
        input_type: customType,
        threat_score: responseData.threat_score,
        confidence_score: responseData.confidence_score,
        risk_level: responseData.risk_level,
        threat_type: responseData.threat_type,
        reason_flags: responseData.reason_flags,
        recommended_action: responseData.recommended_action,
        timestamp: new Date().toLocaleString()
      });

      if (responseData.risk_level === 'HIGH') {
        setActiveAlert({
          userName: guardianProfile.userName || 'User',
          guardianName: guardianProfile.guardianName || 'Guardian',
          phone: guardianProfile.guardianPhone || '+91 98765-43210',
          type: responseData.threat_type,
          score: responseData.threat_score
        });
        setShowGuardianAlert(true);
      }
    }, 1500);
  };

  const loadScenario = (scenario) => {
    handleSend(scenario.content, scenario.type);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', animation: 'slideUp 0.4s ease' }}>
      {/* Left panel - Scenario Triggers & Instructions */}
      <div>
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-wa)' }} /> How to Test Kavach AI Assistant
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            Select one of the preloaded scam scenarios below to simulate forwarding it to the WhatsApp Bot. Alternatively, type or paste custom text directly into the phone mockup.
          </p>

          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Preloaded Sandbox Scenarios</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {SCENARIOS.map(sc => (
              <div key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{sc.title}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: sc.label === 'High Risk' ? 'rgba(239, 68, 68, 0.12)' : sc.label === 'Suspicious' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: sc.label === 'High Risk' ? 'var(--color-threat)' : sc.label === 'Suspicious' ? 'var(--color-suspicious)' : 'var(--color-safe)'
                    }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                    {sc.content}
                  </p>
                </div>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => loadScenario(sc)}>
                  Forward <Send size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Engine Routing Status</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {backendMode ? `Live Mode: Forwarding payloads to FastAPI API layer (${backendUrl})` : 'Offline Simulator Mode: Processing inputs locally (No keys required)'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: backendMode ? 'cyan' : 'var(--accent-wa)', borderRadius: '50%', boxShadow: backendMode ? '0 0 10px cyan' : 'var(--shadow-neon)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{backendMode ? 'LIVE API GATEWAY' : 'LOCAL SIMULATOR'}</span>
          </div>
        </div>
      </div>

      {/* Right panel - WhatsApp Mockup */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="phone-mockup">
          {/* Header */}
          <div className="phone-header">
            <div className="wa-avatar">
              🛡️
              <div className="wa-avatar-online"></div>
            </div>
            <div className="wa-contact-info">
              <div className="wa-contact-name">
                Kavach AI Shield <ShieldCheck size={16} style={{ color: 'var(--accent-wa)', fill: 'rgba(16, 185, 129, 0.1)' }} />
              </div>
              <div className="wa-contact-status">online</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
              <PhoneCall size={16} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="phone-chat-area">
            {messages.map((m, idx) => (
              <div key={m.id || idx} className={`chat-bubble ${m.sender === 'user' ? 'bubble-sent' : 'bubble-received'}`}>
                {!m.isCard ? (
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                ) : (
                  <div className="ai-wa-card">
                    <div className="ai-card-title">
                      <AlertOctagon size={14} /> Kavach Safety Audit
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verdict:</span>
                      <span className={`wa-threat-badge ${m.data.risk_level === 'HIGH' ? 'badge-high' : m.data.risk_level === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-safe'}`}>
                        {m.data.risk_level} THREAT
                      </span>
                    </div>

                    <div className="wa-card-metric">
                      <span>Threat Score: {m.data.threat_score}%</span>
                      <span>Confidence: {m.data.confidence_score}%</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      Category: {m.data.threat_type}
                    </div>

                    <ul className="wa-bullet-list">
                      {m.data.reason_flags.map((flag, fIdx) => (
                        <li key={fIdx}>{flag}</li>
                      ))}
                    </ul>

                    <div className="wa-card-action">
                      <strong>Next Action:</strong> {m.data.recommended_action}
                    </div>

                    <div className="wa-card-buttons">
                      {m.data.tts_warning && (
                        <button className="btn-wa-action" onClick={() => handleSpeech(m.data.tts_warning)}>
                          <Volume2 size={12} /> Play warning
                        </button>
                      )}
                      {m.data.risk_level === 'HIGH' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                          <CheckCheck size={12} style={{ color: 'var(--accent-wa)' }} /> SMS Alert Sent
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="chat-time">{m.time}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble bubble-received" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kavach checking</span>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form className="phone-footer" onSubmit={(e) => { e.preventDefault(); handleSend(inputText, 'SMS'); }}>
            <input
              type="text"
              className="phone-input"
              placeholder="Type or paste message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="phone-send-btn">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Guardian SMS Alert Visual Overlay Popup */}
      {showGuardianAlert && activeAlert && (
        <div className="guardian-pop-toast pulse-red">
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-threat)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>GUARDIAN SMS DISPATCHED</h4>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setShowGuardianAlert(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              An emergency warning SMS has been sent to guardian <strong>{activeAlert.guardianName} ({activeAlert.phone})</strong>.
            </p>
            <div style={{ background: '#1c2536', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px', fontSize: '0.7rem', color: '#f8fafc', marginTop: '8px', fontFamily: 'monospace' }}>
              "ALERT: {activeAlert.userName} is target of {activeAlert.type} (Threat Score: {activeAlert.score}%). Check phone immediately."
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
