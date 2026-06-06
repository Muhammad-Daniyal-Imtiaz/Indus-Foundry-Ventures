"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Briefcase, MapPin, DollarSign, Building2, Loader2,
  Filter, X, ChevronDown, Globe, Zap, Sparkles, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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

const INDUSTRIES = ["All", "AI", "SaaS", "Fintech", "Robotics", "Semiconductors", "EdTech", "HealthTech", "AgriTech", "CleanTech", "E-commerce", "Cybersecurity", "Blockchain", "Other"];
const EXP_LEVELS = ["All", "Entry", "Mid", "Senior", "Lead", "Executive"];
const EMP_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const LOC_TYPES = ["All", "On-site", "Remote", "Hybrid"];

interface Filters {
  industry: string;
  experienceLevel: string;
  employmentType: string;
  locationType: string;
  salaryMin: string;
  salaryMax: string;
}

interface JobResult {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  companySlug: string | null;
  companyPageId: string | null;
  location: string;
  locationType: string;
  employmentType: string;
  experienceLevel: string;
  industry: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  isFeatured: boolean;
  createdAt: string;
}

export default function JobSearchInfinite() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    industry: "All",
    experienceLevel: "All",
    employmentType: "All",
    locationType: "All",
    salaryMin: "",
    salaryMax: "",
  });
  const [results, setResults] = useState<JobResult[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = useCallback(async (searchQuery: string, pageCursor?: string, append: boolean = false) => {
    if (!searchQuery.trim()) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    const params = new URLSearchParams({ q: searchQuery, pageSize: "20" });
    if (filters.industry && filters.industry !== "All") params.set("industry", filters.industry);
    if (filters.experienceLevel && filters.experienceLevel !== "All") params.set("experienceLevel", filters.experienceLevel);
    if (filters.employmentType && filters.employmentType !== "All") params.set("employmentType", filters.employmentType);
    if (filters.locationType && filters.locationType !== "All") params.set("locationType", filters.locationType);
    if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);
    if (filters.salaryMax) params.set("salaryMax", filters.salaryMax);
    if (pageCursor) params.set("cursor", pageCursor);

    try {
      const api = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL || "/api/jobs/search";
      const res = await fetch(`${api}?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (append) {
        setResults(prev => [...prev, ...data.jobs]);
      } else {
        setResults(data.jobs);
      }
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    if (debouncedQuery) {
      setResults([]);
      setCursor(null);
      setHasMore(false);
      executeSearch(debouncedQuery);
    }
  }, [debouncedQuery, executeSearch]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        executeSearch(debouncedQuery, cursor ?? undefined, true).finally(() => setLoadingMore(false));
      }
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, cursor, loadingMore, debouncedQuery, executeSearch]);

  const activeFilters = [filters.industry, filters.experienceLevel, filters.employmentType, filters.locationType]
    .filter(f => f !== "All").length + (filters.salaryMin ? 1 : 0) + (filters.salaryMax ? 1 : 0);

  const clearFilters = () => {
    setFilters({ industry: "All", experienceLevel: "All", employmentType: "All", locationType: "All", salaryMin: "", salaryMax: "" });
    setQuery("");
  };

  const SkeletonCard = () => (
    <div className="p-4 rounded-xl bg-[#1d2226] border border-[#38434f] animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-3/4" />
          <div className="h-2.5 bg-slate-800/60 rounded w-1/2" />
          <div className="flex gap-2 mt-2">
            <div className="h-4 bg-slate-800 rounded w-14" />
            <div className="h-4 bg-slate-800 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1d2226] border border-[#38434f] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/10 transition-all"
            placeholder="Search roles, companies, skills, locations..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
            showFilters
              ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
              : "bg-[#1d2226] border-[#38434f] text-slate-400 hover:text-white"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all shrink-0"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

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
                  { label: "Industry", value: filters.industry, key: "industry" as const, options: INDUSTRIES },
                  { label: "Experience", value: filters.experienceLevel, key: "experienceLevel" as const, options: EXP_LEVELS },
                  { label: "Type", value: filters.employmentType, key: "employmentType" as const, options: EMP_TYPES },
                  { label: "Location", value: filters.locationType, key: "locationType" as const, options: LOC_TYPES },
                ].map(({ label, value, key, options }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <select
                      value={value}
                      onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40 transition-all"
                    >
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Salary</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Salary</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !debouncedQuery ? (
        <div className="text-center py-20 bg-[#1d2226] border border-[#38434f] rounded-xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white text-xs font-bold uppercase tracking-wider">Search Jobs</p>
          <p className="text-[11px] text-slate-500 mt-1">Type a keyword to find your next role.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-[#1d2226] border border-[#38434f] rounded-xl">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white text-xs font-bold uppercase tracking-wider">No Jobs Found</p>
          <p className="text-[11px] text-slate-500 mt-1 mb-4">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">Clear filters</button>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono px-1 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {results.map((job) => (
              <Link
                key={job.id}
                href={`/jobs#${job.id}`}
                className="block p-4 rounded-xl bg-[#1d2226] border border-[#38434f] hover:border-teal-500/20 hover:bg-[#22282d] transition-all"
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
                    <p className="text-[10px] text-slate-500 truncate">{job.companyName}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${EXP_COLORS[job.experienceLevel] || EXP_COLORS.Mid}`}>
                        {job.experienceLevel}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-semibold">
                        {LOC_ICONS[job.locationType]}{job.locationType}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-semibold">
                        <Briefcase className="w-3 h-3" />{job.employmentType}
                      </span>
                      {job.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold">Featured</span>
                      )}
                    </div>
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {job.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] font-bold">
                            {s}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[9px] font-semibold">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <p className="text-[9px] text-emerald-400 font-bold mt-1.5">
                        <DollarSign className="w-2.5 h-2.5 inline -ml-0.5" />
                        {job.salaryCurrency} {job.salaryMin?.toLocaleString()}{job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : "+"}/{job.salaryPeriod === "Monthly" ? "mo" : "yr"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {loadingMore && (
            <div className="space-y-2 mt-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {hasMore && <div ref={sentinelRef} className="h-4" />}

          {!hasMore && results.length > 0 && (
            <p className="text-center text-[10px] text-slate-600 font-semibold py-6 font-mono uppercase tracking-widest">
              All results loaded
            </p>
          )}
        </>
      )}
    </div>
  );
}
