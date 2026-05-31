"use client";

import React from "react";
import {
  Handshake,
  Globe,
  Building2,
  GraduationCap,
  ArrowRight
} from "lucide-react";

import { partnershipsData } from "../data";

export default function PartnershipsPage() {
  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/20 mb-4">
            <Handshake className="w-3.5 h-3.5" />
            MODULE 06 / ALLIANCES
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Diaspora & Corporate Alliances
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Integrate with Pakistani export giants offering B2B sandbox platforms or align with Silicon Valley and UK tech diasporas for premium engineering mentorship.
          </p>
        </div>

        {/* Main List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {partnershipsData.map(partnership => (
            <div 
              key={partnership.id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-indigo-400 shrink-0">
                {partnership.icon === 'Globe' && <Globe className="w-6 h-6" />}
                {partnership.icon === 'Building' && <Building2 className="w-6 h-6" />}
                {partnership.icon === 'GraduationCap' && <GraduationCap className="w-6 h-6" />}
                {partnership.icon === 'Network' && <Handshake className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                    {partnership.type}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {partnership.activeOpportunities} Active Nodes
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-white tracking-wide mt-1">{partnership.name}</h4>
                <p className="text-xs text-slate-400 font-bold mt-0.5">{partnership.entity}</p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{partnership.benefit}</p>
                
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end text-xs">
                  <button 
                    onClick={() => alert(`Connect request sent! A dedicated sandbox channel invitation has been dispatched to coordination agents.`)}
                    className="font-bold text-indigo-400 hover:text-white flex items-center gap-1 group transition-all cursor-pointer"
                  >
                    Request Integration Sandbox
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
