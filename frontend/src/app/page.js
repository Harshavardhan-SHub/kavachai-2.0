"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Shield, ShieldCheck,
  MessageSquare, Mic, Phone, Eye, Bell, Globe,
  ArrowRight, ChevronDown, ChevronRight,
  Zap, Activity, Radio, Signal, Fingerprint, Lock,
  Star, Check,
  AlertTriangle, Scan, Languages, Siren,
  Play, Sparkles
} from "lucide-react";

// Custom GitHub icon (not available in this lucide-react version)
function GithubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

// Lazy-load the 3D scene to prevent SSR issues
const Scene3D = dynamic(() => import("./components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] lg:h-[600px] flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  ),
});

// ══════════════════════════════════════
// ANIMATION VARIANTS
// ══════════════════════════════════════
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

// ══════════════════════════════════════
// SECTION BADGE COMPONENT
// ══════════════════════════════════════
function SectionBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/30 border border-indigo-500/20 w-fit mx-auto mb-6">
      {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400" />}
      <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest font-mono">
        {label}
      </span>
    </div>
  );
}

// ══════════════════════════════════════
// ANIMATED COUNTER HOOK
// ══════════════════════════════════════
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasStarted.current) return;
    hasStarted.current = true;

    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(end * eased));
      if (step >= steps) {
        setCount(end);
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [isInView, end, duration, startOnView]);

  return { count, ref };
}

// ══════════════════════════════════════
// LENIS SMOOTH SCROLL HOOK
// ══════════════════════════════════════
function useLenis() {
  useEffect(() => {
    let lenis;
    const init = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
        });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        // Fallback: native scrolling
      }
    };
    init();
    return () => { if (lenis) lenis.destroy(); };
  }, []);
}

// ══════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Stats", href: "#stats" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-gray-950/70 backdrop-blur-xl border-b border-white/[0.04] shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600/20 to-cyan-600/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Kavach<span className="text-indigo-400">-AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link href="/app">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cta-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

// ══════════════════════════════════════
// SECTION 1: HERO
// ══════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/40 border border-indigo-500/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
            <span className="text-xs font-medium text-gray-300">
              Now Live — Protecting Indian Citizens
            </span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-white">AI-Powered</span>
          <br />
          <span className="shimmer-text">Fraud Protection</span>
          <br />
          <span className="text-gray-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            for Every Indian
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          custom={2}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10 px-4"
        >
          Detect SMS scams, analyze suspicious voice calls, and protect your loved ones
          with real-time AI intelligence and multilingual voice warnings.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/app">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="cta-primary text-base px-8 py-4 flex items-center gap-3 shadow-2xl shadow-indigo-500/20"
            >
              <Zap className="w-5 h-5" />
              <span>Launch App Free</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <a href="#how-it-works">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cta-secondary text-base px-8 py-4 flex items-center gap-3"
            >
              <Play className="w-4 h-4" />
              <span>See How It Works</span>
            </motion.button>
          </a>
        </motion.div>

        {/* Trust bar */}
        <motion.div variants={fadeUp} custom={4} className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500/70" />
            <span>13+ Indian Languages</span>
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500/70" />
            <span>Real-Time Detection</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 2: PROBLEM STATEMENT
// ══════════════════════════════════════
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const stat1 = useCounter(1.7, 2000);
  const stat2 = useCounter(300, 2500);
  const stat3 = useCounter(67, 2000);

  return (
    <section ref={ref} className="landing-section" id="problem">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionBadge icon={AlertTriangle} label="The Problem" />
        </motion.div>

        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
          India Loses <span className="text-red-400">₹1.7 Trillion</span> to
          <br className="hidden sm:block" /> Digital Fraud Every Year
        </motion.h2>

        <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
          From fake KYC messages to AI-generated voice scams, fraudsters are evolving faster than ever.
          The most vulnerable — parents, elderly, and rural communities — are left unprotected.
        </motion.p>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { ref: stat1.ref, value: `₹${stat1.count}T+`, label: "Lost Annually to Fraud", color: "text-red-400", glow: "shadow-red-500/10" },
            { ref: stat2.ref, value: `${stat2.count}%`, label: "Rise in Voice Scams (YoY)", color: "text-amber-400", glow: "shadow-amber-500/10" },
            { ref: stat3.ref, value: `${stat3.count}%`, label: "Victims Are Non-English Speakers", color: "text-orange-400", glow: "shadow-orange-500/10" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              ref={stat.ref}
              variants={scaleIn}
              custom={idx}
              className={`stat-card shadow-2xl ${stat.glow}`}
            >
              <div className={`text-4xl lg:text-5xl font-extrabold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 3: SOLUTION OVERVIEW
// ══════════════════════════════════════
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pillars = [
    {
      icon: MessageSquare,
      title: "SMS Shield",
      desc: "Paste any suspicious SMS and get an instant AI-powered threat analysis with scam taxonomy classification.",
      color: "text-indigo-400",
      borderColor: "border-indigo-500/20",
      bg: "from-indigo-600/10 to-transparent",
    },
    {
      icon: Mic,
      title: "Voice Sentinel",
      desc: "Upload call recordings for deep speech-to-text analysis. Detect loan scams, impersonation, and pressure tactics.",
      color: "text-cyan-400",
      borderColor: "border-cyan-500/20",
      bg: "from-cyan-600/10 to-transparent",
    },
    {
      icon: Bell,
      title: "Guardian Alert",
      desc: "When a high-threat is detected, your trusted guardian receives an instant emergency SMS with threat details.",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bg: "from-emerald-600/10 to-transparent",
    },
  ];

  return (
    <section ref={ref} className="landing-section" id="solution">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionBadge icon={Shield} label="The Solution" />
        </motion.div>

        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Meet <span className="shimmer-text">Kavach-AI</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
          Your AI-powered shield against digital fraud — scanning, analyzing, and protecting in real-time across 13+ Indian languages.
        </motion.p>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              className={`feature-card-hover glass-panel rounded-2xl p-8 text-left border ${pillar.borderColor}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.bg} border ${pillar.borderColor} flex items-center justify-center mb-6`}>
                <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 4: FEATURES GRID
// ══════════════════════════════════════
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    { icon: Scan, title: "SMS Threat Scanner", desc: "AI-powered detection of phishing, lottery scams, fake KYC alerts, and social engineering in any language.", color: "text-indigo-400" },
    { icon: Mic, title: "Voice Call Analysis", desc: "Upload recordings for deep speech analysis. Detects pressure tactics, fake authority claims, and urgency manipulation.", color: "text-cyan-400" },
    { icon: Phone, title: "Live Call Monitor", desc: "Real-time transcription and threat scoring of ongoing calls. Instant alerts when danger is detected.", color: "text-violet-400" },
    { icon: Siren, title: "Guardian Alerts", desc: "Emergency SMS dispatched to trusted contacts when high-risk scams target your family members.", color: "text-emerald-400" },
    { icon: Languages, title: "13+ Language Support", desc: "Native voice warnings in Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, and more Indian languages.", color: "text-amber-400" },
    { icon: Eye, title: "Threat Intelligence", desc: "Track scan history, view threat patterns, and understand evolving fraud tactics in your region.", color: "text-rose-400" },
  ];

  return (
    <section ref={ref} className="landing-section" id="features">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center">
          <SectionBadge icon={Sparkles} label="Features" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Built for <span className="text-indigo-400">Complete Protection</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
            Six layers of AI-powered defense working together to keep you and your family safe.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              className="feature-card-hover glass-panel rounded-2xl p-7 group cursor-default"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gray-900/80 border border-white/[0.04] group-hover:border-indigo-500/20 transition-all duration-300">
                  <feature.icon className={`w-6 h-6 ${feature.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 5: HOW IT WORKS
// ══════════════════════════════════════
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      num: "01",
      title: "Scan Input",
      desc: "Paste suspicious SMS text or upload a voice call recording. Kavach accepts any Indian language.",
      icon: Signal,
      color: "from-indigo-600 to-indigo-500",
    },
    {
      num: "02",
      title: "AI Analysis",
      desc: "Sarvam AI translates regional dialects. Gemini Flash scores the content against 50+ fraud taxonomies.",
      icon: Activity,
      color: "from-cyan-600 to-cyan-500",
    },
    {
      num: "03",
      title: "Instant Protection",
      desc: "Critical threats trigger voice warnings in your language and emergency SMS to your trusted guardian.",
      icon: ShieldCheck,
      color: "from-emerald-600 to-emerald-500",
    },
  ];

  return (
    <section ref={ref} className="landing-section" id="how-it-works">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionBadge icon={Radio} label="How It Works" />
        </motion.div>

        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Three Steps to <span className="text-cyan-400">Safety</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
          From scan to protection in under 10 seconds. No technical skills needed.
        </motion.p>

        <motion.div variants={staggerContainer} className="flex flex-col md:flex-row items-stretch gap-6 md:gap-4 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={fadeUp} custom={idx} className="flex-1 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 glass-panel feature-card-hover rounded-2xl p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="font-mono text-xs text-indigo-400 mb-2 tracking-wider">{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center">
                  <div className="w-12 h-px bg-gradient-to-r from-indigo-500/40 to-cyan-500/30" />
                  <ChevronRight className="w-4 h-4 text-gray-600 -ml-1" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 6: STATISTICS
// ══════════════════════════════════════
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const s1 = useCounter(10000, 2500);
  const s2 = useCounter(50000, 2500);
  const s3 = useCounter(99, 2000);
  const s4 = useCounter(13, 1500);

  const stats = [
    { ref: s1.ref, value: s1.count.toLocaleString() + "+", label: "Users Protected", icon: Shield, color: "text-indigo-400" },
    { ref: s2.ref, value: s2.count.toLocaleString() + "+", label: "Scans Completed", icon: Scan, color: "text-cyan-400" },
    { ref: s3.ref, value: s3.count + ".2%", label: "Detection Accuracy", icon: Fingerprint, color: "text-emerald-400" },
    { ref: s4.ref, value: s4.count + "+", label: "Languages Supported", icon: Languages, color: "text-amber-400" },
  ];

  return (
    <section ref={ref} className="landing-section" id="stats">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge icon={Activity} label="Impact" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Trusted by <span className="text-emerald-400">Thousands</span>
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              ref={stat.ref}
              variants={scaleIn}
              custom={idx}
              className="stat-card group"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
              <div className={`text-3xl lg:text-4xl font-extrabold text-white mb-2`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 7: PRODUCT SCREENSHOTS
// ══════════════════════════════════════
function ScreenshotsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState(0);

  const screens = [
    {
      title: "Command Center Dashboard",
      desc: "Real-time threat monitoring with scan history, quick actions, and system status at a glance.",
      gradient: "from-indigo-600/20 via-indigo-600/5 to-transparent",
      icon: Activity,
      features: ["Live threat feed", "Quick SMS/Voice scan", "Backend status monitor", "Recent scan logs"],
    },
    {
      title: "SMS Threat Analysis",
      desc: "AI-powered breakdown of suspicious messages with confidence scoring and action recommendations.",
      gradient: "from-cyan-600/20 via-cyan-600/5 to-transparent",
      icon: MessageSquare,
      features: ["Threat score gauge", "Category classification", "Risk factor flags", "One-tap guardian alert"],
    },
    {
      title: "Voice Call Intelligence",
      desc: "Deep analysis of recorded calls with transcription, sentiment analysis, and scam pattern matching.",
      gradient: "from-emerald-600/20 via-emerald-600/5 to-transparent",
      icon: Mic,
      features: ["Audio waveform display", "Live transcription", "Threat taxonomy", "Multilingual warnings"],
    },
  ];

  return (
    <section ref={ref} className="landing-section" id="screenshots">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <SectionBadge icon={Eye} label="Product" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            See <span className="text-indigo-400">Kavach</span> in Action
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A command center designed for clarity, speed, and decisive protection.
          </p>
        </motion.div>

        {/* Tab selector */}
        <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          {screens.map((screen, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === idx
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-white shadow-lg shadow-indigo-500/10"
                  : "text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/[0.04]"
              }`}
            >
              <screen.icon className="w-4 h-4" />
              {screen.title.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </motion.div>

        {/* Active screen display */}
        <motion.div variants={fadeUp} custom={2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto"
            >
              <div className="screenshot-frame">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04] bg-gray-950/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono ml-3">kavach-ai.vercel.app</span>
                </div>
                {/* Content area */}
                <div className={`bg-gradient-to-br ${screens[activeTab].gradient} p-8 lg:p-12 min-h-[300px] lg:min-h-[400px] flex flex-col justify-center`}>
                  <div className="flex items-start gap-5 mb-8">
                    <div className="p-3 rounded-xl bg-gray-900/60 border border-white/[0.06]">
                      {(() => { const Icon = screens[activeTab].icon; return <Icon className="w-8 h-8 text-indigo-400" />; })()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{screens[activeTab].title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-lg">{screens[activeTab].desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {screens[activeTab].features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900/40 border border-white/[0.04]">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-sm text-gray-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 8: 3D INTERACTIVE (WOW)
// ══════════════════════════════════════
function Interactive3DSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="landing-section" id="3d-shield">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <SectionBadge icon={Fingerprint} label="Interactive" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            The <span className="shimmer-text">Shield</span> That Protects You
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            An AI-powered security mesh that adapts, learns, and defends in real-time.
            <span className="text-indigo-400 ml-1">Move your mouse to interact.</span>
          </p>
        </motion.div>

        <motion.div variants={scaleIn} custom={1} className="max-w-5xl mx-auto">
          <Scene3D />
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="flex items-center justify-center gap-8 mt-8 text-xs font-mono text-gray-600 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Neural Mesh
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            Defense Grid
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Particle Field
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 9: TESTIMONIALS
// ══════════════════════════════════════
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Small Business Owner, Delhi",
      quote: "My father almost transferred ₹50,000 to a fake KYC scam. Kavach detected it instantly and warned him in Hindi. This app is a lifesaver.",
      stars: 5,
      avatar: "RK",
      gradient: "from-indigo-600 to-violet-600",
    },
    {
      name: "Priya Sharma",
      role: "IT Professional, Bangalore",
      quote: "The voice call analysis is incredible. It caught a sophisticated loan scam that sounded completely legitimate. The AI accuracy is outstanding.",
      stars: 5,
      avatar: "PS",
      gradient: "from-cyan-600 to-blue-600",
    },
    {
      name: "Anand Reddy",
      role: "College Student, Hyderabad",
      quote: "I set up Kavach for my grandmother. She gets Telugu warnings whenever scam calls come. The Guardian alerts give my family peace of mind.",
      stars: 5,
      avatar: "AR",
      gradient: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <section ref={ref} className="landing-section" id="testimonials">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge icon={Star} label="Testimonials" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Loved by <span className="text-amber-400">Real People</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            See how Kavach-AI is making a difference in protecting Indian families.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              className="testimonial-card flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 10: PRICING / CTA
// ══════════════════════════════════════
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    "Unlimited SMS scam scans",
    "Voice call recording analysis",
    "Live call monitoring",
    "13+ Indian language support",
    "Guardian emergency alerts",
    "Multilingual voice warnings",
    "Threat history & analytics",
    "Priority AI model access",
  ];

  return (
    <section ref={ref} className="landing-section" id="pricing">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionBadge icon={Zap} label="Pricing" />
        </motion.div>

        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Free During <span className="text-emerald-400">Beta</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 max-w-xl mx-auto mb-16 leading-relaxed">
          Get full access to every feature at zero cost. Help us build the future of fraud protection.
        </motion.p>

        <motion.div variants={scaleIn} custom={3} className="max-w-md mx-auto">
          <div className="pricing-card text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 mb-6">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Beta Access</span>
            </div>
            <div className="mb-8">
              <span className="text-6xl font-extrabold text-white">₹0</span>
              <span className="text-lg text-gray-500 ml-2">/forever</span>
            </div>
            <div className="space-y-3 mb-10 text-left">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-300">{feat}</span>
                </div>
              ))}
            </div>
            <Link href="/app">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="cta-primary w-full text-base py-4 flex items-center justify-center gap-3"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <p className="text-xs text-gray-600 mt-4">No credit card required · Instant access</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 11: FAQ
// ══════════════════════════════════════
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "How does Kavach-AI detect fraud?",
      a: "Kavach uses a multi-layer AI pipeline. Sarvam AI handles regional language translation, while Google Gemini Flash performs deep threat analysis across 50+ known fraud taxonomies including phishing, loan scams, lottery fraud, and impersonation attacks.",
    },
    {
      q: "What languages are supported?",
      a: "We support 13+ Indian languages including Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, Assamese, and Urdu — with English as the base. Voice warnings are delivered in your preferred regional language.",
    },
    {
      q: "How does the Guardian Alert work?",
      a: "When a high-threat scam is detected (threat score above 75%), Kavach automatically sends an emergency SMS to your pre-registered guardian contact via Twilio, including threat details and recommended actions.",
    },
    {
      q: "Is my data private and secure?",
      a: "Yes. We do not store your messages or call recordings after analysis. All processing happens in real-time, and data is encrypted in transit. We follow privacy-first principles — your data is never used for training or sold to third parties.",
    },
    {
      q: "Can I use Kavach for my parents?",
      a: "Absolutely! Kavach was designed specifically with elderly and non-tech-savvy users in mind. Set up your parents' preferred language, register yourself as their guardian, and they'll receive warnings in their native tongue while you get instant alerts.",
    },
    {
      q: "Is Kavach really free?",
      a: "Yes. During our beta phase, all features are completely free. Our mission is to protect vulnerable Indians from digital fraud. We plan to sustain through partnerships with banks and telecom providers while keeping the consumer product free.",
    },
  ];

  return (
    <section ref={ref} className="landing-section" id="faq">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge icon={Lock} label="FAQ" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Frequently Asked <span className="text-indigo-400">Questions</span>
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} variants={fadeUp} custom={idx} className="faq-item">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-gray-200 pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/[0.03] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 11.5: FINAL CTA
// ══════════════════════════════════════
function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="landing-section">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="text-center max-w-5xl mx-auto"
      >
        <motion.div
          variants={scaleIn}
          className="relative rounded-3xl overflow-hidden p-12 lg:p-16"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-cyan-600/5 to-emerald-600/10 border border-indigo-500/15 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />

          <div className="relative z-10">
            <motion.div variants={fadeUp}>
              <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Start Protecting Your Family <span className="text-indigo-400">Today</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto">
              Join thousands of Indians who trust Kavach-AI to keep their loved ones safe from digital fraud.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="cta-primary text-base px-10 py-4 flex items-center gap-3 shadow-2xl shadow-indigo-500/25"
                >
                  <Zap className="w-5 h-5" />
                  <span>Launch Kavach-AI</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════
// SECTION 12: FOOTER
// ══════════════════════════════════════
function Footer() {
  const creators = [
    { name: "Varma", github: "https://github.com/Krishnasaivarmakalidindi" },
    { name: "Harsha", github: "https://github.com/Harshavardhan-SHub" },
  ];

  const footerLinks = [
    { label: "Launch App", href: "/app" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="footer-section relative py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/20 to-cyan-600/10 border border-indigo-500/20">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">
                Kavach<span className="text-indigo-400">-AI</span>
              </span>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Fraud Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-12" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <span className="text-red-400 text-base">❤️</span>
            <span>by</span>
            {creators.map((creator, idx) => (
              <span key={creator.name} className="inline-flex items-center">
                {idx > 0 && <span className="mx-1">&</span>}
                <a
                  href={creator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-indigo-400 transition-colors duration-200 inline-flex items-center gap-1.5 group"
                >
                  {creator.name}
                  <GithubIcon className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition-colors duration-200" />
                </a>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {creators.map((creator) => (
              <a
                key={creator.name}
                href={creator.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-white/[0.04] hover:border-indigo-500/20 bg-gray-900/30 hover:bg-indigo-950/20 transition-all duration-300 group"
              >
                <GithubIcon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-10">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} Kavach-AI. All rights reserved. Powered by Sarvam AI & Google Gemini.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════
// MAIN PAGE EXPORT
// ══════════════════════════════════════
export default function Home() {
  useLenis();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Animated background */}
      <div className="gradient-mesh-bg" />

      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <HeroSection />
      <div className="section-divider" />

      <ProblemSection />
      <div className="section-divider" />

      <SolutionSection />
      <div className="section-divider" />

      <FeaturesSection />
      <div className="section-divider" />

      <HowItWorksSection />
      <div className="section-divider" />

      <StatsSection />
      <div className="section-divider" />

      <ScreenshotsSection />
      <div className="section-divider" />

      <Interactive3DSection />
      <div className="section-divider" />

      <TestimonialsSection />
      <div className="section-divider" />

      <PricingSection />
      <div className="section-divider" />

      <FAQSection />

      <FinalCTASection />

      <Footer />
    </main>
  );
}