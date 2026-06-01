"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  TrendingUp,
  Mail,
  X,
  ArrowRight,
  CheckCircle2,
  Filter,
  DollarSign,
  Globe
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

export default function IndividualInvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPakOnly, setShowPakOnly] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  
  // Modal & Pitch states
  const [pitchInvestor, setPitchInvestor] = useState<Investor | null>(null);
  const [pitchSubmitted, setPitchSubmitted] = useState(false);
  const [ideaDesc, setIdeaDesc] = useState("");
  const [equityTarget, setEquityTarget] = useState("");

  // Filter raw list to only individual angels / angel networks
  const angelInvestors = useMemo(() => {
    const individualTypes = ["Angel network", "Solo angel", "Startup studio", "Incubator, Accelerator", "Other"];
    return (rawInvestors as Investor[]).filter(inv => individualTypes.includes(inv.type));
  }, []);

  // Compute stats
  const pakAngelsCount = useMemo(() => {
    return angelInvestors.filter(i => String(i.countries || '').toLowerCase().includes("pakistan")).length;
  }, [angelInvestors]);

  // Apply filters
  const filteredInvestors = useMemo(() => {
    return angelInvestors.filter(i => {
      const nameStr = String(i.name || '');
      const hqStr = String(i.hq || '');
      const thesisStr = String(i.thesis || '');
      const countriesStr = String(i.countries || '');

      const matchesSearch = 
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hqStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thesisStr.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPak = !showPakOnly || countriesStr.toLowerCase().includes("pakistan");
      const matchesType = selectedType === "All" || i.type === selectedType;

      return matchesSearch && matchesPak && matchesType;
    });
  }, [angelInvestors, searchTerm, showPakOnly, selectedType]);

  const handlePitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPitchSubmitted(true);
    setTimeout(() => {
      setPitchInvestor(null);
      setPitchSubmitted(false);
      setIdeaDesc("");
      setEquityTarget("");
    }, 2000);
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20 uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              Angel Connections / Individuals
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest border border-white/5 px-2.5 py-0.5 rounded-md bg-white/[0.02]">
              Real OpenVC Dataset
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Angel Investors & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Diaspora Mentors</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed font-semibold">
            Direct channels to high-net-worth individual angels, overseas Pakistani tech directors, and local angel syndicates ready to back verified startups.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Search Bar */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search angels by name, thesis, or headquarters location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#0c111d] border border-white/5 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-amber-500/30 transition-all outline-none"
            />
          </div>

          {/* Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#0c111d] border border-white/5 focus:border-amber-500/30 text-white text-xs px-4 py-3.5 rounded-xl outline-none transition-all cursor-pointer font-bold"
            >
              <option value="All">All Angel Types</option>
              <option value="Angel network">Angel Networks</option>
              <option value="Solo angel">Solo Angels</option>
              <option value="Startup studio">Startup Studios</option>
              <option value="Incubator, Accelerator">Accelerators / Incubators</option>
              <option value="Other">Other Networks</option>
            </select>
          </div>

          {/* Pakistan Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c111d] border border-white/5 h-full">
            <span className="text-xs text-slate-400 font-bold">Invest in Pakistan</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPakOnly}
                onChange={() => setShowPakOnly(!showPakOnly)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Selected parameters summary */}
        <div className="mb-6 flex justify-between items-center text-[10.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          <span>Found {filteredInvestors.length} Match{filteredInvestors.length !== 1 && "es"}</span>
          {showPakOnly && <span>Showing {pakAngelsCount} Pakistan-Active Angels</span>}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredInvestors.slice(0, 100).map(investor => (
            <div 
              key={investor.id}
              className="bg-[#0c111d] border border-white/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/2 blur-[30px] pointer-events-none group-hover:bg-amber-500/6 transition-all"></div>

              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                      {investor.type}
                    </span>
                    <h3 className="text-lg font-black text-white mt-2 group-hover:text-amber-400 transition-all uppercase tracking-wide">
                      {investor.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {investor.hq || "Global HQ"}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cheque Size</p>
                    <p className="text-xs font-black text-amber-400 font-mono mt-0.5">
                      {formatCheque(investor.minCheque, investor.maxCheque)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl mb-4 text-xs font-semibold leading-relaxed">
                  <p className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1">Investment Mandate / Thesis</p>
                  <p className="text-slate-300">
                    {investor.thesis || "Active individual angel supporting global and regional tech founders."}
                  </p>
                </div>

                {/* Country scope */}
                <div className="mb-4 text-xs">
                  <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1.5">Target Countries</span>
                  <div className="flex flex-wrap gap-1">
                    {investor.countries.split(",").slice(0, 5).map((country, idx) => (
                      <span key={idx} className="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-300">
                        {country.trim()}
                      </span>
                    ))}
                    {investor.countries.split(",").length > 5 && (
                      <span className="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-500">
                        +{investor.countries.split(",").length - 5} More
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage scope */}
                {investor.stage && (
                  <div className="mb-6 text-xs">
                    <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider mb-1.5">Active Stages</span>
                    <div className="flex flex-wrap gap-1">
                      {investor.stage.split(",").map((stg, idx) => (
                        <span key={idx} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/5">
                          {stg.replace(/^\d+\.\s*/, "").trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <a 
                  href={investor.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 text-slate-500 hover:text-white font-bold transition-all uppercase tracking-wider text-[10px]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
                
                <button 
                  onClick={() => {
                    setPitchInvestor(investor);
                    setPitchSubmitted(false);
                  }}
                  className="bg-slate-900 border border-white/10 hover:border-transparent hover:bg-amber-500 hover:text-slate-950 font-black py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[9px]"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Connect & Pitch
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Connection pitch modal */}
      <AnimatePresence>
        {pitchInvestor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer" onClick={() => setPitchInvestor(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c111d] border border-white/10 p-6 rounded-2xl max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-2 uppercase">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Angel Connection Portal
                </h3>
                <button onClick={() => setPitchInvestor(null)} className="text-slate-400 hover:text-white cursor-pointer p-0.5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3 items-center p-3 bg-slate-950/50 rounded-xl border border-white/5 mb-4 text-xs font-semibold">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  {pitchInvestor.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white uppercase">{pitchInvestor.name}</p>
                  <p className="text-slate-500">{pitchInvestor.type}</p>
                </div>
              </div>

              {pitchSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="font-black text-sm text-white uppercase tracking-wider">Connection Packet Sent!</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed font-semibold">
                    Venture parameters locked and shared with {pitchInvestor.name}. Platform escrow advisors will alert on response.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePitchSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Startup Summary & Tech Stack</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail your agricultural robotics navigation algorithm or RISC-V co-processor..."
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-amber-500/30 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Capital Asked & Expected Dilution</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $30,000 for 5% equity pre-seed"
                      value={equityTarget}
                      onChange={(e) => setEquityTarget(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#05070c] border border-white/5 text-white focus:outline-none focus:border-amber-500/30"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[9.5px] text-slate-400 leading-normal flex items-start gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    Angels match deals faster if profiles include university research validation certificates. Keep tags fully updated.
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl hover:bg-amber-400 transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                  >
                    Submit Pitch Packet
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
