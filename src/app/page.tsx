"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  Handshake,
  Building2,
  Briefcase,
  Trophy,
  ArrowRight,
  Sparkles,
  Cpu,
  Zap,
  Globe,
  ChevronRight,
  Play
} from "lucide-react";

const coverImages = [
  { url: "/startup_funding.png", title: "Startup & Funding Portal", subtitle: "Submit pitch decks, request investment matching, and track seed capital approvals." },
  { url: "/investment.png", title: "VC & Angel Network", subtitle: "Bridging global Pakistani diaspora investors to premium localized projects." },
  { url: "/jobs_placement.png", title: "Skill & Job Placements", subtitle: "Direct hiring channel matching verified engineers with deep-tech roles." },
  { url: "/cofounder_matching.png", title: "Founder-to-Founder Matching", subtitle: "Simulating and forging cofounder synergy for technical & business builders." },
  { url: "/team_collaboration.png", title: "High-Performance Teams", subtitle: "Nurturing multi-disciplinary team synergy and player-to-player dynamics." }
];

export default function Home() {
  const [graduatesCount, setGraduatesCount] = useState(500000);
  const [matchesCount, setMatchesCount] = useState(12842);
  const [fundingBridged, setFundingBridged] = useState(482930400);
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);

  // Pathway Wizard
  const [pathwayProfile, setPathwayProfile] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);

  // Live Ticker Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Ayesha K. initiated cofounder matching for Agri-AI drone project.",
    "Zayn Capital submitted active interest in offline-payment protocols.",
    "Zain Ahmed connected with firmware expert for RISC-V layout.",
    "Punjab Startup Fund matched 15M PKR equity to 3 deep tech builders."
  ]);

  useEffect(() => {
    const graduateInterval = setInterval(() => {
      setGraduatesCount(prev => prev + 1);
    }, 12000);

    const matchesInterval = setInterval(() => {
      setMatchesCount(prev => prev + Math.floor(Math.random() * 2));
      setFundingBridged(prev => prev + Math.floor(Math.random() * 8500));
      
      const liveNames = ["Usman", "Fatimah", "Hamza", "Zainab", "Ali", "Maham", "Bilal", "Sana"];
      const liveActions = [
        "submitted pitch deck to Indus Valley Capital",
        "applied to Remote Compiler Developer job role",
        "forged matching team with overseas Silicon Valley mentors",
        "submitted SystemVerilog code to RISC-V IoT Challenge",
        "requested cofounder alignment meeting with Zahra B."
      ];
      const randomLog = `${liveNames[Math.floor(Math.random() * liveNames.length)]} ${liveActions[Math.floor(Math.random() * liveActions.length)]}.`;
      setTerminalLogs(prev => [randomLog, ...prev.slice(0, 3)]);
    }, 8000);

    const coverInterval = setInterval(() => {
      setCurrentCoverIndex((prev) => (prev + 1) % coverImages.length);
    }, 4000);

    return () => {
      clearInterval(graduateInterval);
      clearInterval(matchesInterval);
      clearInterval(coverInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid-pattern" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Patriotic Tech Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/8 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/6 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-white/2 blur-[150px] pointer-events-none"></div>

      {/* Hero section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings, CTAs, and Metrics */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            {/* Animated Badge */}
            <div className="flex justify-center lg:justify-start mb-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest font-mono text-emerald-400">PAKISTAN'S DEEP TECH ENGINE</span>
              </motion.div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Forging Pakistan's <br />
              <span className="text-gradient-emerald">Startup & Jobs Ecosystem.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Pakistan produces <span className="text-emerald-400 font-semibold underline decoration-emerald-500/30 underline-offset-4">500,000+ graduates yearly</span> — but too many remain unemployed because talent, opportunity, and capital never meet. We fix that.
            </motion.p>

            {/* Quick CTA cluster */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12"
            >
              <Link 
                href="/teams" 
                className="btn-primary font-extrabold px-8 py-3.5 rounded-xl text-sm tracking-wide flex items-center gap-2"
              >
                Explore Active Modules
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#onboarding-wizard" 
                className="btn-secondary font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide flex items-center gap-2"
              >
                Find Your Pathway
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </a>
            </motion.div>

            {/* Quick Metrics Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
            >
              <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500/40"></div>
                <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>New Graduates This Year</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono tracking-tight flex items-center justify-center gap-1.5">
                  {graduatesCount.toLocaleString()}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-normal animate-pulse">+1</span>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500/40"></div>
                <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>Matches Forged</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  {matchesCount.toLocaleString()}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500/40"></div>
                <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>Venture Capital Bridged</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                  PKR {(fundingBridged / 1000000).toFixed(1)}M
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stunning Interactive Auto-Changing Cover Images */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full max-w-md h-[400px] sm:h-[480px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col justify-end group"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCoverIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverImages[currentCoverIndex].url})` }}
                />
              </AnimatePresence>
              
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

              {/* Top overlay badge for indicator */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {coverImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentCoverIndex ? "bg-emerald-400 w-3.5" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 p-6 sm:p-8 text-left">
                <motion.span 
                  key={`tag-${currentCoverIndex}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase font-bold tracking-widest font-mono mb-2"
                >
                  Dynamic Ecosystem Module
                </motion.span>
                <motion.h3 
                  key={`title-${currentCoverIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mb-2"
                >
                  {coverImages[currentCoverIndex].title}
                </motion.h3>
                <motion.p 
                  key={`sub-${currentCoverIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm text-slate-200 line-clamp-2"
                >
                  {coverImages[currentCoverIndex].subtitle}
                </motion.p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Live Activity Marquee Ticker */}
      <div className="w-full border-y py-3 px-6 overflow-hidden mb-20" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-primary)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-bold tracking-wider uppercase whitespace-nowrap text-accent">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            LIVE ACTIVITY TICKER:
          </span>
          <div className="flex gap-12 animate-marquee whitespace-nowrap overflow-x-hidden" style={{ color: "var(--text-secondary)" }}>
            {terminalLogs.map((log, idx) => (
              <span key={idx} className="font-mono flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <span className="text-[10px] text-accent">▶</span>
                {log}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pillars Preview Grid (Extremely Clean & Professional) */}
      <section className="py-12 px-6 max-w-7xl mx-auto mb-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-2 text-emerald-400 font-mono text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="p-1 rounded bg-emerald-500/10"><Cpu className="w-3.5 h-3.5" /></span>
            WHAT WE FORGE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Core Modules
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Click on any module to enter its dedicated workspace portal, run simulations, and submit solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              href: '/teams', 
              label: '👥 Cofounder Matching (Teams)', 
              desc: 'Align with developers, chip layouts engineers, and growth hackers in AI, SaaS, robotics, and deep tech.', 
              action: 'Forge Alignment & Simulate', 
              color: 'group-hover:border-emerald-500/30' 
            },
            { 
              href: '/jobs', 
              label: '💼 Jobs & Skill Placement', 
              desc: 'Access startup hiring, remote global developer opportunities, and high-paying localized deep-tech internships.', 
              action: 'Bypass Resume & Match', 
              color: 'group-hover:border-teal-500/30' 
            },
            { 
              href: '/challenges', 
              label: '🏆 The Challenge Arena', 
              desc: 'Compete in open government and corporate procurement engineering tasks for direct pilot contracts and cash.', 
              action: 'Enter Solution Workbench', 
              color: 'group-hover:border-rose-500/30' 
            },
            { 
              href: '/funding', 
              label: '💰 Venture Funding Bridges', 
              desc: 'Present seed parameters to vetted local VCs, active overseas diaspora networks, and claim FBR IT tax exemptions.', 
              action: 'Pitch Seed Deck', 
              color: 'group-hover:border-amber-500/30' 
            },
            { 
              href: '/gov', 
              label: '🏛️ Government Access Portals', 
              desc: 'Tap federal programs including Pakistan Startup Fund, PITB sandbox accelerators, and HEC engineering grants.', 
              action: 'Check Eligibility & Apply', 
              color: 'group-hover:border-cyan-500/30' 
            },
            { 
              href: '/partnerships', 
              label: '🤝 Corporate & Diaspora Network', 
              desc: 'Unlock software sandbox licensing with largest local exporters and mentorship with Silicon Valley directors.', 
              action: 'Request Diaspora Network', 
              color: 'group-hover:border-indigo-500/30' 
            },
          ].map((pillar, idx) => (
            <Link 
              key={idx}
              href={pillar.href}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:bg-[#0b0f19]/80 transition-all flex flex-col justify-between h-[210px] group card"
            >
              <div>
                <h4 className="font-extrabold text-base group-hover:text-emerald-400 transition-all" style={{ color: "var(--text-primary)" }}>{pillar.label}</h4>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{pillar.desc}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold transition-all pt-4 border-t" style={{ color: "var(--text-secondary)", borderColor: "var(--border-primary)" }}>
                <span>{pillar.action}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pathway Wizard (Personalized Onboarding directly on homepage) */}
      <section id="onboarding-wizard" className="py-16 px-6 max-w-7xl mx-auto border-t mb-20 scroll-mt-20" style={{ borderColor: "var(--border-primary)" }}>
        <div className="max-w-xl mx-auto text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
            THE STAKEHOLDER PATHWAY MATCH
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4" style={{ color: "var(--text-primary)" }}>
            Interactive Setup Wizard
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Tell the engine who you are. We will map a curated pathway and direct you to the correct tools instantly.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border max-w-3xl mx-auto relative overflow-hidden card" style={{ borderColor: "var(--border-primary)" }}>
          {wizardStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-extrabold text-base sm:text-lg mb-6 text-center" style={{ color: "var(--text-primary)" }}>Which stakeholder profile best describes you?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'graduate', title: '🎓 Unemployed Graduate / Job Seeker', desc: 'Looking for remote developer roles, skill-to-placement internships, and active challenge arenas.' },
                  { id: 'builder', title: '💻 Tech Founder / Builder', desc: 'Seeking highly specialized cofounders, early funding rounds, and PITB incubator sandboxes.' },
                  { id: 'investor', title: '💰 VC / Overseas Diaspora Capital', desc: 'Looking to invest in pre-vetted Pakistani deep-tech startups and claim PSF co-equity benefits.' },
                  { id: 'corporate', title: '🏛️ Corporate or Gov Agency', desc: 'Looking to post hardware or payment challenges, procure tech, or form corporate alliances.' },
                ].map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      setPathwayProfile(prof.id);
                      setWizardStep(2);
                    }}
                    className="p-5 rounded-2xl border hover:border-emerald-500/40 text-left transition-all group cursor-pointer card"
                  >
                    <h4 className="font-extrabold text-sm group-hover:text-emerald-400 transition-all" style={{ color: "var(--text-primary)" }}>{prof.title}</h4>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{prof.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {wizardStep === 2 && pathwayProfile && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Your Personalized Platform Route</span>
                <button onClick={() => setWizardStep(1)} className="text-xs text-emerald-400 font-bold hover:underline">Back</button>
              </div>

              {pathwayProfile === 'graduate' && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 mb-1">THE GRADUATE ENGINE INSTRUCTIONS:</p>
                    Do not wait for regular placement calls. We recommend bypass methods.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Prove Skills in the Challenge Arena</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Submit compiler-validated solutions to active HEC and PITB hardware/software procurement challenges.</p>
                        <Link href="/challenges" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Challenge Arena →</Link>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Search Active Startup Placements</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Browse remote development pipelines with FBR IT remittance exemption support.</p>
                        <Link href="/jobs" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Jobs →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pathwayProfile === 'builder' && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 mb-1">FOUNDER & BUILDER DIRECTIVES:</p>
                    Assemble your technical core, pitches, and double your pre-seed cheques.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Verify Cofounder Alignment</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Run our interactive team viability compiler and align with engineers specialised in RISC-V VLSI, deep networks, or SaaS UI.</p>
                        <Link href="/teams" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Teams Workspace →</Link>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Secure Venture Backing</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Dispatch pre-vetted pitch decks to active early-stage investment committees.</p>
                        <Link href="/funding" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Launch Funding Portal →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pathwayProfile === 'investor' && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 mb-1">DIASPORA & VENTURE ROADMAP:</p>
                    Overseas capital remittance, university sandboxes, and pre-vetted seed flow.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Explore Qualified Deal Flow</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Review active, pre-compliant seed parameters compiled from qualified founders.</p>
                        <Link href="/funding" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Funding Workspace →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pathwayProfile === 'corporate' && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 mb-1">CORPORATE & GOVT SYNDICATE ROUTE:</p>
                    Outsource engineering bottlenecks, verify compiler modules, and close sandboxes.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Establish Challenge Benchmarks</h4>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Establish dedicated procurement challenges in agriculture AI, digital banking APIs, or local layout fabs.</p>
                        <Link href="/challenges" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Challenge Arena →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setWizardStep(1)} 
                  className="btn-secondary font-bold text-xs py-2 px-5 rounded-lg"
                >
                  Restart Selection
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Unified footer */}
      <footer className="border-t py-12 px-6" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <span className="font-black text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>CONNECTIN</span>
            <p className="text-xs mt-3 max-w-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Pakistan's premier deep-tech startup, cofounder matching, and job placement engine. Solving the graduation unemployment paradox by bridging builders, venture capital, and local resources.
            </p>
            <p className="text-[10px] mt-6" style={{ color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} ConnectIn. All Rights Reserved.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-primary)" }}>CHANNELS</h4>
            <ul className="text-xs space-y-2.5 font-medium" style={{ color: "var(--text-secondary)" }}>
              <li><Link href="/teams" className="hover:text-emerald-400 transition-all">👥 Cofounder Matching</Link></li>
              <li><Link href="/funding" className="hover:text-emerald-400 transition-all">💰 Venture Capital Bridge</Link></li>
              <li><Link href="/gov" className="hover:text-emerald-400 transition-all">🏛️ PSF & Gov Access</Link></li>
              <li><Link href="/jobs" className="hover:text-emerald-400 transition-all">💼 Placements & Jobs</Link></li>
              <li><Link href="/challenges" className="hover:text-emerald-400 transition-all">🏆 Solution Arena</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-primary)" }}>CONNECTIVITY</h4>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              Access national incubators, local sandbox hubs, or Silicon Valley diaspora angel networks.
            </p>
            <div className="flex gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all font-mono btn-secondary">FB</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all font-mono btn-secondary">TW</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all font-mono btn-secondary">LN</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all font-mono btn-secondary">GH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
