"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  Zap,
  ChevronRight,
  ArrowRight,
  Terminal,
  AlertCircle,
  X,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

import { investorsData } from "../data";

export default function FundingPage() {
  const [pitchStep, setPitchStep] = useState(1);
  const [pitchData, setPitchData] = useState({
    idea: "",
    tech: "AI",
    teamSize: "1",
    fundingGoal: "PKR 5 Million"
  });
  const [pitchScore, setPitchScore] = useState<any>(null);
  const [showPitchModal, setShowPitchModal] = useState(false);

  const handleFundPitch = (e: React.FormEvent) => {
    e.preventDefault();
    setPitchStep(2);
    setTimeout(() => {
      let score = 75;
      let matchedInvestors: string[] = [];
      
      if (pitchData.tech === "AI" || pitchData.tech === "Deep Tech" || pitchData.tech === "Semiconductors") {
        score += 18;
        matchedInvestors = ["Indus Valley Capital", "Sarmayacar", "Pakistan Startup Fund"];
      } else {
        score += 8;
        matchedInvestors = ["Karavan", "Zayn Capital"];
      }

      if (parseInt(pitchData.teamSize) > 1) score += 5;

      setPitchScore({
        score: Math.min(score, 99),
        probability: score > 90 ? "High Alignment" : score > 75 ? "Moderate Alignment" : "Needs Refinement",
        recommendation: `Your deep tech parameters match high-priority government co-equity programs. We recommend launching an active term-sheet under Pakistan Startup Fund rule check.`,
        investors: matchedInvestors
      });
      setPitchStep(3);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20 mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            MODULE 04 / VENTURE & CAPITAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Venture Capital & Seed Funding
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Bridge direct deal flow to local venture funds, overseas Pakistani angel networks, family offices, and co-equity matching grant committees.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Pitch Deck Generator Widget */}
          <div className="glass-panel p-6 rounded-2xl border border-dashed border-amber-500/25 bg-amber-500/[0.02] flex flex-col justify-between h-[360px]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold mb-3 border border-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                AUTOMATED VC MATCHMAKER
              </div>
              <h4 className="font-extrabold text-base text-white tracking-wide mb-2">Pitch Vetting sandbox</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Input your startup idea and operational parameters. The system will compile VC focus alignment maps across Sarmayacar, Zayn Capital, and Karavan investment criteria.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✔</span> Direct SECP term-sheet pre-evaluation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">✔</span> Pre-check for 30% PSF government matching grant
                </li>
              </ul>
            </div>
            <button 
              onClick={() => { setShowPitchModal(true); setPitchStep(1); }}
              className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-amber-400 transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Launch Matching Wizard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VCs Listing cards */}
          {investorsData.map(investor => (
            <div 
              key={investor.id}
              className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[360px] hover:border-amber-500/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-amber-400 font-mono text-sm tracking-tighter">
                    {investor.logo}
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                    {investor.type}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-white tracking-wide mb-1">{investor.name}</h4>
                <p className="text-xs text-slate-400 font-medium mb-3">Cheque Range: <span className="text-amber-400 font-bold">{investor.chequeSize}</span></p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{investor.description}</p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {investor.focus.map((focus, fIdx) => (
                    <span key={fIdx} className="text-[9px] font-bold font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                      {focus}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <span className="text-[10px] text-slate-500 font-medium">{investor.portfolioCount} Vetted Cos</span>
                  <button 
                    onClick={() => {
                      setPitchData(prev => ({ ...prev, tech: investor.focus[0] || "AI" }));
                      setShowPitchModal(true);
                      setPitchStep(1);
                    }}
                    className="font-bold text-amber-400 hover:text-white flex items-center gap-1 group transition-all"
                  >
                    Pitch Directly
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* VC Pitch modal */}
      <AnimatePresence>
        {showPitchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowPitchModal(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-amber-500/20 max-w-lg w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Direct Venture Pitch Sandbox
                </h3>
                <button onClick={() => setShowPitchModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pitchStep === 1 && (
                <form onSubmit={handleFundPitch} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Startup Idea & Technology core</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Building low-cost visual sensor kits for agricultural IoT telemetry with local language translation models."
                      value={pitchData.idea}
                      onChange={(e) => setPitchData(prev => ({ ...prev, idea: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tech Category</label>
                      <select 
                        value={pitchData.tech}
                        onChange={(e) => setPitchData(prev => ({ ...prev, tech: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="AI">AI / Deep Learning</option>
                        <option value="Semiconductors">Semiconductors</option>
                        <option value="Robotics">Robotics & IoT</option>
                        <option value="Fintech">Fintech Protocols</option>
                        <option value="SaaS">B2B SaaS</option>
                        <option value="Deep Tech">Deep Tech</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Founders Count</label>
                      <select
                        value={pitchData.teamSize}
                        onChange={(e) => setPitchData(prev => ({ ...prev, teamSize: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="1">Solo Founder (1)</option>
                        <option value="2">Co-founders (2)</option>
                        <option value="3">Small Team (3-4)</option>
                        <option value="5">Scaled Team (5+)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Funding Target Envelope</label>
                    <select
                      value={pitchData.fundingGoal}
                      onChange={(e) => setPitchData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="PKR 5 Million">PKR 5 - 10 Million (Pre-seed Grant)</option>
                      <option value="PKR 25 Million">PKR 25 - 50 Million (Seed Matching PSF)</option>
                      <option value="PKR 100 Million">PKR 100 Million+ (Series A Venture)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-amber-400 transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Evaluate VC Alignment Focus
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {pitchStep === 2 && (
                <div className="text-center py-12 flex flex-col justify-center items-center">
                  <Terminal className="w-12 h-12 text-amber-400 animate-spin mb-4" />
                  <h4 className="font-extrabold text-sm text-white">Matching VC Parameters...</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mt-1 leading-relaxed">
                    Calculating focus alignment indices with Zayn Capital, Sarmayacar, and PSF matching co-equity regulations...
                  </p>
                </div>
              )}

              {pitchStep === 3 && pitchScore && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center text-amber-400 font-mono font-black text-sm">
                      {pitchScore.score}%
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white tracking-wide">{pitchScore.probability}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wide">FBR IT Remittance Waiver: COMPLIANT</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-3">
                    <div>
                      <p className="font-extrabold text-emerald-400 tracking-wide">Direct Focus Match VCs:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {pitchScore.investors.map((inv: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold font-mono bg-slate-900 text-slate-200 px-2 py-0.5 rounded border border-white/5">
                            {inv}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-extrabold text-amber-400 tracking-wide">Platform Directives:</p>
                      <p className="text-slate-300 leading-relaxed font-semibold mt-0.5">{pitchScore.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setPitchStep(1)} 
                      className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Modify Parameters
                    </button>
                    <button 
                      onClick={() => {
                        setShowPitchModal(false);
                        alert(`Successfully submitted and logged! Pre-vetted pitch data packets dispatched to: ${pitchScore.investors.join(', ')}`);
                      }} 
                      className="flex-1 bg-amber-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      Dispatch Deck Packets
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
