import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import DigizortLogo from "./components/DigizortLogo";
import FuturePoll from "./components/FuturePoll";
import AdminPanel from "./components/AdminPanel";
import { 
  Instagram, 
  Facebook, 
  ShieldAlert, 
  ChevronDown,
  Globe,
  Cpu,
  Fingerprint,
  Tv2
} from "lucide-react";

export default function App() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Monitor simple virtual routing based on address bar path modification
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Helper to change page path without hard-reloads
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to scroll to survey form smoothly
  const scrollToSurvey = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("poll-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Setup Scroll binding specifically on the heroRef wrapper
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll animations for hero elements
  const scrollInstructionOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0.40, 0.55], [0.92, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.42, 0.55], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.42, 0.55], [30, 0]);
  
  // Custom elegant core width expander
  const separatorWidth = useTransform(scrollYProgress, [0.45, 0.58], ["0%", "50%"]);

  // Translates the joined logo + captions upwards to simulate natural scrolling out of view
  const contentY = useTransform(scrollYProgress, [0.55, 1.0], [0, -650]);

  // Render the secure admin portal if path matches /admin
  if (currentPath === "/admin") {
    return (
      <div className="bg-zinc-50 min-h-screen text-zinc-800 select-text font-sans">
        {/* Simple navigation to return to home */}
        <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between select-none sticky top-0 z-50">
          <div 
            onClick={() => navigateTo("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-7 h-7 text-[#9D0A16]" fill="none" stroke="currentColor">
                {/* Globe */}
                <circle cx="200" cy="100" r="45" strokeWidth="10" />
                <line x1="155" y1="100" x2="245" y2="100" strokeWidth="10" strokeLinecap="round" />
                <line x1="200" y1="55" x2="200" y2="145" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="200" cy="100" rx="22" ry="45" strokeWidth="10" />
                <ellipse cx="200" cy="100" rx="45" ry="22" strokeWidth="10" />
                {/* Cradle */}
                <path d="M 125,55 L 125,100 A 75,75 0 0,0 275,100 L 275,55" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                {/* Z-Body */}
                <path d="M 135,212 L 265,212 L 135,296 L 265,296" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                {/* Circuits */}
                <path d="M 175,296 L 175,308 L 150,333 L 150,344" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="150" cy="356" r="16" fill="currentColor" stroke="none" />
                <path d="M 200,296 L 200,362" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="200" cy="374" r="16" fill="currentColor" stroke="none" />
                <path d="M 225,296 L 225,308 L 250,333 L 250,344" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="250" cy="356" r="16" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest text-zinc-800 group-hover:text-[#9D0A16] transition-colors uppercase font-sans">DIGIZORT</span>
          </div>
          <button 
            onClick={() => navigateTo("/")}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 px-4 py-2 rounded-lg bg-white transition-all cursor-pointer"
          >
            &lsaquo; Back to Presentation Home
          </button>
        </header>

        <main className="focus:outline-none">
          <AdminPanel />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-800 min-h-screen relative flex flex-col justify-between font-sans selection:bg-red-50 selection:text-red-900 select-none md:select-text">
      
      {/* 1. PROFESSIONAL FLOATING NAVIGATION BAR */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-zinc-200/60 px-6 py-4 flex items-center justify-between select-none">
        <div 
          onClick={() => navigateTo("/")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-6 h-6 text-[#9D0A16]" fill="none" stroke="currentColor">
              {/* Globe */}
              <circle cx="200" cy="100" r="45" strokeWidth="10" />
              <line x1="155" y1="100" x2="245" y2="100" strokeWidth="10" strokeLinecap="round" />
              <line x1="200" y1="55" x2="200" y2="145" strokeWidth="10" strokeLinecap="round" />
              <ellipse cx="200" cy="100" rx="22" ry="45" strokeWidth="10" />
              <ellipse cx="200" cy="100" rx="45" ry="22" strokeWidth="10" />
              {/* Cradle */}
              <path d="M 125,55 L 125,100 A 75,75 0 0,0 275,100 L 275,55" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
              {/* Z-Body */}
              <path d="M 135,212 L 265,212 L 135,296 L 265,296" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
              {/* Circuits */}
              <path d="M 175,296 L 175,308 L 150,333 L 150,344" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="150" cy="356" r="16" fill="currentColor" stroke="none" />
              <path d="M 200,296 L 200,362" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="200" cy="374" r="16" fill="currentColor" stroke="none" />
              <path d="M 225,296 L 225,308 L 250,333 L 250,344" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="250" cy="356" r="16" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-zinc-950 uppercase font-sans sm:text-sm">DIGIZORT</span>
            <span className="text-[9px] font-medium text-zinc-400 block leading-none tracking-wider uppercase">CREATIVITY × INNOVATION</span>
          </div>
        </div>

        {/* MODERN MID-ROW NAV */}
        <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-zinc-500">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-zinc-900 transition-colors cursor-pointer text-zinc-900">Home</button>
          <a href="#poll-section" onClick={scrollToSurvey} className="hover:text-zinc-900 transition-colors cursor-pointer">Live Survey</a>
          <span className="text-zinc-200">|</span>
          <span className="flex items-center gap-1.5 text-zinc-400 font-sans text-[11px]">
            <Globe size={12} className="text-zinc-300" />
            V-QUANTUM PLATFORM
          </span>
        </div>

        {/* SYSTEM PORTAL ACTIONS */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateTo("/admin")}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Fingerprint size={13} className="text-[#9D0A16]" />
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* 2. CINEMATIC HERO ASSEMBLING STAGE (STRETCHED SCROLL TRACK) */}
      <div 
        ref={heroRef}
        className="w-full relative h-[210vh] bg-gradient-to-b from-zinc-50 via-white to-zinc-50"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* CONTENT THAT TRANSLATES UPWARD AFTER MERGE */}
          <motion.div
            style={{ y: contentY }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* ACTIVE LOGO ASSEMBLY CANVAS */}
            <DigizortLogo scrollContainerRef={heroRef} />

            {/* ASSEMBLED BANNER CAPTIONS */}
            <motion.div
              style={{
                opacity: textOpacity,
                y: textY,
                scale: textScale,
              }}
              className="absolute bottom-[22%] text-center px-4 w-full"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 uppercase text-center font-sans">
                DIGIZORT
              </h1>

              {/* GROWING SEPARATOR - SMALL ACCENT ONLY */}
              <motion.div 
                style={{ width: separatorWidth }} 
                className="h-[3px] bg-[#9D0A16] mx-auto mt-4 mb-4"
              />

              <h3 className="text-xs sm:text-sm md:text-base font-sans font-bold tracking-[0.25em] text-zinc-500 uppercase">
                Creativity Meets Innovation
              </h3>
            </motion.div>
          </motion.div>

          {/* INSTRUCTIONAL SCROLL PROMPT */}
          <motion.div
            style={{ opacity: scrollInstructionOpacity }}
            className="absolute bottom-12 flex flex-col items-center gap-1 select-none pointer-events-none"
          >
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Scroll down slowly to Assemble logo
            </span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
              className="text-[#9D0A16] mt-1"
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
          
        </div>
      </div>

      {/* 3. SCI-FI TRANSITIONAL DIVIDER BANNER (Now Clean minimal edge line) */}
      <div className="w-full h-px bg-zinc-200 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-zinc-300 rounded-full" />
      </div>

      {/* 4. SURVEILLANCE/POLL SPACE VIEWPORT (Soft gray section with premium spacing) */}
      <div className="bg-gradient-to-b from-zinc-50 via-zinc-100/40 to-zinc-50 w-full py-16 sm:py-24 border-b border-zinc-200/50">
        <div className="w-full max-w-7xl mx-auto">
          <FuturePoll />
        </div>
      </div>

      {/* 5. FOOTER AND BRAND FOOTPRINT */}
      <footer className="bg-white border-t border-zinc-100 py-16 px-6 relative w-full mt-auto select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          
          {/* Copyright Info */}
          <div className="text-center sm:text-left space-y-1">
            <span className="text-sm font-bold tracking-widest text-zinc-900 uppercase font-sans block">DIGIZORT</span>
            <p className="text-xs text-zinc-400 font-sans">
              &copy; 2026 DIGIZORT. All rights reserved. Secure Cloud Platform Registry.
            </p>
          </div>

          {/* Social Links Block */}
          <div className="flex flex-col items-center sm:items-end gap-3">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
              Vector Connectors
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/digizort_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-200 hover:border-[#9D0A16]/30 flex items-center justify-center text-zinc-400 hover:text-[#9D0A16] transition-all bg-white hover:bg-zinc-50 group cursor-pointer"
                title="Connect on Instagram"
              >
                <Instagram size={15} className="group-hover:scale-105 transition-transform" />
              </a>

              <a 
                href="https://facebook.com/digizort_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-200 hover:border-[#9D0A16]/30 flex items-center justify-center text-zinc-400 hover:text-[#9D0A16] transition-all bg-white hover:bg-zinc-50 group cursor-pointer"
                title="Connect on Facebook"
              >
                <Facebook size={15} className="group-hover:scale-105 transition-transform" />
              </a>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400 select-none">
              @digizort_official
            </span>
          </div>

        </div>

        {/* DETECT LOCK SECURE PANEL */}
        <div className="mt-12 text-center pt-8 border-t border-zinc-100 flex flex-col items-center justify-center">
          <button
            onClick={() => navigateTo("/admin")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-all cursor-pointer uppercase tracking-wider bg-white shadow-sm"
          >
            <ShieldAlert size={12} className="text-zinc-400 group-hover:text-zinc-600" />
            Authorized Personnel only — Administration sentinel desk
          </button>
        </div>
      </footer>

    </div>
  );
}
