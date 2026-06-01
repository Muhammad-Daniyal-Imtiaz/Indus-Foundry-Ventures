"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getPosts, createPost } from "@/app/actions/posts";
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  Cpu,
  UserCheck,
  Check,
  Sliders,
  X,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  MessageSquare,
  Bookmark,
  Calendar,
  Loader2,
  Trash2
} from "lucide-react";

import { buildersData, Builder, startupCategories, allFlatCategories } from "../data";

export default function TeamsPage() {
  const { data: session, status: authStatus } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"matching" | "feed">("matching");

  // Posts / Feed states
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("Idea");
  const [postImages, setPostImages] = useState<string[]>([]); // Base64 strings
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState("");
  const [showPostSuccess, setShowPostSuccess] = useState(false);

  // Fetch posts on mount / when feed tab opens
  useEffect(() => {
    async function loadFeed() {
      setLoadingPosts(true);
      try {
        const res = await getPosts();
        if (res.success && res.posts) {
          setPostsList(res.posts);
        }
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadFeed();
  }, [activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 3); // Max 3
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64s => {
      setPostImages(prev => [...prev, ...base64s].slice(0, 3));
    });
  };

  const handleRemoveImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setPostError("Please write a title and content for your post.");
      return;
    }

    setIsSubmittingPost(true);
    setPostError("");

    try {
      const formData = new FormData();
      formData.append("title", postTitle);
      formData.append("content", postContent);
      formData.append("category", postCategory);
      formData.append("images", JSON.stringify(postImages));

      const res = await createPost(formData);
      if (res.success && res.post) {
        setShowPostSuccess(true);
        // Prepend new post
        setPostsList(prev => [res.post, ...prev]);
        // Reset form
        setPostTitle("");
        setPostContent("");
        setPostCategory("Idea");
        setPostImages([]);
        setTimeout(() => setShowPostSuccess(false), 2000);
      } else {
        setPostError(res.error || "Failed to create post.");
      }
    } catch (err: any) {
      setPostError(err.message || "Something went wrong.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  
  // Multi-tag filters (multiple startup categories)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Chat Dialog
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [builderChatMsg, setBuilderChatMsg] = useState("");
  const [chatSuccess, setChatSuccess] = useState(false);

  // Dream Team Creator
  const [dreamTeam, setDreamTeam] = useState<string[]>([]);
  const [dreamDomain, setDreamDomain] = useState<string>("AI");
  const [teamScore, setTeamScore] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    gap: string;
  } | null>(null);

  // Filter builders based on multiple tags and search term
  const filteredBuilders = buildersData.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if the builder matches ANY of the selected tags (or if no tags are selected, matches all)
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.includes(b.field) ||
                        b.skills.some(skill => selectedTags.includes(skill));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleCofounderConnect = (builder: Builder) => {
    setSelectedBuilder(builder);
    setBuilderChatMsg(`Salam ${builder.name.split(' ')[0]}! I saw your profile on Indus Foundry Ventures. I'm building in the ${builder.field} space and would love to chat about cofounding.`);
    setChatSuccess(false);
  };

  const submitBuilderChat = () => {
    setChatSuccess(true);
    setTimeout(() => {
      setSelectedBuilder(null);
      setChatSuccess(false);
    }, 2000);
  };

  const assessDreamTeam = () => {
    if (dreamTeam.length === 0) return;
    let score = 40;
    const hasTechnical = dreamTeam.includes("Scientist") || dreamTeam.includes("Hardware") || dreamTeam.includes("Engineer");
    const hasBusiness = dreamTeam.includes("Growth") || dreamTeam.includes("Product");
    const teamSize = dreamTeam.length;

    if (hasTechnical) score += 25;
    if (hasBusiness) score += 20;
    if (teamSize >= 2 && teamSize <= 3) score += 15;
    
    let feedback = "";
    let strengths: string[] = [];
    let gap = "";

    if (dreamDomain === "Semiconductors") {
      if (!dreamTeam.includes("Hardware")) {
        score -= 20;
        gap = "Missing a VLSI / Hardware Layout Expert. Highly recommended for physical IC layout verification.";
      } else {
        strengths.push("Excellent hardware micro-architecture baseline.");
      }
      feedback = "Semiconductor ventures require heavy CapEx. Ensure your founding team has strong technical validation before pitching HEC/MoITT grants.";
    } else if (dreamDomain === "AI") {
      if (!dreamTeam.includes("Scientist")) {
        score -= 15;
        gap = "Missing a dedicated AI/ML Research Lead. Highly needed for custom weights and token optimizations.";
      } else {
        strengths.push("Solid foundation in PyTorch and Core AI model building.");
      }
      feedback = "AI SaaS startups scale quickly. Your tech expertise is vital, but don't overlook local enterprise pilot agreements.";
    } else {
      feedback = "SaaS startups are highly reliant on rapid user feedback. Keep iteration cycles short and build with modular, responsive tools.";
    }

    if (hasTechnical && hasBusiness) strengths.push("Balanced technical-commercial leadership.");
    if (teamSize > 4) {
      score -= 10;
      gap = "Founding team is too large. Dilution could hamper future VC rounds.";
    }

    setTeamScore({
      score: Math.min(score, 100),
      feedback,
      strengths: strengths.length > 0 ? strengths : ["Early roles defined"],
      gap: gap || "Looking extremely balanced! Ready to register on PITB Sandbox."
    });
  };

  const toggleRoleInDreamTeam = (role: string) => {
    if (dreamTeam.includes(role)) {
      setDreamTeam(prev => prev.filter(r => r !== role));
    } else {
      setDreamTeam(prev => [...prev, role]);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-12 px-6 bg-grid-pattern overflow-hidden">
      {/* Patriotic Tech Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/6 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-white/2 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Banner Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 mb-4">
            <Users className="w-3.5 h-3.5" />
            MODULE 01 / TEAMS
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                {activeTab === "matching" ? "Cofounder Matching" : "Foundry Hub Feed"}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-semibold leading-relaxed">
                {activeTab === "matching" 
                  ? "Filter profiles by selecting multiple startup categories. Align with deep-tech builders, hardware developers, and growth hackers."
                  : "Post ideas, MVPs, co-founder updates, or space requests. Share local updates and connect with Pakistan's technology ecosystem."}
              </p>
            </div>

            {/* Premium Tab Selector Buttons */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-white/5 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab("matching")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "matching"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cofounder Matching
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "feed"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Foundry Hub Feed
              </button>
            </div>
          </div>
        </div>

        {activeTab === "matching" ? (
          <>
            {/* Filters and search with multiple tags select */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by cofounder name, specific skills (e.g. PyTorch, Rust, ROS2)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="bg-slate-900 border border-white/10 hover:border-emerald-500/30 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Select Startup Categories ({selectedTags.length} active)
                    <ChevronDown className={`w-4 h-4 transition-all ${showTagDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {/* Mega Dropdown for Startup Categories */}
                  <AnimatePresence>
                    {showTagDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-[340px] sm:w-[500px] bg-slate-950 border border-white/10 rounded-2xl p-5 shadow-2xl z-40 max-h-[400px] overflow-y-auto"
                      >
                        <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                          <span className="text-xs font-extrabold text-slate-300">All Startup Category Focus</span>
                          <button onClick={() => setSelectedTags([])} className="text-[10px] text-emerald-400 font-bold hover:underline">Clear all</button>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(startupCategories).map(([group, tags]) => (
                            <div key={group}>
                              <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{group}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {tags.map(tag => {
                                  const isSelected = selectedTags.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => toggleTag(tag)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                        isSelected 
                                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                          : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active Tags checklist */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Active filters:</span>
                  {selectedTags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    >
                      {tag}
                      <X className="w-3 h-3 hover:text-white cursor-pointer" onClick={() => toggleTag(tag)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Main List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredBuilders.length === 0 ? (
                <div className="col-span-full text-center py-16 border border-dashed border-white/5 rounded-2xl">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-semibold">No cofounders found matching your criteria</p>
                  <button onClick={() => { setSearchTerm(""); setSelectedTags([]); }} className="text-xs text-emerald-400 mt-2 underline">Clear all filters</button>
                </div>
              ) : (
                filteredBuilders.map(builder => (
                  <div 
                    key={builder.id} 
                    className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="absolute top-4 right-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      {builder.matchScore}% Match
                    </div>

                    <div>
                      <div className="flex gap-4 items-center mb-4">
                        <img 
                          src={builder.avatar} 
                          alt={builder.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-white tracking-wide">{builder.name}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">{builder.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold mb-3">
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {builder.city}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                          <Cpu className="w-3 h-3 text-emerald-400" />
                          {builder.field}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{builder.bio}</p>
                      <p className="text-[10.5px] text-slate-400 font-medium border-l-2 border-emerald-500/50 pl-2 py-0.5 mb-4">{builder.experience}</p>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {builder.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[9.5px] font-bold font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => handleCofounderConnect(builder)}
                        className="w-full bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 border border-white/10 hover:border-transparent text-slate-300 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Forge Alignment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dream Team Sandbox component */}
            <div className="border-t border-white/5 pt-16">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                  TEAM FORGER SIMULATOR (SANDBOX)
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-4">
                  Assemble Virtual Foundries
                </h2>
                <p className="text-slate-400 text-xs mt-2">
                  Add roles and select categories to see structural team viability and receive local roadmap alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
                {/* Controls */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
                  <h3 className="font-extrabold text-base text-white tracking-wide mb-4 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    Select Team Parameters
                  </h3>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Focus</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['AI', 'SaaS', 'Semiconductors', 'Robotics', 'Fintech', 'AR/VR', 'Deep Tech'].map(dom => (
                        <button
                          key={dom}
                          onClick={() => { setDreamDomain(dom); setTeamScore(null); }}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                            dreamDomain === dom 
                              ? "bg-emerald-500 text-slate-950 border-transparent shadow-md shadow-emerald-500/10"
                              : "bg-slate-900 text-slate-400 border-white/5 hover:border-white/10"
                          }`}
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Core Cofounder Profiles (Up to 4)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { role: 'Scientist', label: 'AI/ML Research Scientist', desc: 'PyTorch, custom weights & optimization' },
                        { role: 'Hardware', label: 'Semiconductor Layout Engineer', desc: 'Verilog ASIC layout, FPGA micro-chips' },
                        { role: 'Engineer', label: 'Full-Stack Software Dev', desc: 'Next.js, Node.js and scalable SaaS protocols' },
                        { role: 'Growth', label: 'B2B Sales & Growth Lead', desc: 'Enterprise pipeline building, VCs alignment' },
                        { role: 'Product', label: 'Product Manager & UX Designer', desc: 'Mockups, roadmap and client validations' },
                        { role: 'Operations', label: 'Legal & Procurement Specialist', desc: 'SECP compliance, government audit logistics' },
                      ].map(item => {
                        const isSelected = dreamTeam.includes(item.role);
                        return (
                          <button
                            key={item.role}
                            onClick={() => { toggleRoleInDreamTeam(item.role); setTeamScore(null); }}
                            className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                              isSelected 
                                ? "bg-slate-900 border-emerald-500/40 text-white"
                                : "bg-slate-950/40 border-white/5 hover:bg-slate-900/40 hover:border-white/10 text-slate-400"
                            }`}
                          >
                            <div>
                              <p className={`text-xs font-extrabold tracking-wide ${isSelected ? "text-emerald-400" : "text-slate-200"}`}>{item.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{item.desc}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-600"}`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={assessDreamTeam}
                    disabled={dreamTeam.length === 0}
                    className={`w-full font-extrabold py-3.5 rounded-xl transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 ${
                      dreamTeam.length > 0 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10 cursor-pointer"
                        : "bg-slate-900 text-slate-500 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    Run Stack Viability Assessment
                  </button>
                </div>

                {/* Results */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[420px]">
                  {teamScore ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">Forge compiler reports</h4>
                        
                        <div className="flex items-center gap-4 mb-5 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                          <div className="relative w-16 h-16 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center">
                            <span className="font-mono font-black text-lg text-emerald-400">{teamScore.score}%</span>
                            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="3.5" />
                              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="3.5"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 * (1 - teamScore.score / 100)}
                              />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-sm text-white tracking-wide">
                              {teamScore.score > 85 ? "Excellent Stack" : teamScore.score > 65 ? "Solid Foundation" : "Unbalanced Teams"}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">{dreamDomain} Category</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <p className="font-extrabold text-emerald-400 tracking-wide mb-1">Key Strengths:</p>
                            <ul className="space-y-1">
                              {teamScore.strengths.map((str, sIdx) => (
                                <li key={sIdx} className="flex items-center gap-1.5 text-slate-300 font-semibold">
                                  <span className="text-emerald-400">✔</span> {str}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-extrabold text-amber-400 tracking-wide mb-1">Identified Gaps:</p>
                            <p className="text-slate-300 leading-relaxed font-semibold">{teamScore.gap}</p>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                            <p className="text-slate-400 font-medium leading-relaxed">{teamScore.feedback}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <Sliders className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
                      <h4 className="font-extrabold text-sm text-slate-300 tracking-wide">Compile Stack Parameters</h4>
                      <p className="text-xs text-slate-400 max-w-[200px] mt-1 leading-relaxed">
                        Select startup categories and toggle roles to analyze.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Post Submission Card */}
            {session ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-[#0c111d] border border-white/10 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Post a Foundry Update
                </h3>

                {postError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-bold">
                    {postError}
                  </div>
                )}

                {showPostSuccess && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-400 font-bold">
                    Post successfully submitted!
                  </div>
                )}

                <form onSubmit={handleSubmitPost} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Seeking Rust Dev for custom blockchain verification"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-xl p-3 outline-none transition-all placeholder:text-slate-600 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Post Category</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-xl p-3 outline-none transition-all cursor-pointer font-bold"
                      >
                        <option value="Idea">Idea</option>
                        <option value="MVP">MVP</option>
                        <option value="Investment Wanted">Investment Wanted</option>
                        <option value="Partners Wanted">Partners Wanted</option>
                        <option value="Startup Space Wanted">Startup Space Wanted</option>
                        <option value="Cofounder Wanted">Cofounder Wanted</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Description / Update Details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Outline your update, active targets, technical requirements, or offer terms here..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-[#05070c] border border-white/5 focus:border-emerald-500/30 text-white rounded-xl p-3 outline-none transition-all resize-none placeholder:text-slate-600 font-semibold leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Image Uploader */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Upload Images (Max 3)</label>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/30 bg-[#05070c] hover:bg-[#0c111d] text-slate-500 hover:text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 w-24 h-24"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Upload</span>
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />

                      {postImages.map((base64, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-xl border border-white/10 overflow-hidden group">
                          <img src={base64} alt={`Upload preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow cursor-pointer hover:bg-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black uppercase text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    {isSubmittingPost ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Submit Post</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="max-w-2xl mx-auto p-8 bg-[#0c111d] border border-white/5 rounded-2xl text-center">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Sign in to join the conversation</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Only onboarded developers, founders, and students on the PITB Sandbox can publish posts on the live feed.
                </p>
                <a
                  href="/login?callbackUrl=/teams"
                  className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider font-mono"
                >
                  Access Sandbox login
                </a>
              </div>
            )}

            {/* Posts Feed Timeline */}
            <div className="max-w-2xl mx-auto space-y-6 pt-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono">Latest Updates</h3>

              {loadingPosts ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                </div>
              ) : postsList.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
                  <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">No updates posted yet</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Be the first to list an idea or MVP on the feed!</p>
                </div>
              ) : (
                postsList.map((post) => {
                  let imgs: string[] = [];
                  try {
                    imgs = JSON.parse(post.imagesJson || "[]");
                  } catch (e) {}

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0c111d] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all relative overflow-hidden group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={post.userAvatar}
                          alt={post.userName}
                          className="w-10 h-10 rounded-xl border border-white/10 object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-xs text-white tracking-wide">{post.userName}</h4>
                              <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-tight">{post.userRole}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-sm text-white mb-2 uppercase tracking-wide group-hover:text-emerald-400 transition-all">
                        {post.title}
                      </h3>
                      <p className="text-[11.5px] text-slate-300 leading-relaxed font-medium whitespace-pre-line mb-4">
                        {post.content}
                      </p>

                      {/* Post Images Grid */}
                      {imgs.length > 0 && (
                        <div className={`grid gap-3.5 mb-4 ${imgs.length === 1 ? "grid-cols-1" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {imgs.map((src, i) => (
                            <div key={i} className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-950 h-36">
                              <img src={src} alt="Uploaded post attachment" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono pt-3.5 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-[9px] text-[#00a86b]/70 font-mono tracking-widest font-black uppercase">
                          HEC Sandbox Sync
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Cofounder connection Dialogue */}
      <AnimatePresence>
        {selectedBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedBuilder(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-emerald-500/20 max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Initiate Alignment
                </h3>
                <button onClick={() => setSelectedBuilder(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 items-center p-3 bg-slate-900/60 rounded-xl border border-white/5 mb-4 text-xs">
                <img src={selectedBuilder.avatar} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-white">{selectedBuilder.name}</p>
                  <p className="text-slate-400">{selectedBuilder.role} ({selectedBuilder.city})</p>
                </div>
              </div>

              {chatSuccess ? (
                <div className="text-center py-8">
                  <span className="text-4xl">✔</span>
                  <h4 className="font-extrabold text-sm text-white mt-2">Proposal Dispatched!</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                    Sandbox channel initiated with {selectedBuilder.name.split(' ')[0]}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Salam Message</label>
                    <textarea
                      rows={4}
                      value={builderChatMsg}
                      onChange={(e) => setBuilderChatMsg(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <button 
                    onClick={submitBuilderChat}
                    className="w-full bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-emerald-400 transition-all text-xs tracking-wider flex items-center justify-center gap-1.5"
                  >
                    Dispatch Proposal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
