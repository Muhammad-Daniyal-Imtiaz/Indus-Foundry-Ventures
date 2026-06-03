"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2, Plus, Search, MapPin, Users, Briefcase, Tag,
  Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
import { getAllCompanyPages, getMyCompanyPage } from "@/app/actions/company";

const INDUSTRIES = ["All", "AI", "SaaS", "Fintech", "Robotics", "Semiconductors", "EdTech", "HealthTech", "AgriTech", "CleanTech", "E-commerce", "Cybersecurity", "Blockchain", "Other"];
const STAGES = ["All", "Idea", "Startup", "Growth", "Scale-up", "Enterprise"];

const STAGE_COLORS: Record<string, string> = {
  Idea: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Startup: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Growth: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Scale-up": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [pages, setPages] = useState<any[]>([]);
  const [myPage, setMyPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [stage, setStage] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [all, mine] = await Promise.all([
        getAllCompanyPages(50),
        session ? getMyCompanyPage() : Promise.resolve({ success: true, page: null }),
      ]);
      if (all.success) setPages(all.pages);
      if (mine.success) setMyPage(mine.page);
      setLoading(false);
    }
    load();
  }, [session]);

  const filtered = pages.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industry === "All" || p.industry === industry;
    const matchStage = stage === "All" || p.stage === stage;
    return matchSearch && matchIndustry && matchStage;
  });

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-white py-8 px-4 sm:px-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/3 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/3 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 mb-3 uppercase tracking-widest">
              <Building2 className="w-3 h-3" /> Company Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Pakistan's Builder Companies</h1>
            <p className="text-slate-400 text-xs mt-1">Discover startups, scale-ups, and enterprises shaping the ecosystem.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {session && !myPage && (
              <Link href="/company/create"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20">
                <Plus className="w-3.5 h-3.5" /> Create Page
              </Link>
            )}
            {session && myPage && (
              <Link href={`/company/${myPage.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-black hover:bg-slate-700 transition-all">
                <Building2 className="w-3.5 h-3.5" /> My Page
              </Link>
            )}
          </div>
        </div>

        {/* My Company Banner */}
        {myPage && (
          <Link href={`/company/${myPage.slug}`}
            className="flex items-center gap-3 p-4 mb-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {myPage.logoUrl ? <img src={myPage.logoUrl} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono">Your Company Page</p>
              <p className="text-sm font-bold text-white">{myPage.name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              placeholder="Search companies..." />
          </div>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-all">
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-all">
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest font-mono">Loading companies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#1d2226] border border-[#38434f] rounded-xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white text-xs font-bold uppercase tracking-wider">No Companies Found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {session ? "Be the first to create a company page." : "Sign in to create the first company page."}
            </p>
            {session && !myPage && (
              <Link href="/company/create" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">
                <Plus className="w-3.5 h-3.5" /> Create First Page
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => (
              <Link key={company.id} href={`/company/${company.slug}`}
                className="bg-[#1d2226] border border-[#38434f] rounded-xl p-5 hover:border-emerald-500/30 transition-all group flex flex-col">
                {/* Logo + name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-emerald-500/20 transition-all">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{company.name}</h3>
                      {company.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{company.tagline}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${STAGE_COLORS[company.stage] || STAGE_COLORS.Startup}`}>
                    {company.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[9px] font-bold text-slate-400">{company.industry}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[9px] font-bold text-slate-400 flex items-center gap-1"><Users className="w-2.5 h-2.5" />{company.companySize}</span>
                </div>

                {/* Specialties preview */}
                {company.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {company.specialties.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[9px] text-slate-500 bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {company.specialties.length > 3 && <span className="text-[9px] text-slate-600">+{company.specialties.length - 3}</span>}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                  {company.headquarters && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="w-3 h-3" />{company.headquarters}</span>
                  )}
                  <span className="text-[10px] text-emerald-400 font-bold ml-auto flex items-center gap-1">
                    View Page <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
