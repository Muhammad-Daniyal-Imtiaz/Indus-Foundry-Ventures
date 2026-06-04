"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase, Search, MapPin, DollarSign, Zap, Plus, Loader2,
  AlertCircle, Building2, Clock, Users, Filter, X,
  ChevronDown, Tag, Sparkles, Globe, CheckCircle2, Edit,
  Calendar, SlidersHorizontal, BookmarkCheck
} from "lucide-react";
import { getAllJobs, getMyApplications } from "@/app/actions/jobs";
import { getMyCompanyPages } from "@/app/actions/company";
import EasyApplyModal from "@/components/EasyApplyModal";
import PostJobModal from "@/components/PostJobModal";

const INDUSTRIES = ["All", "AI", "SaaS", "Fintech", "Robotics", "Semiconductors", "EdTech", "HealthTech", "AgriTech", "CleanTech", "E-commerce", "Cybersecurity", "Blockchain", "Other"];
const EXP_LEVELS = ["All", "Entry", "Mid", "Senior", "Lead", "Executive"];
const EMP_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const LOC_TYPES = ["All", "On-site", "Remote", "Hybrid"];
const POSTED_RANGES = ["All", "Last 24 hours", "Last 7 days", "Last 30 days"];

const EXP_COLORS: Record<string, string> = {
  Entry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Mid: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Senior: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Lead: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Executive: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const LOC_ICONS: Record<string, React.ReactNode> = {
  Remote: <Globe className="w-3 h-3" />,
  "On-site": <MapPin className="w-3 h-3" />,
  Hybrid: <MapPin className="w-3 h-3" />,
};

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [myCompanies, setMyCompanies] = useState<any[]>([]);
  const [myApplicationsList, setMyApplicationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [expLevel, setExpLevel] = useState("All");
  const [empType, setEmpType] = useState("All");
  const [locType, setLocType] = useState("All");
  const [postedRange, setPostedRange] = useState("All");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // View tabs
  const [viewFilter, setViewFilter] = useState<"all" | "mine" | "applied">("all");

  const [applyJob, setApplyJob] = useState<any>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [jobsRes, companyRes, appsRes] = await Promise.all([
        getAllJobs(),
        session ? getMyCompanyPages() : Promise.resolve({ success: true, pages: [] }),
        session ? getMyApplications() : Promise.resolve({ success: true, applications: [] }),
      ]);
      if (jobsRes.success) {
        setJobs(jobsRes.jobs);
        if (jobsRes.jobs.length > 0) setSelectedJob(jobsRes.jobs[0]);
      }
      if (companyRes.success) setMyCompanies(companyRes.pages || []);
      if (appsRes.success) setMyApplicationsList(appsRes.applications || []);
      setLoading(false);
    }
    load();
  }, [session]);

  const myCompanyIds = myCompanies.map(c => c.id);
  const appliedJobIds = new Set(myApplicationsList.map((a: any) => a.app?.jobId));

  const postedByMeJobs = jobs.filter(j => myCompanyIds.includes(j.companyPageId));
  const appliedJobsData = myApplicationsList
    .filter((a: any) => a.job)
    .map((a: any) => ({ ...a.job, applicationStatus: a.app?.status, appliedAt: a.app?.createdAt }));

  const filtered = (viewFilter === "all" ? jobs : viewFilter === "mine" ? postedByMeJobs : appliedJobsData).filter((j: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) ||
      j.companyName?.toLowerCase().includes(q) ||
      (j.skills && Array.isArray(j.skills) && j.skills.some((s: string) => typeof s === "string" && s.toLowerCase().includes(q))) ||
      j.location?.toLowerCase().includes(q);
    const matchIndustry = industry === "All" || j.industry === industry;
    const matchExp = expLevel === "All" || j.experienceLevel === expLevel;
    const matchEmp = empType === "All" || j.employmentType === empType;
    const matchLoc = locType === "All" || j.locationType === locType;

    let matchPosted = true;
    if (postedRange !== "All" && j.createdAt) {
      const days = postedRange === "Last 24 hours" ? 1 : postedRange === "Last 7 days" ? 7 : 30;
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();
      matchPosted = j.createdAt >= cutoff;
    }

    let matchSalary = true;
    if (salaryMin && j.salaryMax) matchSalary = j.salaryMax >= parseInt(salaryMin);
    if (matchSalary && salaryMax && j.salaryMin) matchSalary = j.salaryMin <= parseInt(salaryMax);

    let matchSkill = true;
    if (skillFilter && j.skills?.length) {
      matchSkill = j.skills.some((s: string) => s.toLowerCase().includes(skillFilter.toLowerCase()));
    }

    return matchSearch && matchIndustry && matchExp && matchEmp && matchLoc && matchPosted && matchSalary && matchSkill;
  });

  const activeFilters = [industry, expLevel, empType, locType, postedRange].filter((f) => f !== "All").length +
    (salaryMin ? 1 : 0) + (salaryMax ? 1 : 0) + (skillFilter ? 1 : 0);
  const clearFilters = () => {
    setIndustry("All"); setExpLevel("All"); setEmpType("All"); setLocType("All");
    setPostedRange("All"); setSalaryMin(""); setSalaryMax(""); setSkillFilter(""); setSearch("");
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-white overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/3 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-500/3 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-[9px] font-black border border-teal-500/20 mb-3 uppercase tracking-widest">
              <Briefcase className="w-3 h-3" /> Jobs & Placements
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Find Your Next Role</h1>
            <p className="text-slate-400 text-xs mt-1">
              {loading ? "Loading..." : `${viewFilter === "applied" ? myApplicationsList.length : viewFilter === "mine" ? postedByMeJobs.length : jobs.length} open ${jobs.length === 1 ? "position" : "positions"} across Pakistan's deep-tech ecosystem`}
            </p>
          </div>
          {session && (
            <button
              onClick={() => setPostModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-teal-500/20 shrink-0">
              <Plus className="w-3.5 h-3.5" /> Post a Job
            </button>
          )}
        </div>

        {/* View Tabs */}
        {session && (
          <div className="flex items-center gap-1 mb-5 bg-[#1d2226] p-1 rounded-lg border border-[#38434f] w-fit">
            {[
              { key: "all" as const, label: "All Jobs", icon: Briefcase },
              { key: "mine" as const, label: "Posted by Me", icon: Edit },
              { key: "applied" as const, label: "Applied Jobs", icon: BookmarkCheck },
            ].map(tab => (
              <button key={tab.key} onClick={() => setViewFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewFilter === tab.key
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.key === "applied" && myApplicationsList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[8px] font-black flex items-center justify-center">{myApplicationsList.length}</span>
                )}
                {tab.key === "mine" && postedByMeJobs.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[8px] font-black flex items-center justify-center">{postedByMeJobs.length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1d2226] border border-[#38434f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/10 transition-all"
              placeholder={viewFilter === "applied" ? "Search your applications..." : "Search roles, companies, skills, locations..."} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${showFilters ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-[#1d2226] border-[#38434f] text-slate-400 hover:text-white"}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[9px] font-black flex items-center justify-center">{activeFilters}</span>}
          </button>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 bg-[#1d2226] border border-[#38434f] rounded-xl space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Industry", value: industry, set: setIndustry, options: INDUSTRIES },
                    { label: "Experience", value: expLevel, set: setExpLevel, options: EXP_LEVELS },
                    { label: "Type", value: empType, set: setEmpType, options: EMP_TYPES },
                    { label: "Location", value: locType, set: setLocType, options: LOC_TYPES },
                  ].map(({ label, value, set, options }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <select value={value} onChange={(e) => set(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40 transition-all">
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-teal-400 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {showAdvanced ? "Hide" : "Show"} Advanced Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Posted Within</label>
                          <select value={postedRange} onChange={(e) => setPostedRange(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40 transition-all">
                            {POSTED_RANGES.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Salary</label>
                          <input type="number" placeholder="e.g. 50000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Salary</label>
                          <input type="number" placeholder="e.g. 500000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Skill</label>
                          <input placeholder="e.g. Python, React" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400 mb-3" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest font-mono">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#1d2226] border border-[#38434f] rounded-xl">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white text-xs font-bold uppercase tracking-wider">
              {viewFilter === "mine" ? "No Jobs Posted Yet" : viewFilter === "applied" ? "No Applications Yet" : "No Jobs Found"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">
              {viewFilter === "mine" ? "Post your first job opening." : viewFilter === "applied" ? "Start applying to jobs in the deep-tech ecosystem." : "Try adjusting your filters."}
            </p>
            <button onClick={clearFilters} className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

            {/* Left: Job List */}
            <div className="lg:col-span-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono px-1 mb-3">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
              {filtered.map((job: any) => {
                const isMine = myCompanyIds.includes(job.companyPageId);
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedJob?.id === job.id ? "bg-teal-500/5 border-teal-500/30" : "bg-[#1d2226] border-[#38434f] hover:border-teal-500/20 hover:bg-[#22282d]"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{job.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{job.companyName} {job.department && <span className="text-slate-600">·</span>} {job.department}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${EXP_COLORS[job.experienceLevel] || EXP_COLORS.Mid}`}>{job.experienceLevel}</span>
                          <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-semibold">{LOC_ICONS[job.locationType]}{job.locationType}</span>
                          {job.applicationStatus && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              job.applicationStatus === "Applied" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              job.applicationStatus === "Shortlisted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              "bg-slate-800 text-slate-400 border-white/10"
                            }`}>{job.applicationStatus}</span>
                          )}
                          {isMine && <span className="px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] font-bold">Owner</span>}
                          {job.isFeatured && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold">Featured</span>}
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <p className="text-[9px] text-emerald-400 font-bold mt-1">
                            {job.salaryCurrency} {job.salaryMin?.toLocaleString()}{job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : "+"}/{job.salaryPeriod === "Monthly" ? "mo" : "yr"}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Job Detail */}
            <div className="lg:col-span-8 sticky top-[76px]">
              <AnimatePresence mode="wait">
                {selectedJob && (
                  <motion.div
                    key={selectedJob.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="bg-[#1d2226] border border-[#38434f] rounded-xl overflow-hidden"
                  >
                    {/* Detail Header */}
                    <div className="p-6 border-b border-white/5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {selectedJob.companyLogo ? (
                            <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                          ) : (
                            <Building2 className="w-7 h-7 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-black text-white">{selectedJob.title}</h2>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            {selectedJob.companySlug ? (
                              <Link href={`/company/${selectedJob.companySlug}`} className="text-sm text-teal-400 font-bold hover:underline">{selectedJob.companyName}</Link>
                            ) : (
                              <span className="text-sm text-slate-400 font-bold">{selectedJob.companyName}</span>
                            )}
                            {selectedJob.department && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="text-xs text-slate-400 font-semibold">{selectedJob.department}</span>
                              </>
                            )}
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-500">{selectedJob.industry}</span>
                          </div>
                        </div>
                        {selectedJob.isFeatured && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider shrink-0">Featured</span>
                        )}
                      </div>

                      {/* Meta pills */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${EXP_COLORS[selectedJob.experienceLevel] || EXP_COLORS.Mid}`}>
                          {selectedJob.experienceLevel}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold">
                          <Briefcase className="w-3 h-3" />{selectedJob.employmentType}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-bold">
                          {LOC_ICONS[selectedJob.locationType]}{selectedJob.locationType} · {selectedJob.location}
                        </span>
                        {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            <DollarSign className="w-3 h-3" />
                            {selectedJob.salaryCurrency} {selectedJob.salaryMin?.toLocaleString()}{selectedJob.salaryMax ? `–${selectedJob.salaryMax.toLocaleString()}` : "+"} / {selectedJob.salaryPeriod}
                          </span>
                        )}
                        {selectedJob.applicationDeadline && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Closes {selectedJob.applicationDeadline}
                          </span>
                        )}
                        {selectedJob.applicationStatus && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                            selectedJob.applicationStatus === "Applied" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            selectedJob.applicationStatus === "Shortlisted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-slate-800 text-slate-400 border-white/10"
                          }`}>
                            <BookmarkCheck className="w-3 h-3" /> {selectedJob.applicationStatus}
                          </span>
                        )}
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-3">
                        {myCompanyIds.includes(selectedJob.companyPageId) ? (
                          <button
                            onClick={() => { setEditJob(selectedJob); setPostModalOpen(true); }}
                            className="flex-1 sm:flex-none sm:px-8 py-2.5 rounded-xl bg-slate-800 border border-white/10 hover:border-teal-500/30 text-slate-300 hover:text-teal-400 text-sm font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit Job
                          </button>
                        ) : (
                          <button
                            onClick={() => !selectedJob.hasApplied && !selectedJob.applicationStatus && setApplyJob(selectedJob)}
                            disabled={selectedJob.hasApplied || !!selectedJob.applicationStatus}
                            className={`flex-1 sm:flex-none sm:px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                              selectedJob.hasApplied || selectedJob.applicationStatus
                                ? "bg-slate-800 text-teal-400 border border-teal-500/30 cursor-not-allowed"
                                : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20"
                            }`}>
                            {selectedJob.hasApplied || selectedJob.applicationStatus ? (
                              <><CheckCircle2 className="w-4 h-4" /> Applied</>
                            ) : (
                              <><Zap className="w-4 h-4 fill-current" /> Easy Apply</>
                            )}
                          </button>
                        )}
                        {selectedJob.companySlug && (
                          <Link href={`/company/${selectedJob.companySlug}`}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-white/10 hover:border-teal-500/30 text-slate-300 text-xs font-bold hover:text-teal-400 transition-all flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> View Company
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-600 font-semibold">
                        <span>{selectedJob.applicationsCount} applicants</span>
                        <span>{selectedJob.viewsCount} views</span>
                      </div>
                    </div>

                    {/* Detail Body */}
                    <div className="p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">About this Role</h4>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                      </div>

                      {selectedJob.skills?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.skills.map((s: string) => (
                              <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedJob.requirements?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Requirements</h4>
                          <ul className="space-y-2">
                            {selectedJob.requirements.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJob.benefits?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Benefits & Perks</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.benefits.map((b: string) => (
                              <span key={b} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400 font-semibold">✓ {b}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {applyJob && (
        <EasyApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            setSelectedJob((prev: any) => prev?.id === applyJob.id ? { ...prev, hasApplied: true } : prev);
            setJobs((prev: any[]) => prev.map((j) => j.id === applyJob.id ? { ...j, hasApplied: true } : j));
          }}
        />
      )}
      {postModalOpen && (
        <PostJobModal
          onClose={() => { setPostModalOpen(false); setEditJob(null); }}
          onCreated={(job) => {
            if (editJob) {
              setJobs((prev) => prev.map((j) => j.id === job.id ? job : j));
            } else {
              setJobs((prev) => [job, ...prev]);
            }
            setSelectedJob(job);
            setPostModalOpen(false);
            setEditJob(null);
          }}
          companies={myCompanies}
          editJob={editJob}
        />
      )}
    </div>
  );
}
