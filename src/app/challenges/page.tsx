"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  Calendar,
  X,
  Play,
  UploadCloud,
  Terminal,
  AlertCircle
} from "lucide-react";

import { challengesData, Challenge } from "../data";

export default function ChallengesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sandbox Challenge Submission States
  const [submittingChallenge, setSubmittingChallenge] = useState<Challenge | null>(null);
  const [challengeFile, setChallengeFile] = useState<string | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<string[]>([]);
  const [challengeRunStatus, setChallengeRunStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const filteredChallenges = challengesData.filter(c => {
    return c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const triggerChallengeRun = () => {
    if (!challengeFile) return;
    setChallengeRunStatus('running');
    setChallengeProgress([
      "Initializing Sandbox Environment...",
      "Cloning submission repository...",
      "Scanning architecture & compiling dependencies..."
    ]);

    setTimeout(() => {
      setChallengeProgress(prev => [...prev, "Running unit test suites...", "Analyzing edge performance benchmarks..."]);
    }, 1200);

    setTimeout(() => {
      setChallengeProgress(prev => [
        ...prev, 
        "✔ Verification Complete!", 
        "No security vulnerabilities found.", 
        "Compilation Status: SUCCESS", 
        "Matches 98% of performance thresholds!"
      ]);
      setChallengeRunStatus('done');
    }, 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/20 mb-4">
            <Trophy className="w-3.5 h-3.5" />
            MODULE 03 / COMPETITIVE ARENA
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            The Challenge Arena
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Compete on real engineering bottlenecks posted by government departments and corporate partners. Secure prize capital, pilot integrations, or direct equity checks.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search challenges by title, entity, technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
            />
          </div>
        </div>

        {/* Main List */}
        <div className="space-y-6 mb-16">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No challenges found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm("")} className="text-xs text-rose-400 mt-2 underline">Clear search</button>
            </div>
          ) : (
            filteredChallenges.map(challenge => (
              <div 
                key={challenge.id}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                      {challenge.postedBy}
                    </span>
                    <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {challenge.category}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-lg text-white tracking-wide mb-2">{challenge.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{challenge.description}</p>
                  
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-300">
                    <p className="font-bold text-rose-400 flex items-center gap-1 mb-1.5 font-mono">
                      <Terminal className="w-3.5 h-3.5" />
                      PROBLEM STATEMENT:
                    </p>
                    <p className="italic leading-relaxed">{challenge.problemStatement}</p>
                  </div>
                </div>

                <div className="w-full md:w-72 bg-slate-900/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between shrink-0">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PRIZE & REWARD</p>
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {challenge.daysLeft} Days Left
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-amber-400 mb-1">{challenge.prizePool}</p>
                    <p className="text-[10.5px] text-slate-400 font-medium">Core reward: <span className="text-emerald-400 font-bold">{challenge.rewardType}</span></p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-white/5">
                      <span>Active Teams competing</span>
                      <span className="font-extrabold text-white">{challenge.participantsCount}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSubmittingChallenge(challenge);
                      setChallengeFile(null);
                      setChallengeProgress([]);
                      setChallengeRunStatus('idle');
                    }}
                    className="w-full mt-6 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Compete & Submit Solution
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Solutions Upload Workbench modal */}
      <AnimatePresence>
        {submittingChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm cursor-pointer" onClick={() => setSubmittingChallenge(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-rose-500/20 max-w-lg w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-rose-400" />
                    Solution Workbench Sandbox
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wide leading-tight mt-0.5">{submittingChallenge.title}</p>
                </div>
                <button onClick={() => setSubmittingChallenge(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {challengeRunStatus === 'idle' ? (
                <div className="space-y-5">
                  <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl text-xs text-slate-300">
                    <p className="font-bold text-rose-400 mb-1">COMPETE FOR: {submittingChallenge.prizePool}</p>
                    Submit Verilog RTL, software codebases, or analytical documents for compiler validation tests inside sandbox grids.
                  </div>

                  <div 
                    onClick={() => setChallengeFile("indus_silicon_layout_v1.sv")}
                    className="p-8 rounded-xl border border-dashed border-white/10 hover:border-rose-500/40 bg-slate-900/40 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-10 h-10 text-slate-500" />
                    <p className="text-xs font-bold text-white">
                      {challengeFile ? `✔ Selected: ${challengeFile}` : "Drag and drop RTL or Code files"}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-none">Supports .sv, .v, .py, .pdf files up to 50MB</p>
                  </div>

                  <button 
                    onClick={triggerChallengeRun}
                    disabled={!challengeFile}
                    className={`w-full font-bold py-2.5 rounded-xl text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      challengeFile 
                        ? "bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/10 cursor-pointer"
                        : "bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
                    Launch Sandbox Compilation
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 min-h-[180px]">
                    <p className="text-rose-400 font-bold mb-2">[$] Compiler Terminal Sandbox Output:</p>
                    {challengeProgress.map((prog, pIdx) => (
                      <p key={pIdx} className="leading-relaxed mt-1">
                        <span className="text-emerald-500">&gt;</span> {prog}
                      </p>
                    ))}
                    {challengeRunStatus === 'running' && (
                      <p className="animate-pulse text-amber-400 mt-2 font-black">Executing verify loop...</p>
                    )}
                  </div>

                  {challengeRunStatus === 'done' ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setChallengeRunStatus('idle')}
                        className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                      >
                        Re-upload
                      </button>
                      <button 
                        onClick={() => {
                          setSubmittingChallenge(null);
                          alert(`Success! Your layout solution passed sandboxed compiler checks scoring 98.2%. The challenge coordinators have been notified.`);
                        }}
                        className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl hover:bg-emerald-400 transition-all"
                      >
                        Finalize Entry Submission
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-500 font-bold">
                      Checking test-suite compliance...
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
