"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Cpu,
  AlertCircle
} from "lucide-react";

import { jobsData } from "../data";

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<string>("All");

  const filteredJobs = jobsData.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesField = selectedField === "All" || j.category === selectedField;
    return matchesSearch && matchesField;
  });

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold border border-teal-500/20 mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            MODULE 02 / PLACEMENTS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Skill-to-Placement Placements
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Skip regular resume sorting. Prove your capabilities via edge sandboxes or match with top tech employers offering remote and local positions.
          </p>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by role, company, technology stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs overflow-x-auto shrink-0">
            {['All', 'AI', 'SaaS', 'Semiconductors', 'Robotics', 'Fintech'].map(field => (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  selectedField === field 
                    ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        {/* Main List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No placements found matching "{searchTerm}"</p>
              <button onClick={() => { setSearchTerm(""); setSelectedField("All"); }} className="text-xs text-teal-400 mt-2 underline">Clear all filters</button>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div 
                key={job.id} 
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-extrabold text-base text-white tracking-wide">{job.title}</h4>
                      <p className="text-xs text-slate-400 font-semibold">{job.company}</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded border border-teal-500/25">
                      {job.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-400 font-extrabold">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[9.5px] font-bold font-mono bg-slate-900 text-slate-300 px-2.5 py-0.5 rounded border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => alert("Applying! Indus Placement pipeline is checking compilation requirements. Keep checks active.")}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold py-2.5 rounded-lg transition-all text-center cursor-pointer"
                  >
                    Apply via Skill-Matcher
                  </button>
                  <Link 
                    href="/challenges"
                    className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 hover:border-teal-500/30 text-slate-300 text-xs font-bold hover:text-teal-400 transition-all text-center"
                    title="Bypass resume sort - complete active challenges for direct slots!"
                  >
                    Bypass via Challenge
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
