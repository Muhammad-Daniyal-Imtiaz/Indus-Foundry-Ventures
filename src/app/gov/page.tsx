"use client";

import React from "react";
import {
  Building2,
  Calendar,
  ChevronRight,
  Sparkles
} from "lucide-react";

import { govProgramsData } from "../data";

export default function GovPage() {
  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            MODULE 05 / STATE ACCESS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Government Portals & Grants
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Acquire direct matching capital, PITB deep-tech incubator space, FBR IT export incentives, and university research grants.
          </p>
        </div>

        {/* Main List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {govProgramsData.map(prog => (
            <div 
              key={prog.id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                    {prog.agency}
                  </span>
                  <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {prog.type}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white tracking-wide mb-2">{prog.title}</h4>
                <p className="text-xs text-slate-400 font-bold mb-3">Funding Caps: <span className="text-cyan-400 font-extrabold font-mono">{prog.fundingCap}</span></p>
                
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 mb-4 text-xs">
                  <p className="text-slate-400 font-semibold mb-1">Compliance eligibility requirements:</p>
                  <p className="text-slate-300">{prog.eligibility}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="text-[10.5px] font-semibold text-red-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Apply by: {prog.deadline}
                </span>
                
                <button 
                  onClick={() => alert("Launching check! Your pre-loaded NUST/FAST university collaborations are qualified. Redirecting to PSF co-equity term sheets.")}
                  className="bg-slate-900 border border-white/10 hover:border-transparent hover:bg-cyan-500 hover:text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Verify Compliance & Apply
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
