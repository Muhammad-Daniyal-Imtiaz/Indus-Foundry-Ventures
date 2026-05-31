"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function Home() {
  const [graduatesCount, setGraduatesCount] = useState(500000);
  const [matchesCount, setMatchesCount] = useState(12842);
  const [fundingBridged, setFundingBridged] = useState(482930400);

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

    return () => {
      clearInterval(graduateInterval);
      clearInterval(matchesInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] overflow-hidden bg-grid-pattern">
      {/* Background Glowing Effects */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none"></div>

      {/* Hero section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        {/* Animated Badge */}
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest font-mono text-emerald-400">PAKISTAN'S DEEP TECH ENGINE</span>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white mb-6"
          >
            Forging Pakistan's <br />
            <span className="text-gradient-emerald">Startup & Jobs Ecosystem.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Pakistan produces <span className="text-emerald-400 font-semibold underline decoration-emerald-500/30 underline-offset-4">500,000+ graduates yearly</span> — but too many remain unemployed because talent, opportunity, and capital never meet. We fix that.
          </motion.p>

          {/* Quick Metrics Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
          >
            <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500/40"></div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">New Graduates This Year</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono tracking-tight flex items-center justify-center gap-1.5">
                {graduatesCount.toLocaleString()}
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-normal animate-pulse">+1</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500/40"></div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Matches Forged</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {matchesCount.toLocaleString()}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500/40"></div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Venture Capital Bridged</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                PKR {(fundingBridged / 1000000).toFixed(1)}M
              </div>
            </div>
          </motion.div>

          {/* Quick CTA cluster */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Link 
              href="/teams" 
              className="bg-emerald-500 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-sm tracking-wide flex items-center gap-2"
            >
              Explore Active Modules
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#onboarding-wizard" 
              className="bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm tracking-wide flex items-center gap-2"
            >
              Find Your Pathway
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Live Activity Marquee Ticker */}
      <div className="w-full bg-slate-950/60 border-y border-white/5 py-3 px-6 overflow-hidden mb-20">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-bold text-emerald-400 tracking-wider uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            LIVE ACTIVITY TICKER:
          </span>
          <div className="flex gap-12 animate-marquee whitespace-nowrap overflow-x-hidden text-slate-400">
            {terminalLogs.map((log, idx) => (
              <span key={idx} className="font-mono text-slate-300 flex items-center gap-2">
                <span className="text-[10px] text-emerald-500">▶</span>
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
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Core Modules
          </h2>
          <p className="text-slate-400 text-sm mt-2">
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
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:bg-[#0b0f19]/80 transition-all flex flex-col justify-between h-[210px] group"
            >
              <div>
                <h4 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-all">{pillar.label}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pillar.desc}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-all pt-4 border-t border-white/5">
                <span>{pillar.action}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pathway Wizard (Personalized Onboarding directly on homepage) */}
      <section id="onboarding-wizard" className="py-16 px-6 max-w-7xl mx-auto border-t border-white/5 mb-20 scroll-mt-20">
        <div className="max-w-xl mx-auto text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
            THE STAKEHOLDER PATHWAY MATCH
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-4">
            Interactive Setup Wizard
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Tell the engine who you are. We will map a curated pathway and direct you to the correct tools instantly.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 max-w-3xl mx-auto relative overflow-hidden">
          {wizardStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-extrabold text-base sm:text-lg text-white mb-6 text-center">Which stakeholder profile best describes you?</h3>
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
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/40 text-left transition-all hover:bg-slate-900 group cursor-pointer"
                  >
                    <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-all">{prof.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{prof.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {wizardStep === 2 && pathwayProfile && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Personalized Platform Route</span>
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
                        <h4 className="font-bold text-white text-xs">Prove Skills in the Challenge Arena</h4>
                        <p className="text-xs text-slate-400 mt-1">Submit compiler-validated solutions to active HEC and PITB hardware/software procurement challenges.</p>
                        <Link href="/challenges" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Challenge Arena →</Link>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Search Active Startup Placements</h4>
                        <p className="text-xs text-slate-400 mt-1">Browse remote development pipelines with FBR IT remittance exemption support.</p>
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
                        <h4 className="font-bold text-white text-xs">Verify Cofounder Alignment</h4>
                        <p className="text-xs text-slate-400 mt-1">Run our interactive team viability compiler and align with engineers specialised in RISC-V VLSI, deep networks, or SaaS UI.</p>
                        <Link href="/teams" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Teams Workspace →</Link>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-white text-xs">Secure Venture Backing</h4>
                        <p className="text-slate-400 text-xs mt-1">Dispatch pre-vetted pitch decks to active early-stage investment committees.</p>
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
                        <h4 className="font-bold text-white text-xs">Explore Qualified Deal Flow</h4>
                        <p className="text-xs text-slate-400 mt-1">Review active, pre-compliant seed parameters compiled from qualified founders.</p>
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
                        <h4 className="font-bold text-white text-xs">Establish Challenge Benchmarks</h4>
                        <p className="text-xs text-slate-400 mt-1">Establish dedicated procurement challenges in agriculture AI, digital banking APIs, or local layout fabs.</p>
                        <Link href="/challenges" className="text-xs font-extrabold text-emerald-400 mt-1 inline-block hover:underline">Go to Challenge Arena →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setWizardStep(1)} 
                  className="bg-slate-900 border border-white/10 hover:border-emerald-500/30 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all"
                >
                  Restart Selection
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Unified footer */}
      <footer className="border-t border-white/5 bg-[#03060c] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <span className="font-black text-lg tracking-wider text-white">INDUS FOUNDRY VENTURES</span>
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              Pakistan's premier deep-tech startup, cofounder matching, and job placement engine. Solving the graduation unemployment paradox by bridging builders, venture capital, and local resources.
            </p>
            <p className="text-[10px] text-slate-500 mt-6">
              © {new Date().getFullYear()} Indus Foundry Ventures. All Rights Reserved. Built with Next.js & Tailwind CSS.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-4">CHANNELS</h4>
            <ul className="text-xs text-slate-400 space-y-2.5 font-medium">
              <li><Link href="/teams" className="hover:text-emerald-400 transition-all">👥 Cofounder Matching</Link></li>
              <li><Link href="/funding" className="hover:text-emerald-400 transition-all">💰 Venture Capital Bridge</Link></li>
              <li><Link href="/gov" className="hover:text-emerald-400 transition-all">🏛️ PSF & Gov Access</Link></li>
              <li><Link href="/jobs" className="hover:text-emerald-400 transition-all">💼 Placements & Jobs</Link></li>
              <li><Link href="/challenges" className="hover:text-emerald-400 transition-all">🏆 Solution Arena</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-4">CONNECTIVITY</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Access national incubators, local sandbox hubs, or Silicon Valley diaspora angel networks.
            </p>
            <div className="flex gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer transition-all font-mono">FB</span>
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer transition-all font-mono">TW</span>
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer transition-all font-mono">LN</span>
              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer transition-all font-mono">GH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
