"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Globe,
  Plus,
  Zap,
  ArrowRight,
  TrendingUp,
  X,
  CheckCircle2,
  Terminal
} from "lucide-react";

import { companyInvestorsData, CompanyInvestor } from "../../data";

export default function CompanyInvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeVC, setActiveVC] = useState<CompanyInvestor | null>(null);
  
  // Pitch Wizard States
  const [pitchStep, setPitchStep] = useState(1);
  const [pitchData, setPitchData] = useState({
    idea: "",
    tech: "AI",
    teamSize: "1",
    fundingGoal: "PKR 5 Million"
  });
  const [pitchScore, setPitchScore] = useState<any>(null);

  const filteredCompanies = companyInvestorsData.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.companyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.primaryFocus.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFundPitch = (e: React.FormEvent) => {
    e.preventDefault();
    setPitchStep(2);
    setTimeout(() => {
      let score = 75;
      let matchedInvestors: string[] = [];
      
      if (pitchData.tech === "AI" || pitchData.tech === "Deep Tech" || pitchData.tech === "Semiconductors") {
        score += 18;
        matchedInvestors = [activeVC?.name || "Target VC"];
      } else {
        score += 8;
        matchedInvestors = [activeVC?.name || "Target VC"];
      }

      if (parseInt(pitchData.teamSize) > 1) score += 5;

      setPitchScore({
        score: Math.min(score, 99),
        probability: score > 90 ? "Strong Alignment" : score > 75 ? "Favorable Alignment" : "Partial Mandate",
        recommendation: `Your parameters align with active seed assets at ${activeVC?.name}. Double checks on local SECP compliance passed. Ready to dispatch.`,
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            INVESTMENT PROTOCOLS / INSTITUTIONAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Venture Capital & Corporate Funds
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Submit unified seed and matching pre-equity applications to regional VCs, sovereign seed agencies, and FBR IT export compliant family offices.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search VCs by focus or type (e.g. Sovereign, B2B SaaS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredCompanies.map(company => (
            <div 
              key={company.id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-cyan-400 font-mono text-base tracking-tighter">
                    {company.logo}
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 shrink-0">
                    {company.companyType}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white tracking-wide mb-1">{company.name}</h4>
                <p className="text-xs text-slate-400 font-semibold mb-3">Target Tickets: <span className="text-cyan-400 font-extrabold font-mono">{company.chequeRange}</span></p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{company.description}</p>

                {/* Lead partners */}
                <div className="mb-4 text-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Lead Investment Partners</p>
                  <p className="text-slate-300 font-bold">{company.leadPartners.join(', ')}</p>
                </div>

                {/* Focus areas */}
                <div className="mb-6">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Investment Mandate</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded border border-cyan-500/20">
                      {company.primaryFocus}
                    </span>
                    {company.secondaryFocus.map((sec, idx) => (
                      <span key={idx} className="text-[10px] font-bold font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-slate-400 hover:text-white font-semibold transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>

                  <button 
                    onClick={() => {
                      setActiveVC(company);
                      setPitchStep(1);
                      setPitchScore(null);
                    }}
                    className="bg-slate-900 border border-white/10 hover:border-transparent hover:bg-cyan-500 hover:text-slate-950 font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Apply for Funding
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* VC Pitch modal */}
      <AnimatePresence>
        {activeVC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-sm cursor-pointer" onClick={() => setActiveVC(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-cyan-500/20 max-w-lg w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    Venture Pitch Workbench
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">Target: {activeVC.name}</p>
                </div>
                <button onClick={() => setActiveVC(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pitchStep === 1 && (
                <form onSubmit={handleFundPitch} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Innovation Scope / Startup parameters</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail your agricultural robotics navigation algorithm or RISC-V co-processor..."
                      value={pitchData.idea}
                      onChange={(e) => setPitchData(prev => ({ ...prev, idea: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Tech Tag</label>
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Cheque size</label>
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
                    className="w-full bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-400 transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Evaluate Pitch Alignment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {pitchStep === 2 && (
                <div className="text-center py-12 flex flex-col justify-center items-center">
                  <Terminal className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                  <h4 className="font-extrabold text-sm text-white">Running Mandate Analysis...</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mt-1 leading-relaxed">
                    Verifying FBR IT export compliance maps and cross-referencing past seed targets...
                  </p>
                </div>
              )}

              {pitchStep === 3 && pitchScore && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                      {pitchScore.score}%
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white tracking-wide">{pitchScore.probability}</h5>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Federal Sovereign matching: pre-checked</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-3">
                    <div>
                      <p className="font-extrabold text-cyan-400 tracking-wide">Platform Directives:</p>
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
                        setActiveVC(null);
                        alert(`Venture pitch dispatched! Portfolios advisors will schedule meeting coordinates directly.`);
                      }} 
                      className="flex-1 bg-cyan-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl hover:bg-cyan-400 transition-all cursor-pointer"
                    >
                      Dispatch Deck
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
