"use client";

import React, { useState, useMemo } from "react";
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
  Terminal,
  MapPin,
  Filter
} from "lucide-react";

import rawInvestors from "../investors.json";

interface Investor {
  id: string;
  name: string;
  website: string;
  hq: string;
  countries: string;
  stage: string;
  thesis: string;
  type: string;
  minCheque: number | null;
  maxCheque: number | null;
}

// Helper to format cheque sizes
function formatCheque(min: number | null, max: number | null) {
  if (min === null && max === null) return "Open Ticket";
  const fmt = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${num}`;
  };
  if (min !== null && max !== null) return `${fmt(min)} - ${fmt(max)}`;
  if (min !== null) return `Min: ${fmt(min)}`;
  if (max !== null) return `Max: ${fmt(max)}`;
  return "Open Ticket";
}

export default function CompanyInvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPakOnly, setShowPakOnly] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [visibleCount, setVisibleCount] = useState(30);
  
  const [activeVC, setActiveVC] = useState<Investor | null>(null);
  
  // Pitch Wizard States
  const [pitchStep, setPitchStep] = useState(1);
  const [pitchData, setPitchData] = useState({
    idea: "",
    tech: "AI",
    teamSize: "1",
    fundingGoal: "PKR 5 Million"
  });
  const [pitchScore, setPitchScore] = useState<any>(null);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setVisibleCount(30);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    setVisibleCount(30);
  };

  const handlePakToggle = () => {
    setShowPakOnly(prev => !prev);
    setVisibleCount(30);
  };

  // Filter raw list to only company/institutional VCs
  const companyInvestors = useMemo(() => {
    const corporateTypes = ["VC", "Family office", "PE fund", "Corporate VC", "Public fund", "Revenue-based"];
    return (rawInvestors as Investor[]).filter(inv => corporateTypes.includes(inv.type));
  }, []);

  // Compute stats
  const pakCompaniesCount = useMemo(() => {
    return companyInvestors.filter(c => String(c.countries || '').toLowerCase().includes("pakistan")).length;
  }, [companyInvestors]);

  // Apply filters
  const filteredCompanies = useMemo(() => {
    return companyInvestors.filter(c => {
      const nameStr = String(c.name || '');
      const hqStr = String(c.hq || '');
      const thesisStr = String(c.thesis || '');
      const countriesStr = String(c.countries || '');

      const matchesSearch = 
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hqStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thesisStr.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPak = !showPakOnly || countriesStr.toLowerCase().includes("pakistan");
      const matchesType = selectedType === "All" || c.type === selectedType;

      return matchesSearch && matchesPak && matchesType;
    });
  }, [companyInvestors, searchTerm, showPakOnly, selectedType]);

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
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-12 px-6 bg-grid-pattern overflow-hidden font-sans">
      {/* Patriotic Tech Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/6 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/5 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Banner Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              VC Protocols / Institutional Funds
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest border border-white/5 px-2.5 py-0.5 rounded-md bg-white/[0.02]">
              Real OpenVC Dataset
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Venture Capital & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">Corporate Funds</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed font-semibold">
            Submit unified pre-seed matching equity applications directly to regional VCs, sovereign wealth funds, PITB-compliant family offices, and export funds.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Search Bar */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search VCs by name, thesis, or headquarters location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#0c111d] border border-white/5 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-cyan-500/30 transition-all outline-none"
            />
          </div>

          {/* Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-[#0c111d] border border-white/5 focus:border-cyan-500/30 text-white text-xs px-4 py-3.5 rounded-xl outline-none transition-all cursor-pointer font-bold"
            >
              <option value="All">All VC Types</option>
              <option value="VC">Venture Capital (VC)</option>
              <option value="Family office">Family Offices</option>
              <option value="PE fund">Private Equity (PE)</option>
              <option value="Corporate VC">Corporate VCs</option>
              <option value="Public fund">Sovereign / Public Funds</option>
              <option value="Revenue-based">Revenue-Based Funds</option>
            </select>
          </div>

          {/* Pakistan Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c111d] border border-white/5 h-full">
            <span className="text-xs text-slate-400 font-bold">Invest in Pakistan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPakOnly}
                onChange={handlePakToggle}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Selected parameters summary */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-white/5 pb-4">
          <span>Found {filteredCompanies.length} matching VC{filteredCompanies.length !== 1 ? "s" : ""} (out of {companyInvestors.length} total VCs in database)</span>
          {showPakOnly && <span className="text-emerald-400">Showing {pakCompaniesCount} Pakistan-Active VCs</span>}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCompanies.slice(0, visibleCount).map(company => (
            <div 
              key={company.id}
              className="bg-[#0c111d] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 transition-all flex flex-col justify-between group relative overflow-hidden text-xs"
            >
              {/* Top background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/2 blur-[30px] pointer-events-none group-hover:bg-cyan-500/6 transition-all"></div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-cyan-400 font-mono text-xs tracking-tighter">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-slate-400 shrink-0">
                    {company.type}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-white tracking-wide mb-1 uppercase group-hover:text-cyan-400 transition-all">{company.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-3">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {company.hq || "Global HQ"}
                </div>

                <p className="text-slate-400 font-semibold mb-3">Target Tickets: <span className="text-cyan-400 font-extrabold font-mono">{formatCheque(company.minCheque, company.maxCheque)}</span></p>
                
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl mb-4 font-semibold leading-relaxed">
                  <p className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1">Investment Thesis</p>
                  <p className="text-slate-300">
                    {company.thesis || "Pre-seed matching equity and seed venture programs globally."}
                  </p>
                </div>

                {/* Country scope */}
                <div className="mb-4">
                  <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1.5">Target Countries</span>
                  <div className="flex flex-wrap gap-1">
                    {company.countries.split(",").slice(0, 3).map((country, idx) => (
                      <span key={idx} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-300">
                        {country.trim()}
                      </span>
                    ))}
                    {company.countries.split(",").length > 3 && (
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-500">
                        +{company.countries.split(",").length - 3} More
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage scope */}
                {company.stage && (
                  <div className="mb-6">
                    <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1.5">Active Stages</span>
                    <div className="flex flex-wrap gap-1">
                      {company.stage.split(",").slice(0, 3).map((stg, idx) => (
                        <span key={idx} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/5">
                          {stg.replace(/^\d+\.\s*/, "").trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 text-slate-500 hover:text-white font-bold transition-all uppercase tracking-wider text-[10px]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>

                  <button 
                    onClick={() => {
                      setActiveVC(company);
                      setPitchStep(1);
                      setPitchScore(null);
                    }}
                    className="bg-slate-900 border border-white/10 hover:border-transparent hover:bg-cyan-500 hover:text-slate-950 font-black py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[9px]"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Apply for Funding
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {filteredCompanies.length > visibleCount && (
          <div className="flex justify-center mt-12 mb-16">
            <button
              onClick={() => setVisibleCount(prev => prev + 60)}
              className="bg-slate-900 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400 text-slate-300 font-black text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-lg shadow-black/40"
            >
              Load More Venture Funds ({filteredCompanies.length - visibleCount} remaining)
            </button>
          </div>
        )}

      </div>

      {/* VC Pitch modal */}
      <AnimatePresence>
        {activeVC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer" onClick={() => setActiveVC(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c111d] border border-white/10 p-6 rounded-2xl max-w-lg w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-2 uppercase">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    Venture Pitch Workbench
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5 uppercase">Target Fund: {activeVC.name}</p>
                </div>
                <button onClick={() => setActiveVC(null)} className="text-slate-400 hover:text-white cursor-pointer p-0.5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {pitchStep === 1 && (
                <form onSubmit={handleFundPitch} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Innovation Scope / Startup parameters</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail your agricultural robotics navigation algorithm or RISC-V co-processor..."
                      value={pitchData.idea}
                      onChange={(e) => setPitchData(prev => ({ ...prev, idea: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-cyan-500/30 resize-none leading-relaxed font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Tech Tag</label>
                      <select 
                        value={pitchData.tech}
                        onChange={(e) => setPitchData(prev => ({ ...prev, tech: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-cyan-500/30 cursor-pointer font-bold"
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
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Founders Count</label>
                      <select
                        value={pitchData.teamSize}
                        onChange={(e) => setPitchData(prev => ({ ...prev, teamSize: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-cyan-500/30 cursor-pointer font-bold"
                      >
                        <option value="1">Solo Founder (1)</option>
                        <option value="2">Co-founders (2)</option>
                        <option value="3">Small Team (3-4)</option>
                        <option value="5">Scaled Team (5+)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Cheque size</label>
                    <select
                      value={pitchData.fundingGoal}
                      onChange={(e) => setPitchData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-cyan-500/30 cursor-pointer font-bold"
                    >
                      <option value="PKR 5 Million">PKR 5 - 10 Million (Pre-seed Grant)</option>
                      <option value="PKR 25 Million">PKR 25 - 50 Million (Seed Matching PSF)</option>
                      <option value="PKR 100 Million">PKR 100 Million+ (Series A Venture)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-cyan-500 text-slate-950 font-black py-2.5 rounded-xl hover:bg-cyan-400 transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                  >
                    Evaluate Pitch Alignment
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              )}

              {pitchStep === 2 && (
                <div className="text-center py-12 flex flex-col justify-center items-center">
                  <Terminal className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                  <h4 className="font-black text-sm text-white uppercase tracking-wider">Running Mandate Analysis...</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mt-1 leading-relaxed font-semibold">
                    Verifying sovereign matching parameters and cross-referencing seed targets...
                  </p>
                </div>
              )}

              {pitchStep === 3 && pitchScore && (
                <div className="space-y-5 text-xs">
                  <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5 font-semibold">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                      {pitchScore.score}%
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white tracking-wide uppercase">{pitchScore.probability}</h5>
                      <p className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">Federal Sovereign matching: pre-checked</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-semibold">
                    <div>
                      <p className="font-black text-cyan-400 tracking-wide uppercase">Platform Directives:</p>
                      <p className="text-slate-300 leading-relaxed font-semibold mt-0.5">{pitchScore.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setPitchStep(1)} 
                      className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-black py-2.5 rounded-xl transition-all uppercase tracking-wider text-[10px]"
                    >
                      Modify Parameters
                    </button>
                    <button 
                      onClick={() => {
                        setActiveVC(null);
                        alert(`Venture pitch dispatched! Portfolio advisors will schedule meeting coordinates directly.`);
                      }} 
                      className="flex-1 bg-cyan-500 text-slate-950 font-black py-2.5 rounded-xl hover:bg-cyan-400 transition-all cursor-pointer uppercase tracking-wider text-[10px]"
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
