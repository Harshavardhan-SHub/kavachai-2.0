"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Upload, 
  Play, 
  Square, 
  Trash2, 
  History as HistoryIcon, 
  User, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Loader2, 
  Wifi, 
  WifiOff,
  Bell,
  ArrowRight,
  Save,
  Search,
  AlertCircle,
  Zap,
  Activity,
  Radio,
  Eye,
  Clock,
  ChevronRight,
  Mic,
  Signal,
  Fingerprint
} from "lucide-react";

// Backend base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Spoken warnings for High Threat events
const LOCAL_WARNINGS_HIGH = {
  "en-IN": "Warning. Fraud detected. This communication is dangerous. Do not send money or share sensitive information.",
  "hi-IN": "चेतावनी। धोखाधड़ी का पता चला है। यह संचार खतरनाक है। पैसे न भेजें और संवेदनशील जानकारी साझा न करें।",
  "te-IN": "హెచ్చరిక. మోసం కనుగొనబడింది. ఈ కమ్యూనికేషన్ ప్రమాదకరమైనది. డబ్బు పంపకండి మరియు వ్యక్తిగత వివరాలను పంచుకోకండి.",
  "ta-IN": "எச்சரிக்கை. மோசடி கண்டறியப்பட்டது. இந்த தொடர்பு ஆபத்தானது. பணம் அனுப்ப வேண்டாம் மற்றும் தனிப்பட்ட விவரங்களை பகிர வேண்டாம்.",
  "kn-IN": "ಎಚ್ಚರಿಕೆ. ವಂಚನೆ ಪತ್ತೆಯಾಗಿದೆ. ಈ ಸಂವಹನವು ಅಪಾಯಕಾರಿಯಾಗಿದೆ. ಹಣವನ್ನು ಕಳುಹಿಸಬೇಡಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
  "ml-IN": "മുന്നറിയിപ്പ്. തട്ടിപ്പ് കണ്ടെത്തി. ഈ ആശയവിനിമയം അപകടകരമാണ്. പണം അയക്കരുത്, വ്യക്തിഗത വിവരങ്ങൾ പങ്കിടരുത്.",
  "mr-IN": "इशारा. हा संवाद धोकादायक आहे. पैसे पाठवू नका आणि संवेदनशील माहिती शेअर करू नका.",
  "gu-IN": "ચેતવણી. છેતરપિંડી જણાઈ છે. આ કમ્યુનિકેશન જોખમી છે. પૈસા મોકલશો નહીં અને સંવેદનશીલ માહિતી શેર કરશો નહીં.",
  "bn-IN": "সতর্কতা। প্রতারণা সনাক্ত করা গেছে। এই যোগাযোগটি বিপজ্জনক। টাকা পাঠাবেন না এবং কোনো তথ্য শেয়ার করবেন না।",
  "pa-IN": "ਚੇਤਾਵਨੀ। ਧੋਖਾਧੜੀ ਦਾ ਪਤਾ ਲੱਗਾ ਹੈ। ਇਹ ਗੱਲਬਾਤ ਖ਼ਤਰਨਾਕ ਹੈ। ਪੈਸੇ ਨਾ ਭੇਜੋ ਅਤੇ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਨਾ ਕਰੋ।",
  "or-IN": "ସତର୍କତା। ପ୍ରତାରଣା ଚିହ୍ନଟ ହୋଇଛି। ଏହି ଯୋଗାଯୋଗ ବିପଜ୍ଜନକ ଅଟେ। ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ କିମ୍ବା ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ସେୟାର କରନ୍ତୁ ନାହିଁ।",
  "as-IN": "সতৰ্কবাণী। প্ৰতাৰণা ধৰা পৰিছে। এই যোগাযোগ বিপজ্জনক। ধন প্ৰেৰণ নকৰিব আৰু গোপনীয় তথ্য শ্বেয়াৰ নকৰিব।",
  "ur-IN": "انتباہ۔ دھوکہ دہی کا پتہ چلا ہے۔ یہ رابطہ خطرناک ہے۔ پیسے نہ بھیجیں اور حساس معلومات شیئر نہ کریں۔"
};

// Spoken warnings for Suspicious events
const LOCAL_WARNINGS_SUSPICIOUS = {
  "en-IN": "Caution. This communication appears suspicious. Please verify the sender before taking any action.",
  "hi-IN": "सावधान। यह संचार संदिग्ध प्रतीत होता है। कृपया कोई भी कदम उठाने से पहले प्रेषक की पुष्टि करें।",
  "te-IN": "జాగ్రత్త. ఈ కమ్యూనికేషన్ అనుమానాస్పదంగా ఉంది. దయచేసి ఏదైనా చర్య తీసుకునే ముందు పంపినవారిని ధృవీకరించండి.",
  "ta-IN": "எச்சரிக்கை. இந்த தொடர்பு சந்தேகத்திற்குரியதாகத் தெரிகிறது. தயவுசெய்து எந்த நடவடிக்கையும் எடுப்பதற்கு முன் அனுப்புநரை சரிபார்க்கவும்.",
  "kn-IN": "ಎಚ್ಚರಿಕೆ. ಈ ಸಂವಹನವು ಅನುಮಾನಾಸ್ಪದವಾಗಿ ಕಂಡುಬರುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಯಾವುದೇ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಕಳುಹಿಸಿದವರನ್ನು ದೃಢೀಕರಿಸಿ.",
  "ml-IN": "ജാഗ്രത. ഈ ആശയവിനിമയം സംശയാസ്പദമായി തോന്നുന്നു. എന്തെങ്കിലും നടപടി സ്വീകരിക്കുന്നതിന് മുമ്പ് അയച്ചയാളെ പരിശോധിക്കുക.",
  "mr-IN": "सावधान. हा संवाद संशयास्पद वाटतो. कृपया कोणतीही कारवाई करण्यापूर्वी पाठवणाऱ्याची खात्री करा.",
  "gu-IN": "સાવધાન. આ કમ્યુનિકેશન શંકાસ્પદ જણાય છે. કૃપા કરીને કોઈ પણ પગલું ભરતા પહેલા મોકલનારની ચકાસણી કરો.",
  "bn-IN": "সতর্কতা। এই যোগাযোগটি সন্দেহজনক বলে মনে হচ্ছে। কোনো পদক্ষেপ নেওয়ার আগে প্রেরককে যাচাই করুন।",
  "pa-IN": "ਸਾਵਧਾਨ। ਇਹ ਗੱਲਬਾਤ ਸ਼ੱਕੀ ਜਾਪਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਵੀ ਕਦਮ ਚੁੱਕਣ ਤੋਂ ਪਹਿਲਾਂ ਭੇਜਣ ਵਾਲੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
  "or-IN": "ସତର୍କତା। ଏହି ଯୋଗାଯୋଗ ସନ୍ଦେହଜନକ ମନେହେଉଛି। କୌଣସି ପଦକ୍ଷେପ ନେବା ପୂର୍ବରୁ ପ୍ରେରକଙ୍କୁ ଯାଞ୍ಚ କରନ୍ତୁ।",
  "as-IN": "সতৰ্কবাণী। এই যোগাযোগ সন্দেহজনক যেন লাগিছে। কোনো পদক্ষেপ লোৱাৰ আগতে প্ৰেৰকজনক পৰীক্ষা কৰক।",
  "ur-IN": "احتیاط۔ یہ رابطہ مشکوک لگتا ہے۔ براہ کرم کوئی بھی اقدام کرنے سے پہلے بھیجنے والے کی تصدیق کریں۔"
};

const REGIONAL_LANGUAGES = [
  {
    region: "Global",
    languages: [{ code: "en-IN", name: "English (Indian)" }]
  },
  {
    region: "North / Central",
    languages: [
      { code: "hi-IN", name: "Hindi (हिन्दी)" },
      { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)" },
      { code: "ur-IN", name: "Urdu (اردو)" }
    ]
  },
  {
    region: "South",
    languages: [
      { code: "te-IN", name: "Telugu (తెలుగు)" },
      { code: "ta-IN", name: "Tamil (தமிழ்)" },
      { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
      { code: "ml-IN", name: "Malayalam (മലയാളം)" }
    ]
  },
  {
    region: "West",
    languages: [
      { code: "mr-IN", name: "Marathi (मराठी)" },
      { code: "gu-IN", name: "Gujarati (ગુજરાતી)" }
    ]
  },
  {
    region: "East",
    languages: [
      { code: "bn-IN", name: "Bengali (বাংলা)" },
      { code: "or-IN", name: "Odia (ଓଡ଼ିଆ)" },
      { code: "as-IN", name: "Assamese (অসমীয়া)" }
    ]
  }
];

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.25 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }
};

// --- Particle Background Component ---
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.3 + 0.05;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.fill();
      }
    }

    const PARTICLE_COUNT = 40;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

// --- Waveform Visualizer Component ---
function WaveformVisualizer({ active, color = "text-indigo-400", barCount = 7 }) {
  return (
    <div className="flex items-center gap-[3px] h-6">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`waveform-bar ${color} ${!active ? "!animate-none !h-[4px]" : ""}`}
          style={!active ? { height: "4px" } : undefined}
        />
      ))}
    </div>
  );
}

// --- Main Component ---
export default function Home() {
  const [appState, setAppState] = useState("splash"); // splash | login | otp | profile_setup | activation | dashboard
  const [profile, setProfile] = useState({
    phone_number: "",
    protected_name: "",
    guardian_number: "",
    preferred_language: "hi-IN",
    notify_high: true,
    notify_suspicious: false,
    profile_completed: false
  });

  // Derived selectors for compatibility
  const authPhone = profile.phone_number;
  const protectedUserName = profile.protected_name;
  const guardianPhone = profile.guardian_number;
  const warningLanguage = profile.preferred_language;
  const guardianOnHigh = profile.notify_high;
  const guardianOnSuspicious = profile.notify_suspicious;
  const profileCompleted = profile.profile_completed;

  // Compatibility setters to update the shared profile object
  const setAuthPhone = (val) => setProfile(prev => ({ ...prev, phone_number: typeof val === "function" ? val(prev.phone_number) : val }));
  const setProtectedUserName = (val) => setProfile(prev => ({ ...prev, protected_name: typeof val === "function" ? val(prev.protected_name) : val }));
  const setGuardianPhone = (val) => setProfile(prev => ({ ...prev, guardian_number: typeof val === "function" ? val(prev.guardian_number) : val }));
  const setWarningLanguage = (val) => setProfile(prev => ({ ...prev, preferred_language: typeof val === "function" ? val(prev.preferred_language) : val }));
  const setGuardianOnHigh = (val) => setProfile(prev => ({ ...prev, notify_high: typeof val === "function" ? val(prev.notify_high) : val }));
  const setGuardianOnSuspicious = (val) => setProfile(prev => ({ ...prev, notify_suspicious: typeof val === "function" ? val(prev.notify_suspicious) : val }));


  const [currentTab, setCurrentTab] = useState("dashboard");
  const [backendConnected, setBackendConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const [inputMode, setInputMode] = useState("sms"); // sms | audio | call
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [smsText, setSmsText] = useState("");
  
  // --- AUDIO STATES ---
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioValid, setAudioValid] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioPlayingFile, setAudioPlayingFile] = useState(false);
  
  // --- SETTINGS (Persisted) ---
  const [guardianEnabled, setGuardianEnabled] = useState(true);
  const [threatThreshold, setThreatThreshold] = useState(70);
  const [searchLangQuery, setSearchLangQuery] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // --- SCAN RESULTS ---
  const [normalizedText, setNormalizedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [guardianSmsStatus, setGuardianSmsStatus] = useState("Not Sent");
  const [guardianSmsError, setGuardianSmsError] = useState(null);
  const [bubbleError, setBubbleError] = useState(null);
  
  // --- CALL OVERLAY ---
  const [callState, setCallState] = useState("idle");
  const [callTimer, setCallTimer] = useState(0);
  const [callTranscript, setCallTranscript] = useState("");
  const callTimerRef = useRef(null);
  
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- AUDIO METADATA DURATION DETECTOR ---
  const readAudioDuration = (file) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = url;
      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
    });
  };

  const syncProfile = useCallback(async (phone) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile?phone_number=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.phone_number) {
          const isCompleted = data.profile_completed === true;
          setProfile({
            phone_number: data.phone_number,
            protected_name: data.protected_name || "",
            guardian_number: data.guardian_number || "",
            preferred_language: data.preferred_language || "hi-IN",
            notify_high: data.notify_high !== false,
            notify_suspicious: data.notify_suspicious === true,
            profile_completed: isCompleted
          });
          
          localStorage.setItem("kavach_protected_name", data.protected_name || "");
          localStorage.setItem("kavach_guardian_phone", data.guardian_number || "");
          localStorage.setItem("kavach_warning_lang", data.preferred_language || "hi-IN");
          localStorage.setItem("kavach_guardian_on_high", (data.notify_high !== false).toString());
          localStorage.setItem("kavach_guardian_on_suspicious", (data.notify_suspicious === true).toString());
          localStorage.setItem("kavach_profile_saved", isCompleted ? "true" : "false");
        }
      }
    } catch (err) {
      console.error("Error syncing profile to backend: ", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("kavach_auth_user");
      const savedProfileSaved = localStorage.getItem("kavach_profile_saved");
      if (savedUser) {
        syncProfile(savedUser);
        
        const savedName = localStorage.getItem("kavach_protected_name") || "";
        const savedPhone = localStorage.getItem("kavach_guardian_phone") || "";
        const savedLang = localStorage.getItem("kavach_warning_lang") || "hi-IN";
        const savedOnHigh = localStorage.getItem("kavach_guardian_on_high") !== "false";
        const savedOnSus = localStorage.getItem("kavach_guardian_on_suspicious") === "true";
        
        setProfile({
          phone_number: savedUser,
          protected_name: savedName,
          guardian_number: savedPhone,
          preferred_language: savedLang,
          notify_high: savedOnHigh,
          notify_suspicious: savedOnSus,
          profile_completed: savedProfileSaved === "true"
        });
        
        if (savedProfileSaved !== "true") {
          setAppState("profile_setup");
        }
        
        const savedEnabled = localStorage.getItem("kavach_guardian_enabled");
        if (savedEnabled !== null) setGuardianEnabled(savedEnabled === "true");
        const savedThreshold = localStorage.getItem("kavach_threat_threshold");
        if (savedThreshold !== null) setThreatThreshold(parseInt(savedThreshold));
      }
    }
  }, [syncProfile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("kavach_auth_user");
      const savedProfileSaved = localStorage.getItem("kavach_profile_saved");
      if (appState === "dashboard" && (!savedUser || savedProfileSaved !== "true")) {
        if (!savedUser) {
          setAppState("login");
        } else {
          setAppState("profile_setup");
        }
      }
    }
  }, [appState]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out and deactivate protection?")) {
      localStorage.removeItem("kavach_auth_user");
      localStorage.removeItem("kavach_profile_saved");
      localStorage.removeItem("kavach_protected_name");
      localStorage.removeItem("kavach_guardian_phone");
      localStorage.removeItem("kavach_warning_lang");
      localStorage.removeItem("kavach_guardian_on_high");
      localStorage.removeItem("kavach_guardian_on_suspicious");
      
      setProfile({
        phone_number: "",
        protected_name: "",
        guardian_number: "",
        preferred_language: "hi-IN",
        notify_high: true,
        notify_suspicious: false,
        profile_completed: false
      });
      
      setAppState("login");
      setCurrentTab("dashboard");
    }
  };

  const checkBackendHealth = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) setBackendConnected(true);
      else setBackendConnected(false);
    } catch (err) {
      setBackendConnected(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setIncidentHistory(data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    fetchHistory();
  }, []);

  const playBrowserSpeech = (text, langCode) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = voices.find(v => v.lang.startsWith(langCode));
      if (!matchedVoice && langCode.startsWith("te")) {
        matchedVoice = voices.find(v => v.lang.startsWith("hi")) || voices.find(v => v.lang.startsWith("en"));
      }
      if (matchedVoice) utterance.voice = matchedVoice;
      
      utterance.onstart = () => setAudioPlaying(true);
      utterance.onend = () => setAudioPlaying(false);
      utterance.onerror = () => setAudioPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
    }
  };

  const handleSaveSettings = async () => {
    localStorage.setItem("kavach_guardian_enabled", guardianEnabled);
    localStorage.setItem("kavach_guardian_phone", guardianPhone);
    localStorage.setItem("kavach_warning_lang", warningLanguage);
    localStorage.setItem("kavach_threat_threshold", threatThreshold);
    localStorage.setItem("kavach_guardian_on_high", guardianOnHigh);
    localStorage.setItem("kavach_guardian_on_suspicious", guardianOnSuspicious);
    localStorage.setItem("kavach_protected_name", protectedUserName);
    localStorage.setItem("kavach_profile_saved", "true");
    
    // Sync to backend
    const cleanGuardian = guardianPhone.replace(/[\s-]/g, "");
    try {
      await fetch(`${BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: authPhone,
          protected_name: protectedUserName,
          guardian_number: cleanGuardian,
          preferred_language: warningLanguage,
          notify_high: guardianOnHigh,
          notify_suspicious: guardianOnSuspicious,
          profile_completed: true
        })
      });
    } catch (e) {
      console.error("Failed to sync updated profile to backend:", e);
    }
    
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // --- RUN PIPELINE ---
  const runPipeline = async (inputText, fileObject) => {
    if (isProcessing) return;

    // Hard Audio Limit Check (safety redundancy)
    if (fileObject && audioDuration > 25) {
      setAudioError("Audio exceeds maximum supported duration for real-time analysis. Please upload audio shorter than 25 seconds.");
      return;
    }
    
    setIsProcessing(true);
    setPipelineStep(1);
    setAnalysisResult(null);
    setNormalizedText("");
    setGuardianSmsStatus("Not Sent");
    setGuardianSmsError(null);
    setBubbleError(null);
    stopPlayback();

    try {
      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(2);

      let translated = "";
      let lang = "hi-IN";
      
      if (fileObject) {
        const formData = new FormData();
        formData.append("file", fileObject, audioFileName || "recorded_input.wav");
        formData.append("language_code", warningLanguage);
        
        const res = await fetch(`${BACKEND_URL}/api/translate-input`, {
          method: "POST",
          body: formData
        });
        
        if (res.status === 400) {
          const detail = await res.text();
          throw new Error(`[API ERROR 400] STT translation failed. Stop execution. Details: ${detail}`);
        }
        if (!res.ok) throw new Error("Translation service failed");
        
        const data = await res.json();
        translated = data.translated_text;
        lang = data.detected_language;
      } else {
        const formData = new FormData();
        formData.append("text", inputText);
        formData.append("language_code", warningLanguage);
        
        const res = await fetch(`${BACKEND_URL}/api/translate-input`, {
          method: "POST",
          body: formData
        });
        
        if (res.status === 400) {
          const detail = await res.text();
          throw new Error(`[API ERROR 400] Text translation failed. Stop execution. Details: ${detail}`);
        }
        if (!res.ok) throw new Error("Translation service failed");
        
        const data = await res.json();
        translated = data.translated_text;
        lang = data.detected_language;
      }

      setNormalizedText(translated);
      setDetectedLanguage(lang);
      
      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(3);

      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(4);
      
      const resAnalysis = await fetch(`${BACKEND_URL}/api/analyze-threat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: translated,
          input_type: inputMode === "sms" ? "SMS" : inputMode === "audio" ? "Audio" : "Call",
          guardian_enabled: guardianEnabled,
          guardian_on_suspicious: guardianOnSuspicious
        })
      });
      
      if (resAnalysis.status === 400) {
        const detail = await resAnalysis.text();
        throw new Error(`[API ERROR 400] Gemini threat analysis failed. Stop execution. Details: ${detail}`);
      }
      if (!resAnalysis.ok) throw new Error("Threat analysis service failed");
      
      const analysisData = await resAnalysis.json();
      setAnalysisResult(analysisData.analysis);
      
      await new Promise(r => setTimeout(r, 500));
      setPipelineStep(5);
      
      const score = analysisData.analysis.threat_score;
      const risk = analysisData.analysis.risk_level;
      
      const isHigh = score >= threatThreshold || risk === "HIGH";
      const isSuspicious = !isHigh && score >= 36;
      
      if (isHigh || isSuspicious) {
        const warningTxt = isHigh
          ? (LOCAL_WARNINGS_HIGH[warningLanguage] || LOCAL_WARNINGS_HIGH["en-IN"])
          : (LOCAL_WARNINGS_SUSPICIOUS[warningLanguage] || LOCAL_WARNINGS_SUSPICIOUS["en-IN"]);
          
        try {
          const resTTS = await fetch(`${BACKEND_URL}/api/generate-warning-audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: warningTxt, language_code: warningLanguage })
          });
          
          if (resTTS.ok) {
            const ttsData = await resTTS.json();
            if (ttsData.fallback_web_speech) {
              playBrowserSpeech(warningTxt, warningLanguage);
            } else {
              const audioBlob = new Blob(
                [Uint8Array.from(atob(ttsData.audio_base64), c => c.charCodeAt(0))],
                { type: "audio/wav" }
              );
              const url = URL.createObjectURL(audioBlob);
              if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setAudioPlaying(true);
              }
            }
          } else {
            playBrowserSpeech(warningTxt, warningLanguage);
          }
        } catch (e) {
          playBrowserSpeech(warningTxt, warningLanguage);
        }

        const shouldSendHigh = isHigh && guardianOnHigh;
        const shouldSendSus = isSuspicious && guardianOnSuspicious;
        
        if (guardianEnabled && guardianPhone && (shouldSendHigh || shouldSendSus)) {
          setGuardianSmsStatus("Sending...");
          try {
            const resGuardian = await fetch(`${BACKEND_URL}/api/notify-guardian`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone_number: guardianPhone,
                scam_type: analysisData.analysis.threat_type,
                threat_score: score,
                user_name: protectedUserName || "User",
                logged_id: analysisData.logged_id
              })
            });
            
            const guardData = await resGuardian.json();
            if (resGuardian.ok && guardData.sent) {
              setGuardianSmsStatus("Sent");
            } else {
              setGuardianSmsStatus("Failed");
              setGuardianSmsError(guardData.message || "Failed to dispatch Twilio SMS");
            }
          } catch (e) {
            setGuardianSmsStatus("Failed");
            setGuardianSmsError("Network connection error to Twilio handler");
          }
        } else {
          setGuardianSmsStatus("Disabled");
        }
      } else {
        setGuardianSmsStatus("Not Sent");
      }
      
      fetchHistory();
      
    } catch (err) {
      console.error(err);
      const errMessage = err.message || "Threat scan failed";
      
      setBubbleError(errMessage);
      setAnalysisResult({
        threat_score: 0,
        confidence_score: 0,
        risk_level: "SAFE",
        threat_type: "Error Encountered",
        reason_flags: ["Execution stopped due to API error"],
        recommended_action: errMessage
      });
      setPipelineStep(5);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmsAnalyze = () => {
    if (!smsText.trim()) return;
    runPipeline(smsText, null);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      setAudioError(null);
      setAudioValid(false);
      setAudioDuration(0);
      setAudioPlayingFile(false);
      stopPlayback();
      
      const duration = await readAudioDuration(file);
      setAudioDuration(duration);
      
      if (duration > 25) {
        setAudioError("Audio exceeds maximum supported duration for real-time analysis. Please upload audio shorter than 25 seconds.");
        setAudioValid(false);
      } else {
        setAudioValid(true);
      }
    }
  };

  const handleAudioAnalyze = () => {
    if (!audioFile || !audioValid) return;
    runPipeline("", audioFile);
  };

  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
      setAudioFile(null);
      setAudioFileName("");
      setAudioDuration(0);
      setAudioValid(false);
      setAudioError(null);
      setAudioPlayingFile(false);
      stopPlayback();
      
      setTimeout(() => {
        setRecording(false);
        const dummyBlob = new Blob(["mock-captured-voice"], { type: "audio/wav" });
        setAudioFile(dummyBlob);
        setAudioFileName("recorded_mic_input.wav");
        setAudioDuration(14.8);
        setAudioValid(true);
      }, 3000);
    }
  };

  const triggerIncomingCall = () => {
    setCallState("ringing");
    setCallTranscript("");
    stopPlayback();
  };

  const acceptCall = () => {
    setCallState("active");
    setCallTimer(0);
    setCallTranscript("Listening to caller...");
    
    const lines = [
      { delay: 1500, text: "[Caller]: नमस्कार! बिजली विभाग से बोल रहा हूँ। आपका पिछले महीने का बिल पेंडिंग है।" },
      { delay: 5000, text: "[Caller]: अगर आपने तुरंत ₹2000 ट्रांसफर नहीं किए, तो आपका कनेक्शन 10 मिनट में काट दिया जाएगा।" }
    ];

    lines.forEach(line => {
      setTimeout(() => {
        setCallTranscript(prev => prev + "\n" + line.text);
      }, line.delay);
    });

    setTimeout(() => {
      setCallTranscript(prev => prev + "\n\n[System]: Analyzing scam potential...");
      runPipeline("Your electricity connection will be disconnected. Transfer 2000 rupees immediately.", null);
    }, 7500);

    callTimerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    clearInterval(callTimerRef.current);
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
    }, 800);
  };

  const clearHistory = async () => {
    if (confirm("Are you sure you want to clear incident logs?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/history`, { method: "DELETE" });
        if (res.ok) setIncidentHistory([]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getFilteredLanguages = () => {
    if (!searchLangQuery.trim()) return REGIONAL_LANGUAGES;
    
    const query = searchLangQuery.toLowerCase();
    return REGIONAL_LANGUAGES.map(group => {
      const filtered = group.languages.filter(
        l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query)
      );
      return { ...group, languages: filtered };
    }).filter(group => group.languages.length > 0);
  };

  const getRiskColor = (risk) => {
    if (risk === "HIGH") return "text-red-500 border-red-500/30 bg-red-950/20";
    if (risk === "SUSPICIOUS") return "text-amber-500 border-amber-500/30 bg-amber-950/20";
    return "text-emerald-500 border-emerald-500/30 bg-emerald-950/20";
  };

  const getRiskGlow = (risk) => {
    if (risk === "HIGH") return "glass-panel-glow-red";
    if (risk === "SUSPICIOUS") return "glass-panel-glow-yellow";
    return "glass-panel-glow-green";
  };

  const getScanlineClass = (risk) => {
    if (risk === "HIGH") return "scanline scanline-red";
    if (risk === "SUSPICIOUS") return "scanline scanline-yellow";
    return "scanline scanline-green";
  };

  const formatCallTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- Pipeline step config ---
  const pipelineSteps = [
    { step: 1, label: "Input data received", icon: Signal },
    { step: 2, label: "Sarvam AI speech transcription", icon: Radio },
    { step: 3, label: "Language normalization complete", icon: Fingerprint },
    { step: 4, label: "Gemini threat intelligence analysis", icon: Eye },
    { step: 5, label: "Security verdict rendered", icon: ShieldCheck }
  ];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col relative min-h-screen">
      {/* Animated Background Layer */}
      <ParticleBackground />
      <div className="cyber-grid-bg">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="floating-orb floating-orb-3" />
      </div>
      <div className="noise-overlay" />
      
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setAudioPlaying(false)} className="hidden" />

      <AnimatePresence mode="wait">
        {appState === "splash" && (
          <SplashScreenOnboarding 
            key="splash-screen"
            onComplete={() => {
              const savedUser = localStorage.getItem("kavach_auth_user");
              const savedProfileSaved = localStorage.getItem("kavach_profile_saved");
              if (savedUser && savedProfileSaved === "true") {
                setAppState("dashboard");
              } else if (savedUser) {
                setAppState("profile_setup");
              } else {
                setAppState("login");
              }
            }} 
          />
        )}

        {appState === "login" && (
          <LoginScreenOnboarding 
            key="login-screen"
            authPhone={authPhone} 
            setAuthPhone={setAuthPhone} 
            onSuccess={() => setAppState("otp")} 
          />
        )}

        {appState === "otp" && (
          <OtpScreenOnboarding 
            key="otp-screen"
            authPhone={authPhone} 
            onSuccess={(hasProfile, profileData) => {
              if (hasProfile && profileData) {
                setProfile(profileData);
                setAppState("activation");
              } else {
                setProfile(prev => ({ ...prev, phone_number: authPhone }));
                setAppState("profile_setup");
              }
            }}
            onBack={() => setAppState("login")}
          />
        )}

        {appState === "profile_setup" && (
          <ProfileSetupScreenOnboarding 
            key="profile-setup-screen"
            authPhone={authPhone} 
            onSuccess={(newProfile) => {
              setProfile(newProfile);
              setAppState("activation");
            }} 
          />
        )}

        {appState === "activation" && (
          <ActivationScreenOnboarding 
            key="activation-screen"
            onComplete={() => setAppState("dashboard")} 
          />
        )}

        {appState === "dashboard" && (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen w-full"
          >
            {/* Main content wrapper */}
            <div className="relative z-10 flex flex-col gap-5 p-4 pb-28">

        {/* --- HEADER --- */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-3 border-b border-gray-800/50"
        >
          <div className="flex items-center gap-2.5">
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-indigo-950 to-indigo-900/50 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight shimmer-text">
                Kavach-AI
              </h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-medium">Fraud Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {checkingStatus ? (
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            ) : backendConnected ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] text-emerald-400 font-mono backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" />
                <span className="font-semibold tracking-wider">SECURE</span>
              </motion.div>
            ) : (
              <motion.button 
                onClick={checkBackendHealth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 bg-red-950/30 border border-red-500/20 px-2.5 py-1 rounded-full text-[9px] text-red-400 font-mono backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 glow-dot" />
                <span className="font-semibold tracking-wider">OFFLINE</span>
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* --- TAB CONTENT --- */}
        <AnimatePresence mode="wait">

          {/* === VIEW 1: DASHBOARD === */}
          {currentTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {/* Input Mode Switcher */}
              <div className="flex bg-gray-950/60 backdrop-blur-sm p-1 rounded-2xl border border-gray-800/50 text-xs text-gray-400">
                {[
                  { id: "sms", label: "SMS Analysis", icon: MessageSquare },
                  { id: "audio", label: "Voice Analysis", icon: Mic },
                  { id: "call", label: "Live Call", icon: Phone }
                ].map((mode) => {
                  const ModeIcon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setInputMode(mode.id);
                        setAnalysisResult(null);
                        setNormalizedText("");
                        setPipelineStep(0);
                        setBubbleError(null);
                      }}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all relative flex items-center justify-center gap-1.5 ${
                        inputMode === mode.id 
                          ? "bg-gray-900/80 text-indigo-400 font-bold border border-gray-700/50 shadow-lg" 
                          : "hover:text-gray-200"
                      }`}
                    >
                      <ModeIcon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                      {inputMode === mode.id && (
                        <motion.div 
                          layoutId="activeTabGlow"
                          className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-teal-400 via-indigo-400 to-indigo-500 rounded-full"
                          style={{ boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Input Panels */}
              <motion.div 
                className="glass-panel rounded-2xl p-5 min-h-[175px] flex flex-col justify-between relative overflow-hidden"
                layout
              >
                <div className="scanline" style={{ opacity: 0.3 }} />
                
                {/* SMS Panel */}
                <AnimatePresence mode="wait">
                  {inputMode === "sms" && (
                    <motion.div
                      key="sms-panel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-3 h-full"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 glow-dot" />
                          <span>Paste suspicious SMS</span>
                        </div>
                        <MessageSquare className="w-4 h-4 text-indigo-400/60" />
                      </div>
                      <textarea
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        placeholder="Enter message content here to analyze threat score..."
                        className="w-full h-24 bg-gray-950/50 hover:bg-gray-950/80 focus:bg-gray-950/80 p-3.5 rounded-xl border border-gray-800/50 focus:border-indigo-500/40 outline-none text-xs text-gray-300 placeholder-gray-600 resize-none transition-all focus:shadow-[0_0_20px_rgba(99,102,241,0.08)]"
                      />
                      <motion.button
                        onClick={handleSmsAnalyze}
                        disabled={isProcessing || !smsText.trim()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-glow w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-gray-900 disabled:to-gray-900 disabled:text-gray-600 font-bold text-xs text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing Scam...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Run Fraud Scan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Voice Analysis Panel */}
                  {inputMode === "audio" && (
                    <motion.div
                      key="audio-panel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-3 h-full"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 glow-dot" />
                          <span>Voice Analysis</span>
                        </div>
                        <Upload className="w-4 h-4 text-indigo-400/60" />
                      </div>

                      {/* Selector & Record Buttons */}
                      {!audioFile && (
                        <div className="flex items-center gap-2.5 my-2">
                          <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-700/50 rounded-xl p-5 bg-gray-950/20 hover:bg-gray-950/40 hover:border-indigo-500/20 cursor-pointer transition-all group">
                            <Upload className="w-5 h-5 text-gray-500 mb-1.5 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-300 font-medium text-center truncate w-full transition-colors">
                              Select audio file (.wav, .mp3)
                            </span>
                            <input 
                              type="file" 
                              accept="audio/*" 
                              onChange={handleAudioUpload} 
                              className="hidden" 
                            />
                          </label>

                          <motion.button
                            onClick={toggleRecording}
                            disabled={isProcessing}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`px-4 py-5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                              recording 
                                ? "bg-red-950/30 border-red-500/40 text-red-400" 
                                : "bg-gray-950/20 border-gray-800/50 hover:border-indigo-500/20 text-gray-400 hover:text-indigo-400"
                            }`}
                          >
                            {recording ? (
                              <WaveformVisualizer active={true} color="text-red-400" barCount={5} />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-600 group-hover:bg-indigo-400 transition-colors" />
                            )}
                            <span className="text-[9px] font-mono font-semibold">{recording ? "RECORDING" : "RECORD"}</span>
                          </motion.button>
                        </div>
                      )}

                      {/* Audio Player and Validation Card */}
                      {audioFile && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-950/40 border border-gray-800/50 rounded-xl p-3.5 flex flex-col gap-2.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-semibold text-gray-300 truncate w-44">{audioFileName}</span>
                              <span className="text-[10px] text-gray-500">
                                Duration: {audioDuration ? `${audioDuration.toFixed(1)} seconds` : "Detecting..."}
                              </span>
                            </div>
                            
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono ${
                              audioValid 
                                ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20" 
                                : "text-red-400 bg-red-950/20 border border-red-500/20"
                            }`}>
                              {audioValid ? "✓ Compatible" : "❌ Too long"}
                            </span>
                          </div>

                          {audioError && (
                            <p className="text-[10.5px] text-red-400 bg-red-950/25 border border-red-500/15 p-2.5 rounded-lg leading-normal">
                              {audioError}
                            </p>
                          )}

                          <div className="flex gap-2 justify-end mt-1 border-t border-gray-800/40 pt-2.5">
                            {audioValid && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  if (audioPlayingFile) {
                                    if (audioRef.current) audioRef.current.pause();
                                    setAudioPlayingFile(false);
                                  } else {
                                    const url = URL.createObjectURL(audioFile);
                                    if (audioRef.current) {
                                      audioRef.current.src = url;
                                      audioRef.current.play();
                                      setAudioPlayingFile(true);
                                      audioRef.current.onended = () => setAudioPlayingFile(false);
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-700/50 text-[10px] text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
                              >
                                {audioPlayingFile ? (
                                  <><Square className="w-2.5 h-2.5 text-red-400" /> Stop</>
                                ) : (
                                  <><Play className="w-2.5 h-2.5" /> Play</>
                                )}
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setAudioFile(null);
                                setAudioFileName("");
                                setAudioDuration(0);
                                setAudioValid(false);
                                setAudioError(null);
                                setAudioPlayingFile(false);
                                if (audioRef.current) audioRef.current.pause();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-[10px] text-red-400 flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Remove
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      <motion.button
                        onClick={handleAudioAnalyze}
                        disabled={isProcessing || !audioFile || !audioValid}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-glow w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-gray-900 disabled:to-gray-900 disabled:text-gray-600 font-bold text-xs text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing Speech...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Scan Audio File</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Call Simulation Panel */}
                  {inputMode === "call" && (
                    <motion.div
                      key="call-panel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center justify-center py-6 text-center gap-4 h-full"
                    >
                      <div className="relative">
                        <motion.div 
                          className="p-4 bg-red-950/20 border border-red-500/20 rounded-full shadow-lg"
                          animate={{ boxShadow: ["0 0 20px rgba(239,68,68,0.1)", "0 0 40px rgba(239,68,68,0.2)", "0 0 20px rgba(239,68,68,0.1)"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Phone className="w-8 h-8 text-red-500" />
                        </motion.div>
                        <div className="absolute inset-0 rounded-full border border-red-500/20 ring-pulse" />
                        <div className="absolute inset-0 rounded-full border border-red-500/10 ring-pulse-delayed" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-gray-200">Interactive Call Simulation</h3>
                        <p className="text-[11px] text-gray-500 px-4 leading-relaxed">
                          Simulate receiving an unverified scam call and watch live transcript scoring.
                        </p>
                      </div>
                      <motion.button
                        onClick={triggerIncomingCall}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-glow px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                      >
                        <span>Trigger Call Mockup</span>
                        <Phone className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Pipeline Status Indicator */}
              <AnimatePresence>
                {(isProcessing || pipelineStep > 0) && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="scanline" style={{ opacity: 0.2 }} />
                    
                    <div className="flex items-center justify-between border-b border-gray-800/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-bold text-gray-300 tracking-wider font-mono">INTELLIGENCE PIPELINE</span>
                      </div>
                      {isProcessing && (
                        <div className="flex items-center gap-1.5">
                          <WaveformVisualizer active={true} color="text-teal-400" barCount={4} />
                          <span className="text-[9px] text-teal-400 font-mono font-bold live-indicator">LIVE</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-0 text-xs text-gray-400 font-mono pl-1">
                      {pipelineSteps.map((item, idx) => {
                        const isActive = pipelineStep === item.step;
                        const isPassed = pipelineStep > item.step;
                        const StepIcon = item.icon;
                        
                        return (
                          <div key={item.step}>
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05, duration: 0.3 }}
                              className={`flex items-center gap-3 py-2 transition-all duration-500 ${
                                isActive ? "text-indigo-400" : isPassed ? "text-gray-500" : "text-gray-700"
                              }`}
                            >
                              {isActive ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="relative"
                                >
                                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                  <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
                                </motion.div>
                              ) : isPassed ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </motion.div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-800 flex items-center justify-center text-[7px] text-gray-700">
                                  <StepIcon className="w-2.5 h-2.5" />
                                </div>
                              )}
                              <span className={`text-[10.5px] ${isActive ? "font-bold" : ""}`}>{item.label}</span>
                            </motion.div>
                            {/* Connector line */}
                            {idx < pipelineSteps.length - 1 && (
                              <div className="ml-[7px] flex">
                                <div className={`h-2 ${isPassed ? "pipeline-connector-done" : pipelineStep >= item.step ? "pipeline-connector" : "w-[2px] bg-gray-800/30"}`} style={{ width: "2px" }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Bubble Error Alert */}
              <AnimatePresence>
                {bubbleError && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2.5 items-start backdrop-blur-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Execution Blocked (API 400 Error)</span>
                      <span className="leading-normal text-red-300/80">{bubbleError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Results Panel */}
              <AnimatePresence>
                {pipelineStep === 5 && analysisResult && (
                  <motion.section
                    initial={{ opacity: 0, scale: 0.93, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden ${getRiskGlow(analysisResult.risk_level)}`}
                  >
                    <div className={getScanlineClass(analysisResult.risk_level)} />

                    {/* Header Row */}
                    <div className="flex items-center justify-between border-b border-gray-800/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          {analysisResult.risk_level === "HIGH" && <ShieldAlert className="w-5 h-5 text-red-500" />}
                          {analysisResult.risk_level === "SUSPICIOUS" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                          {analysisResult.risk_level === "SAFE" && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                        </motion.div>
                        <span className="text-sm font-bold tracking-wide text-gray-200">Analysis Result</span>
                      </div>
                      <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest border ${getRiskColor(analysisResult.risk_level)}`}
                      >
                        {analysisResult.risk_level}
                      </motion.span>
                    </div>

                    {/* Score + Details */}
                    <div className="flex items-center gap-6">
                      {/* Radial Score Gauge */}
                      <div className="relative flex items-center justify-center w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            cx="50" cy="50" r="42" 
                            stroke="rgba(31, 41, 55, 0.4)" 
                            strokeWidth="7" 
                            fill="transparent" 
                          />
                          <motion.circle 
                            cx="50" cy="50" r="42" 
                            stroke={
                              analysisResult.risk_level === "HIGH" ? "#ef4444" : 
                              analysisResult.risk_level === "SUSPICIOUS" ? "#f59e0b" : "#10b981"
                            }
                            strokeWidth="7" 
                            fill="transparent" 
                            strokeLinecap="round"
                            strokeDasharray="264"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * analysisResult.threat_score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            style={{
                              filter: `drop-shadow(0 0 6px ${
                                analysisResult.risk_level === "HIGH" ? "rgba(239,68,68,0.4)" :
                                analysisResult.risk_level === "SUSPICIOUS" ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)"
                              })`
                            }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <motion.span 
                            className="text-2xl font-black text-gray-100"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {analysisResult.threat_score}
                          </motion.span>
                          <span className="text-[7px] text-gray-500 font-mono uppercase tracking-widest">THREAT</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 text-[10px]">Category</span>
                          <span className="font-semibold text-gray-200 text-right text-[11px]">{analysisResult.threat_type}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 text-[10px]">Confidence</span>
                          <span className="font-semibold text-gray-200 text-[11px]">{analysisResult.confidence_score}%</span>
                        </div>
                        {normalizedText && (
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">Translation</span>
                            <p className="text-[10px] text-gray-400 line-clamp-2 italic bg-black/30 p-2 rounded-lg border border-gray-800/50">
                              &ldquo;{normalizedText}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reason Flags */}
                    {analysisResult.reason_flags && analysisResult.reason_flags.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-2"
                      >
                        <label className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">Reason Flags</label>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.reason_flags.map((flag, idx) => (
                            <motion.span 
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + idx * 0.08 }}
                              className="px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800/50 text-[10px] text-gray-400 font-medium"
                            >
                              {flag}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Recommendation */}
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gray-950/50 border border-gray-800/50 p-3.5 rounded-xl flex flex-col gap-1.5 text-xs"
                    >
                      <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">Recommendation</span>
                      <p className="text-gray-200 font-semibold leading-relaxed">
                        {analysisResult.recommended_action}
                      </p>
                    </motion.div>

                    {/* Voice Alert & SMS status */}
                    <div className="flex flex-col gap-2.5">
                      {analysisResult.threat_score >= 36 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center justify-between bg-indigo-950/20 border border-indigo-500/15 p-3 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5 text-[11px] text-indigo-400">
                            {audioPlaying ? (
                              <>
                                <WaveformVisualizer active={true} color="text-indigo-400" barCount={5} />
                                <span className="font-bold">Playing Voice Alert...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4" />
                                <span>Local warning audio ready</span>
                              </>
                            )}
                          </div>
                          {audioPlaying ? (
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={stopPlayback}
                              className="p-1.5 px-2.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-white text-[10px] font-semibold"
                            >
                              Mute
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const isHigh = analysisResult.threat_score >= threatThreshold || analysisResult.risk_level === "HIGH";
                                const warningTxt = isHigh
                                  ? (LOCAL_WARNINGS_HIGH[warningLanguage] || LOCAL_WARNINGS_HIGH["en-IN"])
                                  : (LOCAL_WARNINGS_SUSPICIOUS[warningLanguage] || LOCAL_WARNINGS_SUSPICIOUS["en-IN"]);
                                playBrowserSpeech(warningTxt, warningLanguage);
                              }}
                              className="p-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-[10px] flex items-center gap-1.5 font-bold shadow-lg shadow-indigo-600/20"
                            >
                              <Play className="w-2.5 h-2.5" /> Replay
                            </motion.button>
                          )}
                        </motion.div>
                      )}

                      {/* Twilio SMS Status */}
                      {analysisResult.threat_score >= 36 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          className={`flex flex-col gap-2 p-3 rounded-xl border ${
                            guardianSmsStatus === "Sent" 
                              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                              : guardianSmsStatus === "Failed" 
                              ? "bg-red-950/20 border-red-500/20 text-red-400" 
                              : "bg-gray-950/30 border-gray-800/50 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <Bell className="w-3.5 h-3.5" />
                              <span className="font-semibold">Twilio Guardian SMS Alert</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {guardianSmsStatus === "Sent" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" />}
                              {guardianSmsStatus === "Failed" && <div className="w-1.5 h-1.5 rounded-full bg-red-400 glow-dot" />}
                              <span className="font-bold uppercase font-mono text-[10px]">{guardianSmsStatus}</span>
                            </div>
                          </div>
                          {guardianSmsError && (
                            <div className="text-[9.5px] bg-red-950/30 border border-red-500/10 p-2 rounded-lg text-red-300 leading-normal flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                              <span>{guardianSmsError}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* === VIEW 2: HISTORY === */}
          {currentTab === "history" && (
            <motion.div 
              key="history"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-gray-800/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/15">
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-200">Activity Logs</h2>
                  {incidentHistory.length > 0 && (
                    <span className="text-[9px] font-mono text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded-full border border-gray-800/50">
                      {incidentHistory.length} records
                    </span>
                  )}
                </div>
                {incidentHistory.length > 0 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearHistory} 
                    className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-all px-2 py-1 rounded-lg hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </motion.button>
                )}
              </div>

              {incidentHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-2xl py-16 text-center flex flex-col items-center gap-3"
                >
                  <div className="p-3 rounded-full bg-gray-900/50 border border-gray-800/50">
                    <HistoryIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500">No past activities logged.</p>
                  <p className="text-[10px] text-gray-600">Run a fraud scan to start building history.</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex flex-col gap-3"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {incidentHistory.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      variants={staggerItem}
                      whileHover={{ scale: 1.01, y: -1 }}
                      className={`glass-panel-interactive rounded-xl p-4 flex flex-col gap-2.5 text-xs relative overflow-hidden cursor-default ${getRiskGlow(item.risk_level)}`}
                    >
                      <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.risk_level === "HIGH" ? "bg-red-400" :
                            item.risk_level === "SUSPICIOUS" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          <span className="text-[9.5px] text-gray-500 font-mono">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${getRiskColor(item.risk_level)}`}>
                          {item.risk_level} · {item.threat_score}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-400">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Input:</span>
                            <span className="text-gray-300 font-medium">{item.input_type || "SMS"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Type:</span>
                            <span className="text-gray-300 font-medium truncate">{item.threat_type}</span>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-gray-400 leading-normal italic bg-black/20 p-2.5 rounded-lg border border-gray-800/40">
                          &ldquo;{item.original_text}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-gray-800/40 pt-2.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Audio Warning</span>
                          <span className="font-medium text-gray-400">{item.audio_warning_played || "None"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Guardian SMS</span>
                          <span className={`font-mono font-bold ${
                            item.sms_status === "Sent" ? "text-emerald-400" :
                            item.sms_status === "Failed" ? "text-red-400" : "text-gray-600"
                          }`}>
                            {item.sms_status || "Not Sent"}
                          </span>
                        </div>
                      </div>
                      {item.sms_error && (
                        <div className="text-[9px] bg-red-950/20 border border-red-500/10 p-2 rounded-lg text-red-300 leading-normal flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                          <span>{item.sms_error}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* === VIEW 3: SETTINGS === */}
          {currentTab === "settings" && (
            <motion.div 
              key="settings"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5 border-b border-gray-800/50 pb-3">
                <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/15">
                  <SettingsIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-gray-200">Configuration Panel</h2>
              </div>

              <motion.div 
                className="glass-panel rounded-2xl p-5 flex flex-col gap-5 text-xs relative overflow-hidden"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <div className="scanline" style={{ opacity: 0.15 }} />
                
                {/* Guardian toggle */}
                <motion.div variants={staggerItem} className="flex items-center justify-between border-b border-gray-800/40 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-gray-200 font-bold">Guardian Alert System</span>
                    </div>
                    <span className="text-[10px] text-gray-500 ml-5.5">Enable or disable guardian notifications</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setGuardianEnabled(!guardianEnabled)}
                    className={`w-11 h-6 rounded-full transition-all relative flex items-center p-0.5 ${
                      guardianEnabled ? "bg-indigo-600 justify-end" : "bg-gray-800 justify-start"
                    }`}
                  >
                    <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-lg" />
                  </motion.button>
                </motion.div>

                {/* User Name Input */}
                <motion.div variants={staggerItem} className="flex flex-col gap-2">
                  <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">Protected User Name</label>
                  <div className="flex items-center gap-2.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all focus-within:shadow-[0_0_15px_rgba(99,102,241,0.06)]">
                    <User className="w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={protectedUserName}
                      onChange={(e) => setProtectedUserName(e.target.value)}
                      placeholder="e.g. Harsha Vardhan"
                      className="bg-transparent border-none outline-none text-gray-300 w-full placeholder-gray-600 text-xs"
                    />
                  </div>
                </motion.div>

                {/* Phone Input */}
                <AnimatePresence>
                  {guardianEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">Guardian Phone Number</label>
                      <div className="flex items-center gap-2.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all focus-within:shadow-[0_0_15px_rgba(99,102,241,0.06)]">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          placeholder="e.g. +919876543210"
                          className="bg-transparent border-none outline-none text-gray-300 w-full placeholder-gray-600 text-xs"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Protection settings */}
                <AnimatePresence>
                  {guardianEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-3 border-t border-gray-800/40 pt-4 overflow-hidden"
                    >
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3" /> Protection Triggers
                      </span>
                      
                      <div className="flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-gray-950/30 border border-gray-800/30">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-200 font-medium">Notify on High Threat</span>
                          <span className="text-[9.5px] text-gray-500">Auto SMS on scores &gt;= threshold</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setGuardianOnHigh(!guardianOnHigh)}
                          className={`w-9 h-5 rounded-full transition-all relative flex items-center p-0.5 ${
                            guardianOnHigh ? "bg-indigo-600 justify-end" : "bg-gray-800 justify-start"
                          }`}
                        >
                          <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-gray-950/30 border border-gray-800/30">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-200 font-medium">Notify on Suspicious</span>
                          <span className="text-[9.5px] text-gray-500">Auto SMS on scores between 36-70</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setGuardianOnSuspicious(!guardianOnSuspicious)}
                          className={`w-9 h-5 rounded-full transition-all relative flex items-center p-0.5 ${
                            guardianOnSuspicious ? "bg-indigo-600 justify-end" : "bg-gray-800 justify-start"
                          }`}
                        >
                          <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Threat threshold slider */}
                <motion.div variants={staggerItem} className="flex flex-col gap-2 border-t border-gray-800/40 pt-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Threat Alert Threshold
                    </span>
                    <span className="text-indigo-400 font-bold text-[12px]">{threatThreshold}<span className="text-gray-600 text-[9px]"> / 100</span></span>
                  </div>
                  <input 
                    type="range" 
                    min="36" 
                    max="95" 
                    value={threatThreshold}
                    onChange={(e) => setThreatThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[8px] text-gray-600 font-mono px-0.5">
                    <span>SENSITIVE (36)</span>
                    <span>STRICT (95)</span>
                  </div>
                </motion.div>

                {/* Language Selector */}
                <motion.div variants={staggerItem} className="flex flex-col gap-2.5 pt-4 border-t border-gray-800/40">
                  <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3" /> Voice Warning Language
                  </label>
                  
                  <div className="flex items-center gap-2 bg-gray-950/50 px-3 py-2 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all">
                    <Search className="w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={searchLangQuery}
                      onChange={(e) => setSearchLangQuery(e.target.value)}
                      placeholder="Search languages..."
                      className="bg-transparent border-none outline-none text-[11px] text-gray-300 placeholder-gray-600 w-full"
                    />
                  </div>

                  <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-3 mt-1">
                    {getFilteredLanguages().map((group, gIdx) => (
                      <div key={gIdx} className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-gray-500 font-mono uppercase tracking-widest pl-1">
                          {group.region}
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {group.languages.map((lang) => (
                            <motion.button
                              key={lang.code}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setWarningLanguage(lang.code)}
                              className={`p-2.5 rounded-lg text-left text-[11px] transition-all border ${
                                warningLanguage === lang.code
                                  ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-bold shadow-lg shadow-indigo-500/5"
                                  : "bg-gray-950/30 border-gray-800/40 hover:border-gray-700/50 text-gray-400 hover:text-gray-200"
                              }`}
                            >
                              {lang.name}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                  variants={staggerItem}
                  onClick={handleSaveSettings}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`btn-glow w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                    settingsSaved 
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/20" 
                      : "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-600/20"
                  }`}
                >
                  {settingsSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settings Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Configurations</span>
                    </>
                  )}
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  variants={staggerItem}
                  onClick={handleLogout}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-red-950/25 border border-red-500/30 hover:bg-red-950/40 text-[11px] font-bold text-red-400 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Logout Device</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl border border-gray-700/40 shadow-2xl z-40 flex items-center justify-around px-2 max-w-md mx-auto"
        style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.05)" }}
      >
        {[
          { id: "dashboard", label: "Dashboard", icon: Shield },
          { id: "history", label: "History", icon: HistoryIcon },
          { id: "settings", label: "Settings", icon: SettingsIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = currentTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                stopPlayback();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all relative"
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${isSelected ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"}`} />
              <span className={`text-[10px] font-medium transition-all duration-300 ${isSelected ? "text-indigo-400 font-bold" : "text-gray-500"}`}>
                {tab.label}
              </span>
              
              {isSelected && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute -top-3 w-8 h-1 rounded-full"
                  style={{ 
                    background: "linear-gradient(90deg, #818cf8, #6366f1)",
                    boxShadow: "0 0 12px rgba(99, 102, 241, 0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* --- INCOMING CALL OVERLAY --- */}
      <AnimatePresence>
        {callState !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between max-w-md mx-auto"
            style={{
              background: "linear-gradient(180deg, #030712 0%, #0a0f1e 30%, #0f0a1e 70%, #030712 100%)"
            }}
          >
            {/* Call background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="floating-orb floating-orb-1" style={{ background: callState === "ringing" ? "#ef4444" : "#6366f1" }} />
              <div className="floating-orb floating-orb-2" style={{ background: "#10b981", opacity: 0.1 }} />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full p-8">
              {/* Caller Info */}
              <div className="flex flex-col items-center justify-center pt-16 gap-3">
                <div className="relative">
                  <motion.div 
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 border border-gray-600/50 flex items-center justify-center shadow-2xl"
                    animate={callState === "ringing" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <User className="w-12 h-12 text-gray-400" />
                  </motion.div>
                  {callState === "ringing" && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-red-500/40 ring-pulse" />
                      <div className="absolute inset-0 rounded-full border border-red-500/20 ring-pulse-delayed" />
                    </>
                  )}
                  {callState === "active" && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-100 mt-2">Unknown Sender</h2>
                <div className="flex items-center gap-2">
                  {callState === "active" && <div className="w-2 h-2 rounded-full bg-red-500 live-indicator" />}
                  <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                    {callState === "ringing" ? "Incoming Call..." : callState === "active" ? `Connected · ${formatCallTimer(callTimer)}` : "Call Ended"}
                  </span>
                </div>
              </div>

              {/* Live Transcript Panel */}
              <div className="flex-1 my-6 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative">
                <div className="scanline" style={{ opacity: 0.15 }} />
                
                <div className="text-[9.5px] uppercase font-mono tracking-widest text-indigo-400 border-b border-gray-800/50 pb-2 mb-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3" />
                    <span>Real-Time Transcript</span>
                  </div>
                  {callState === "active" && (
                    <div className="flex items-center gap-1.5">
                      <WaveformVisualizer active={true} color="text-red-400" barCount={4} />
                      <span className="text-red-400 font-bold live-indicator">LIVE</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto text-xs text-gray-400 whitespace-pre-line font-sans leading-relaxed text-left max-h-[180px]">
                  {callTranscript || "Awaiting call acceptance..."}
                </div>
              </div>

              {/* Call Control Buttons */}
              <div className="flex justify-center gap-12 pb-12">
                {callState === "ringing" ? (
                  <>
                    <motion.button 
                      onClick={endCall}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-t from-red-700 to-red-600 flex items-center justify-center shadow-xl shadow-red-600/30"
                    >
                      <PhoneOff className="w-6 h-6 text-white" />
                    </motion.button>
                    <motion.button 
                      onClick={acceptCall}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{ boxShadow: ["0 0 20px rgba(16,185,129,0.3)", "0 0 40px rgba(16,185,129,0.5)", "0 0 20px rgba(16,185,129,0.3)"] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-600/30"
                    >
                      <Phone className="w-6 h-6 text-white" />
                    </motion.button>
                  </>
                ) : (
                  <motion.button 
                    onClick={endCall}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-t from-red-700 to-red-600 flex items-center justify-center shadow-xl shadow-red-600/30"
                  >
                    <PhoneOff className="w-6 h-6 text-white" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==============================
// ONBOARDING SUB-COMPONENTS
// ==============================

function SplashScreenOnboarding({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.3, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: 0.3, duration: 0.01 }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center p-6 z-20 w-full max-w-sm mx-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full scale-75" />
        <svg 
          width="110" 
          height="110" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]"
        >
          <motion.path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="flex flex-col gap-1.5"
      >
        <h1 className="text-3xl font-extrabold tracking-tight shimmer-text">
          KAVACH-AI
        </h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.25em] font-mono">
          AI Powered Fraud Protection
        </p>
      </motion.div>
    </div>
  );
}

function LoginScreenOnboarding({ authPhone, setAuthPhone, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s-]/g, "");
    const regex = /^\+[1-9]\d{9,14}$/;
    return regex.test(cleanPhone);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = authPhone.replace(/[\s-]/g, "");
    
    if (!validatePhone(cleanPhone)) {
      setError("Please enter a valid international phone format (e.g. +919876543210).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: cleanPhone })
      });
      const data = await res.json();
      if (res.ok && data.otp_sent) {
        setAuthPhone(cleanPhone);
        onSuccess();
      } else {
        setError(data.detail || "Failed to send verification code. Please try again.");
      }
    } catch (err) {
      setError("Network error. Could not connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 z-20 min-h-screen w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="scanline" style={{ opacity: 0.15 }} />
        
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl mb-1 shadow-lg">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-200">Device Registry</h2>
          <p className="text-[11px] text-gray-500 leading-normal max-w-[240px]">
            Bind your device to a phone number to activate real-time fraud monitoring.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">
              Mobile Number
            </label>
            <div className="flex items-center gap-2.5 bg-gray-950/50 p-3.5 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all">
              <Phone className="w-4 h-4 text-gray-500" />
              <input 
                type="tel"
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-700 text-xs font-mono"
              />
            </div>
            <span className="text-[9px] text-gray-650 pl-1 font-mono">Format: +[CountryCode][Number]</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-[10.5px] leading-normal flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading || !authPhone.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

function OtpScreenOnboarding({ authPhone, onSuccess, onBack }) {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otpCode.length < 6) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: authPhone,
          otp_code: otpCode
        })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        localStorage.setItem("kavach_auth_user", authPhone);
        
        // Check if profile exists on the backend
        const profRes = await fetch(`${BACKEND_URL}/api/profile?phone_number=${encodeURIComponent(authPhone)}`);
        let hasProfile = false;
        let profileData = null;
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData && profData.protected_name && profData.profile_completed === true) {
            hasProfile = true;
            profileData = {
              phone_number: authPhone,
              protected_name: profData.protected_name,
              guardian_number: profData.guardian_number,
              preferred_language: profData.preferred_language,
              notify_high: profData.notify_high !== false,
              notify_suspicious: profData.notify_suspicious === true,
              profile_completed: true
            };
            localStorage.setItem("kavach_protected_name", profData.protected_name);
            localStorage.setItem("kavach_guardian_phone", profData.guardian_number);
            localStorage.setItem("kavach_warning_lang", profData.preferred_language);
            localStorage.setItem("kavach_guardian_on_high", profData.notify_high ? "true" : "false");
            localStorage.setItem("kavach_guardian_on_suspicious", profData.notify_suspicious ? "true" : "false");
            localStorage.setItem("kavach_profile_saved", "true");
          } else {
            localStorage.setItem("kavach_profile_saved", "false");
          }
        } else {
          localStorage.setItem("kavach_profile_saved", "false");
        }
        
        onSuccess(hasProfile, profileData);
      } else {
        setError("Invalid code. Please verify the code and try again.");
      }
    } catch (err) {
      setError("Verification failed. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendTimer(30);
    try {
      await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: authPhone })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 z-20 min-h-screen w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="scanline" style={{ opacity: 0.15 }} />

        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl mb-1 shadow-lg">
            <Radio className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-200">Security Challenge</h2>
          <p className="text-[11px] text-gray-500 leading-normal max-w-[240px]">
            Enter the 6-digit verification code sent to <span className="font-semibold font-mono text-gray-400">{authPhone}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">
              Verification Code
            </label>
            <div className="flex items-center gap-2.5 bg-gray-950/50 p-3.5 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all justify-center">
              <input 
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                }}
                placeholder="• • • • • •"
                className="bg-transparent border-none outline-none text-gray-200 w-full text-center font-mono text-2xl tracking-[0.5em] pl-[0.5em] placeholder-gray-800"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-[10.5px] leading-normal flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <motion.button
              type="submit"
              disabled={loading || otpCode.length < 6}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP Code</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>

            <div className="flex justify-between items-center px-1 text-[11px]">
              <button 
                type="button" 
                onClick={onBack}
                className="text-gray-500 hover:text-gray-300 font-medium"
              >
                Change Number
              </button>

              {resendTimer > 0 ? (
                <span className="text-gray-500 font-mono">
                  Resend OTP in {resendTimer}s
                </span>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResend}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProfileSetupScreenOnboarding({ authPhone, onSuccess }) {
  const [name, setName] = useState("");
  const [guardianNumber, setGuardianNumber] = useState("+91 ");
  const [lang, setLang] = useState("hi-IN");
  const [notifyHigh, setNotifyHigh] = useState(true);
  const [notifySuspicious, setNotifySuspicious] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the protected user name.");
      return;
    }

    const cleanGuardian = guardianNumber.replace(/[\s-]/g, "");
    const regex = /^\+[1-9]\d{9,14}$/;
    if (!regex.test(cleanGuardian)) {
      setError("Please enter a valid international guardian phone number (e.g. +919876543210).");
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        phone_number: authPhone,
        protected_name: name.trim(),
        guardian_number: cleanGuardian,
        preferred_language: lang,
        notify_high: notifyHigh,
        notify_suspicious: notifySuspicious,
        profile_completed: true
      };

      const res = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });

      if (res.ok) {
        localStorage.setItem("kavach_protected_name", name.trim());
        localStorage.setItem("kavach_guardian_phone", cleanGuardian);
        localStorage.setItem("kavach_warning_lang", lang);
        localStorage.setItem("kavach_guardian_on_high", notifyHigh.toString());
        localStorage.setItem("kavach_guardian_on_suspicious", notifySuspicious.toString());
        localStorage.setItem("kavach_profile_saved", "true");
        
        const newProfile = {
          phone_number: authPhone,
          protected_name: name.trim(),
          guardian_number: cleanGuardian,
          preferred_language: lang,
          notify_high: notifyHigh,
          notify_suspicious: notifySuspicious,
          profile_completed: true
        };
        onSuccess(newProfile);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to save profile. Please try again.");
      }
    } catch (err) {
      setError("Failed to reach profile server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 z-20 min-h-screen w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden"
      >
        <div className="scanline" style={{ opacity: 0.1 }} />

        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl mb-0.5 shadow-lg">
            <User className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-200">Identity Onboarding</h2>
          <p className="text-[11px] text-gray-500 max-w-[250px]">
            Configure the protection targets and default guardian details.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">
              Protected User Name
            </label>
            <div className="flex items-center gap-2.5 bg-gray-950/50 px-3.5 py-3 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all">
              <User className="w-4 h-4 text-gray-500" />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harsha Vardhan"
                className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-700 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">
              Guardian Mobile Number
            </label>
            <div className="flex items-center gap-2.5 bg-gray-950/50 px-3.5 py-3 rounded-xl border border-gray-800/50 focus-within:border-indigo-500/40 transition-all">
              <Phone className="w-4 h-4 text-gray-500" />
              <input 
                type="tel"
                value={guardianNumber}
                onChange={(e) => setGuardianNumber(e.target.value)}
                placeholder="e.g. +919876543210"
                className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-700 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-[10px] uppercase font-mono tracking-widest pl-1">
              Preferred Warning Language
            </label>
            <div className="bg-gray-950/50 rounded-xl border border-gray-800/50 px-3 py-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-300 w-full text-xs"
              >
                {REGIONAL_LANGUAGES.flatMap(group => group.languages).map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-gray-950 text-gray-300">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-gray-800/40 pt-3.5">
            <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">
              Notification Preferences
            </span>
            
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/30 border border-gray-800/40">
              <span className="text-gray-300 font-medium text-[11px]">Notify Guardian On High Threat</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotifyHigh(!notifyHigh)}
                className={`w-9 h-5 rounded-full transition-all relative flex items-center p-0.5 ${
                  notifyHigh ? "bg-indigo-600 justify-end" : "bg-gray-800 justify-start"
                }`}
              >
                <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950/30 border border-gray-800/40">
              <span className="text-gray-300 font-medium text-[11px]">Notify Guardian On Suspicious</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotifySuspicious(!notifySuspicious)}
                className={`w-9 h-5 rounded-full transition-all relative flex items-center p-0.5 ${
                  notifySuspicious ? "bg-indigo-600 justify-end" : "bg-gray-800 justify-start"
                }`}
              >
                <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
              </motion.button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-[10.5px] leading-normal flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Protection...</span>
              </>
            ) : (
              <>
                <span>Save & Activate Protection</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

function ActivationScreenOnboarding({ onComplete }) {
  const [steps, setSteps] = useState([
    { id: 1, label: "Identity Verified", status: "pending" },
    { id: 2, label: "Guardian Linked Successfully", status: "pending" },
    { id: 3, label: "Language Engine Ready", status: "pending" },
    { id: 4, label: "Threat Intelligence Activated", status: "pending" },
    { id: 5, label: "Security Shield Enabled", status: "pending" }
  ]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setSteps(prev => prev.map((step, idx) => {
          if (idx === index) {
            return { ...step, status: "completed" };
          }
          return step;
        }));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 z-20 min-h-screen w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="scanline" style={{ opacity: 0.15 }} />

        <div className="flex flex-col items-center text-center gap-1">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-full shadow-lg"
            >
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 ring-pulse" />
          </div>
          <h2 className="text-lg font-bold text-gray-200 mt-2">Shield Initialization</h2>
          <p className="text-[11px] text-gray-500 leading-normal max-w-[200px]">
            Starting real-time protective scan and device binding...
          </p>
        </div>

        <div className="flex flex-col gap-3.5 pl-2 font-mono text-[11px]">
          {steps.map((step) => {
            const isCompleted = step.status === "completed";
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0.2, x: -5 }}
                animate={{ 
                  opacity: isCompleted ? 1 : 0.4, 
                  x: isCompleted ? 0 : -5,
                  color: isCompleted ? "#34d399" : "#9ca3af"
                }}
                className="flex items-center gap-3"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin shrink-0" />
                )}
                <span className="font-semibold tracking-wide">{step.label}</span>
              </motion.div>
            );
          })}
        </div>

        {steps.every(s => s.status === "completed") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center font-bold text-xs text-emerald-400 bg-emerald-950/25 border border-emerald-500/20 py-2.5 rounded-xl animate-pulse"
          >
            ✓ SHIELD PROTECTION ACTIVATED
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
