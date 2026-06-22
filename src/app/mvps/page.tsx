"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  TrendingUp,
  ShieldCheck,
  Plus,
  X,
  Activity,
  Laptop,
  Filter,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMvps, createMvp } from "@/app/actions/mvps";

interface MVP {
  id: string;
  title: string;
  tagline: string;
  category: string;
  reason: string;
  askingPrice: string;
  revenue: string;
  users: string;
  techStack: string[];
  repoVerified: boolean;
  ownershipVerified: boolean;
  githubStars: number;
  screenshot?: string | null;
  productDescription: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  githubRepo?: string | null;
  createdAt?: string | null;
}

const initialMVPs: MVP[] = [
  {
    id: "mvp-1",
    title: "AgriFlow AI",
    tagline: "Satellite crop-disease diagnostics tailored for Punjab crop yields.",
    category: "AI tools",
    reason: "no time",
    askingPrice: "$1,800",
    revenue: "$150/mo",
    users: "420 active",
    techStack: ["Next.js", "Python", "FastAPI", "PyTorch"],
    repoVerified: true,
    ownershipVerified: true,
    githubStars: 84,
    screenshot: "https://images.unsplash.com/photo-1625246373972-1033cd00cd6c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    productDescription: "Fully working model analyzing cotton crop yields from satellite images. Built over 6 months, but cofounders got remote jobs.",
    userId: "demo",
    userName: "Demo User",
    userRole: "Founder",
    userAvatar: "",
    githubRepo: ""
  },
  {
    id: "mvp-2",
    title: "ChaiCodes",
    tagline: "VS Code extension that replaces console.log with custom urdu comments.",
    category: "Chrome extensions",
    reason: "changed idea",
    askingPrice: "Open to Offers",
    revenue: "$0/mo",
    users: "1,200 downloads",
    techStack: ["TypeScript", "ESBuild", "VSCode API"],
    repoVerified: true,
    ownershipVerified: true,
    githubStars: 142,
    screenshot: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    productDescription: "Viral extension with steady downloads. Intended to build a paid tier but pivot to semiconductor hardware design.",
    userId: "demo",
    userName: "Demo User",
    userRole: "Founder",
    userAvatar: "",
    githubRepo: ""
  },
  {
    id: "mvp-3",
    title: "HisaabKitaab SaaS",
    tagline: "Micro-ERP and ledger sync for local shopkeepers and retail chains.",
    category: "SaaS MVPs",
    reason: "wants a cofounder",
    askingPrice: "$4,500",
    revenue: "$620/mo",
    users: "85 shops",
    techStack: ["React Native", "Node.js", "PostgreSQL"],
    repoVerified: false,
    ownershipVerified: true,
    githubStars: 0,
    screenshot: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    productDescription: "Generating real retail revenue. Need capital or a technical cofounder to take over sales or scale the mobile framework.",
    userId: "demo",
    userName: "Demo User",
    userRole: "Founder",
    userAvatar: "",
    githubRepo: ""
  },
  {
    id: "mvp-4",
    title: "DevDoc-PK",
    tagline: "Internal tool translating English technical docs into local dialects in real-time.",
    category: "Internal tools",
    reason: "wants acquisition",
    askingPrice: "$2,200",
    revenue: "$0/mo",
    users: "18 teams",
    techStack: ["SvelteKit", "TailwindCSS", "Groq AI"],
    repoVerified: true,
    ownershipVerified: true,
    githubStars: 56,
    screenshot: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    productDescription: "Used internally by two PITB-incubated startups. Beautiful UI but requires focus that we cannot commit due to university thesis.",
    userId: "demo",
    userName: "Demo User",
    userRole: "Founder",
    userAvatar: "",
    githubRepo: ""
  }
];

const parsePrice = (price: string): number | null => {
  const cleaned = price.replace(/[$,]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export default function MVPMarketplace() {
  const [mvps, setMvps] = useState<MVP[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedReason, setSelectedReason] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [inquireMvp, setInquireMvp] = useState<MVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [mvpsCursor, setMvpsCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMvps, setHasMoreMvps] = useState(true);

  // Listing Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newCategory, setNewCategory] = useState("SaaS MVPs");
  const [newReason, setNewReason] = useState("no time");
  const [newPrice, setNewPrice] = useState("");
  const [newRevenue, setNewRevenue] = useState("");
  const [newUsers, setNewUsers] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryOffer, setInquiryOffer] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const categories = [
    "All",
    "SaaS MVPs",
    "Browser apps",
    "Mobile apps",
    "AI tools",
    "Internal tools",
    "Chrome extensions",
    "No-code products",
    "Web apps with revenue",
    "Apps with unused codebases"
  ];

  const reasons = [
    "All",
    "no time",
    "changed idea",
    "wants a cofounder",
    "wants acquisition",
    "wants to raise instead of sell"
  ];

  // Fetch MVPs from DB on mount
  useEffect(() => {
    const fetchMvps = async () => {
      try {
        const result = await getMvps(3);
        if (result.success && result.mvps && result.mvps.length > 0) {
          setMvps(result.mvps as MVP[]);
          setMvpsCursor(result.nextCursor ?? null);
          setHasMoreMvps(result.hasMore ?? false);
        } else {
          setMvps(initialMVPs);
          setHasMoreMvps(false);
        }
      } catch (e) {
        console.error("Failed to fetch MVPs:", e);
        setMvps(initialMVPs);
        setHasMoreMvps(false);
      } finally {
        setLoading(false);
      }
    };
    fetchMvps();
  }, []);

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedReason !== "All" ? 1 : 0) +
    (priceMin !== "" ? 1 : 0) +
    (priceMax !== "" ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedReason("All");
    setPriceMin("");
    setPriceMax("");
    setSortOrder("newest");
  };

  const loadMoreMvps = async () => {
    if (!mvpsCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getMvps(3, mvpsCursor);
      if (result.success && result.mvps) {
        setMvps(prev => [...prev, ...(result.mvps as MVP[])]);
        setMvpsCursor(result.nextCursor ?? null);
        setHasMoreMvps(result.hasMore ?? false);
      }
    } catch (e) {
      console.error("Failed to load more MVPs:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleListMvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTagline) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("tagline", newTagline);
      formData.append("category", newCategory);
      formData.append("reason", newReason);
      formData.append("askingPrice", newPrice || "Open for Offers");
      formData.append("revenue", newRevenue || "$0/mo");
      formData.append("users", newUsers || "Prototype stage");
      formData.append("githubRepo", repoLink || "");
      formData.append("techStack", newTech || "");
      formData.append("productDescription", newDesc || "No description provided.");

      const result = await createMvp(formData);
      if (result.success && result.mvp) {
        setMvps([result.mvp as MVP, ...mvps]);
      }
      setShowListModal(false);

      // Reset form
      setNewTitle("");
      setNewTagline("");
      setNewPrice("");
      setNewRevenue("");
      setNewUsers("");
      setNewTech("");
      setNewDesc("");
      setRepoLink("");
    } catch (e) {
      console.error("Failed to create MVP:", e);
      alert("Failed to list your MVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquireMvp(null);
      setInquirySent(false);
      setInquiryName("");
      setInquiryEmail("");
      setInquiryOffer("");
    }, 2000);
  };

  const filteredMVPs = mvps
    .filter(m => {
      const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
      const matchesReason = selectedReason === "All" || m.reason === selectedReason;
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const mPrice = parsePrice(m.askingPrice);
      const minVal = parseFloat(priceMin);
      const maxVal = parseFloat(priceMax);
      const matchesMin = priceMin === "" || (mPrice !== null && !isNaN(minVal) && mPrice >= minVal);
      const matchesMax = priceMax === "" || (mPrice !== null && !isNaN(maxVal) && mPrice <= maxVal);

      return matchesCategory && matchesReason && matchesSearch && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? -diff : diff;
      }
      if (a.createdAt) return sortOrder === "newest" ? -1 : 1;
      if (b.createdAt) return sortOrder === "newest" ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading MVPs...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-12 px-6 bg-grid-pattern overflow-hidden">
      {/* Patriotic Tech Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/6 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/5 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Page Banner */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a86b]/10 text-[#00a86b] font-mono text-[10px] font-bold border border-[#00a86b]/20 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Codebase Arena
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase">HEC Verified Sandbox</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                MVP <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Marketplace</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed font-semibold">
                Pakistan's premier trust-driven marketplace. Acquire working codebases, discover pre-verified product traction, or buy ready-to-scale assets listed directly by verified developers.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowListModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/15 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                List Your MVP
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filtration Panels */}
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center mb-4">
            {/* Search bar */}
            <div className="lg:col-span-3 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search MVP name, keywords, or tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0c111d] border border-white/5 focus:border-emerald-500/30 text-white text-xs px-10 py-3.5 rounded-xl outline-none transition-all placeholder:text-slate-500 font-semibold"
              />
            </div>

            {/* Filter Toggle */}
            <div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0c111d] border border-white/5 hover:border-emerald-500/30 text-white text-xs px-4 py-3.5 rounded-xl outline-none transition-all cursor-pointer font-bold"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-[9px] font-black text-slate-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0c111d] border border-white/5 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white text-xs px-4 py-3 rounded-xl outline-none transition-all cursor-pointer font-bold"
                    >
                      <option disabled>Filter by Category</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sale Reason</label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white text-xs px-4 py-3 rounded-xl outline-none transition-all cursor-pointer font-bold"
                    >
                      <option disabled>Filter by Reason for Sale</option>
                      {reasons.map(r => (
                        <option key={r} value={r}>{r === "All" ? "All Reasons" : `Sale Reason: ${r}`}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Min */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Min Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white text-xs px-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-500 font-bold"
                    />
                  </div>

                  {/* Price Max */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Max Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white text-xs px-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-500 font-bold"
                    />
                  </div>

                  {/* Sort + Clear */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#05070c] border border-white/5 hover:border-emerald-500/30 text-white text-[10px] px-3 py-3 rounded-xl outline-none transition-all cursor-pointer font-bold uppercase tracking-wider"
                    >
                      {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                    </button>
                    <button
                      onClick={clearFilters}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] px-3 py-3 rounded-xl outline-none transition-all cursor-pointer font-bold uppercase tracking-wider"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Grid */}
        {filteredMVPs.length === 0 ? (
          <div className="text-center py-20 bg-[#0c111d]/50 border border-white/5 rounded-3xl">
            <Laptop className="w-12 h-12 mx-auto text-slate-600 mb-3 animate-pulse" />
            <h3 className="text-md font-bold text-white uppercase tracking-wider">No matching MVPs</h3>
            <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or choosing a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMVPs.map((m) => (
              <div
                key={m.id}
                className="bg-[#0c111d] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Background Accent glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/3 blur-[35px] pointer-events-none group-hover:bg-emerald-500/8 transition-all"></div>

                <div>
                  {/* Top Stats bar */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                          {m.category}
                        </span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-tight">
                          Reason: {m.reason}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 group-hover:text-emerald-400 transition-all uppercase tracking-wide">
                        {m.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Asking Price</p>
                      <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">{m.askingPrice}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-4">
                    {m.tagline}
                  </p>

                  {/* Screenshot mockup */}
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border border-white/5 relative">
                    <img
                      src={m.screenshot || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>

                    {/* Verification Badges inside Screenshot */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                      {m.ownershipVerified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 shadow">
                          <ShieldCheck className="w-3 h-3 stroke-[3.5]" />
                          OWNER VERIFIED
                        </span>
                      )}
                      {m.repoVerified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded bg-blue-500 text-white shadow">
                          <GitBranch className="w-3 h-3" />
                          REPO PROOF {m.githubStars > 0 && `★${m.githubStars}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Metrics Panel */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 border border-white/5 rounded-xl mb-4 text-[10.5px]">
                    <div>
                      <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider">Traction / Users</span>
                      <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        {m.users}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono text-[9px] uppercase tracking-wider">Monthly Revenue</span>
                      <span className="font-extrabold text-white flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        {m.revenue}
                      </span>
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {m.techStack.map(t => (
                      <span key={t} className="text-[9.5px] font-mono font-bold text-slate-500 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold">Assisted Escrow Transfers Supported</span>
                  <button
                    onClick={() => setInquireMvp(m)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-950 bg-white group-hover:bg-emerald-400 group-hover:text-slate-950 hover:scale-102 px-3.5 py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Acquire Product
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show More MVPs */}
        {hasMoreMvps && filteredMVPs.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMoreMvps}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl bg-[#0c111d] border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Show More"
              )}
            </button>
          </div>
        )}
      </div>

      {/* MODAL: List Your MVP */}
      <AnimatePresence>
        {showListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowListModal(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-xl w-full bg-[#0c111d] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">List Your Working MVP</h3>
                <button onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleListMvp} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AgriFlow AI"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">One-line Pitch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Satellites diagnostics for high crop yield."
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all cursor-pointer"
                    >
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Reason for Sale</label>
                    <select
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all cursor-pointer"
                    >
                      {reasons.filter(r => r !== "All").map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Asking Price ($)</label>
                    <input
                      type="text"
                      placeholder="e.g. $1,500 or Offers"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Monthly Revenue ($)</label>
                    <input
                      type="text"
                      placeholder="e.g. $200/mo"
                      value={newRevenue}
                      onChange={(e) => setNewRevenue(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Traction / Users</label>
                    <input
                      type="text"
                      placeholder="e.g. 150 active"
                      value={newUsers}
                      onChange={(e) => setNewUsers(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Verified GitHub Repository (Optional for Repo Proof)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://github.com/username/project"
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg pl-10 p-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, Python"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how it works, active databases, assets included (domain, hosting details)..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block mb-0.5">Trust & Escrow Verification</span>
                    By listing, you agree to grant codebase check read-access to PITB developers for assisted custody transfer terms if needed.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Listing MVP..." : "Confirm and List MVP"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Acquire MVP Inquiry */}
      <AnimatePresence>
        {inquireMvp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setInquireMvp(null)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-[#0c111d] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              {inquirySent ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Inquiry Sent Successfully!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    We have notified the owner of <span className="text-emerald-400 font-bold">{inquireMvp.title}</span>. Our escrow agents will contact you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                        Acquisition Request
                      </span>
                      <h3 className="text-lg font-black text-white mt-1.5 uppercase tracking-wide">Acquire {inquireMvp.title}</h3>
                    </div>
                    <button onClick={() => setInquireMvp(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Summary card */}
                  <div className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl mb-5 text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-extrabold text-white">{inquireMvp.tagline}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">Asking Price: <span className="text-emerald-400 font-bold">{inquireMvp.askingPrice}</span></p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSendInquiry} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Daniyal Imtiaz"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Your Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. daniyal@example.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Offer / Message to Seller</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your offer amount, or outline your interest in taking over the product codebase..."
                        value={inquiryOffer}
                        onChange={(e) => setInquiryOffer(e.target.value)}
                        className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-lg p-2.5 outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2 text-[10px] leading-relaxed text-slate-400 font-medium">
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-bold block mb-0.5">Assisted Custody Transfer</span>
                        Our team facilitates secure GitHub repositories, DNS transfers, Stripe/retail account custody migration, and optional escrow setups.
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Submit Acquisition Proposal
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
