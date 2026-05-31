"use client";

import React, { useState } from "react";
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
  CheckCircle2
} from "lucide-react";

import { individualInvestorsData, IndividualInvestor } from "../../data";

export default function IndividualInvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pitchInvestor, setPitchInvestor] = useState<IndividualInvestor | null>(null);
  const [pitchSubmitted, setPitchSubmitted] = useState(false);
  
  const [ideaDesc, setIdeaDesc] = useState("");
  const [equityTarget, setEquityTarget] = useState("");

  const filteredInvestors = individualInvestorsData.filter(i => {
    return i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.primaryFocus.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">

        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20 mb-4">
            <Users className="w-3.5 h-3.5" />
            INVESTMENT PROTOCOLS / INDIVIDUALS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Angel Investors & Diaspora mentors
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Direct channel to high-net-worth overseas Pakistani tech directors, Silicon Valley designers, and local serial entrepreneurs ready to offer smart capital.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search angels by focus (e.g. Chip design, Fintech)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredInvestors.map(investor => (
            <div 
              key={investor.id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-3 items-center">
                    <img 
                      src={investor.avatar} 
                      alt={investor.name} 
                      className="w-14 h-14 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="font-extrabold text-base text-white tracking-wide">{investor.name}</h4>
                      <p className="text-xs text-amber-400 font-bold">{investor.title}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 shrink-0">
                    {investor.diasporaLocation || "Local Angel"}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 mb-4 text-xs">
                  <p className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-[9px]">Standard Cheque Envelope</p>
                  <p className="font-mono text-white font-extrabold text-sm">{investor.chequeRange}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{investor.bio}</p>

                {/* Focus areas */}
                <div className="mb-4">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Primary Sectors</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {investor.primaryFocus}
                    </span>
                    {investor.secondaryFocus.map((sec, idx) => (
                      <span key={idx} className="text-[10px] font-bold font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills offered */}
                <div className="mb-6">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Mentorship Scope</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {investor.skillsOffered.map((sk, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✔</span> {sk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <span className="text-[10px] text-slate-500 font-medium">{investor.portfolioCount} Active Seed Investments</span>
                
                <button 
                  onClick={() => {
                    setPitchInvestor(investor);
                    setPitchSubmitted(false);
                  }}
                  className="bg-slate-900 border border-white/10 hover:border-transparent hover:bg-amber-500 hover:text-slate-950 font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
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
            <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-sm cursor-pointer" onClick={() => setPitchInvestor(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-amber-500/20 max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Angel Connection Portal
                </h3>
                <button onClick={() => setPitchInvestor(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 items-center p-3 bg-slate-900/60 rounded-xl border border-white/5 mb-4 text-xs">
                <img src={pitchInvestor.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-white">{pitchInvestor.name}</p>
                  <p className="text-slate-400">{pitchInvestor.title}</p>
                </div>
              </div>

              {pitchSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="font-extrabold text-sm text-white">Connection Packet Sent!</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                    Venture parameters locked and shared with {pitchInvestor.name}. Sandbox channels will alert on response.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePitchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Startup Summary & Tech Stack</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail your chip tape-out or LLM RAG pipelines..."
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Capital Asked & Expected Equity Dilution</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $30,000 for 5% equity pre-seed"
                      value={equityTarget}
                      onChange={(e) => setEquityTarget(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[9.5px] text-slate-400 leading-normal flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    Angels match deals faster if profiles include university research validation certificates. Keep tags fully updated.
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-amber-400 transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Submit Pitch Packet
                    <ArrowRight className="w-4 h-4" />
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
