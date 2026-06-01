"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPosts } from "@/app/actions/posts";
import FeedPostCard from "@/components/FeedPostCard";
import { Search, Loader2, AlertCircle, Sparkles, SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

export default function FeedPage() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Dropdown states
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showCatFilter, setShowCatFilter] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const res = await getPosts();
        if (res.success && res.posts) {
          setPostsList(res.posts);
        }
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  // Compute filtered posts
  const filteredPosts = postsList.filter((post) => {
    // 1. Text Search (Title or Content)
    const matchesSearch = 
      !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Role Filter (Empty = all)
    const matchesRole = 
      selectedRoles.length === 0 || 
      selectedRoles.includes(post.userRole);

    // 3. Category Filter (Empty = all)
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(post.category);

    return matchesSearch && matchesRole && matchesCategory;
  });

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const allRoles = ["Founder", "Cofounder", "Jobseeker", "Freelancer", "Student"];
  const allCategories = ["Idea", "MVP", "Investment Wanted", "Partners Wanted", "Startup Space Wanted", "Cofounder Wanted"];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] pt-4 pb-12 px-4 sm:px-6 bg-grid-pattern overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar Info Card (LinkedIn Style) */}
          <div className="lg:col-span-3 sticky top-[76px] space-y-4 hidden lg:block text-left">
            <div className="bg-[#1d2226] border border-[#38434f] rounded-lg p-5 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 mb-4 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Foundry Hub Feed
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Discover & Connect
              </h2>
              <p className="text-slate-400 text-xs mt-3 font-medium leading-relaxed">
                Explore live updates, MVP launches, and cofounder searches from Pakistan's most innovative builders. 
                Use advanced filters to pinpoint opportunities that match your expertise.
              </p>
            </div>
            
            {/* Quick Ecosystem Stats Card */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-lg p-4 text-[11px] text-slate-400">
              <p className="font-bold text-white uppercase tracking-wider text-[10px] mb-2 font-mono">Sandbox Pulse</p>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span>Active Builders</span>
                <span className="text-white font-bold">1,248</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span>Cofounder Syncs</span>
                <span className="text-white font-bold">482</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Active MVPs</span>
                <span className="text-white font-bold">89</span>
              </div>
            </div>
          </div>

          {/* Right Column: Filters at the top, followed by the Feed */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Mobile Banner Info Card */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-lg p-4 text-left shadow-lg lg:hidden mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 mb-3 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Foundry Hub Feed
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Discover & Connect
              </h2>
              <p className="text-slate-400 text-xs mt-2 font-medium leading-normal">
                Explore live updates, MVP launches, and cofounder searches from Pakistan's most innovative builders.
              </p>
            </div>

            {/* Compact Filters Section (LinkedIn-style action bar) */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-lg p-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ideas, descriptions, cofounders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded bg-slate-900 border border-[#38434f] text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-[#0a66c2] transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Role Filter Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <button 
                      onClick={() => { setShowRoleFilter(!showRoleFilter); setShowCatFilter(false); }}
                      className={`bg-slate-900 border ${showRoleFilter ? "border-[#0a66c2]" : "border-[#38434f]"} hover:bg-slate-800 text-white px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer justify-between w-full`}
                    >
                      <span>Roles {selectedRoles.length > 0 ? `(${selectedRoles.length})` : ""}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-all ${showRoleFilter ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showRoleFilter && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 mt-1.5 w-48 bg-slate-950 border border-[#38434f] rounded shadow-2xl z-40 p-3"
                        >
                          <div className="flex justify-between items-center pb-1.5 border-b border-[#38434f] mb-2">
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">By Role</span>
                            <button onClick={() => setSelectedRoles([])} className="text-[9px] text-[#0a66c2] font-bold hover:underline">Clear</button>
                          </div>
                          <div className="space-y-1.5">
                            {allRoles.map(role => (
                              <button 
                                key={role} 
                                onClick={() => toggleRole(role)}
                                className="flex items-center gap-2 cursor-pointer group w-full text-left bg-transparent border-none focus:outline-none"
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedRoles.includes(role) ? "bg-[#0a66c2] border-[#0a66c2]" : "bg-slate-900 border-[#38434f] group-hover:border-white/30"}`}>
                                  {selectedRoles.includes(role) && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-all">{role}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Category Filter Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <button 
                      onClick={() => { setShowCatFilter(!showCatFilter); setShowRoleFilter(false); }}
                      className={`bg-slate-900 border ${showCatFilter ? "border-[#0a66c2]" : "border-[#38434f]"} hover:bg-slate-800 text-white px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer justify-between w-full`}
                    >
                      <span>Categories {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ""}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-all ${showCatFilter ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showCatFilter && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 mt-1.5 w-52 bg-slate-950 border border-[#38434f] rounded shadow-2xl z-40 p-3"
                        >
                          <div className="flex justify-between items-center pb-1.5 border-b border-[#38434f] mb-2">
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">By Category</span>
                            <button onClick={() => setSelectedCategories([])} className="text-[9px] text-[#0a66c2] font-bold hover:underline">Clear</button>
                          </div>
                          <div className="space-y-1.5">
                            {allCategories.map(cat => (
                              <button 
                                key={cat} 
                                onClick={() => toggleCategory(cat)}
                                className="flex items-center gap-2 cursor-pointer group w-full text-left bg-transparent border-none focus:outline-none"
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? "bg-[#0a66c2] border-[#0a66c2]" : "bg-slate-900 border-[#38434f] group-hover:border-white/30"}`}>
                                  {selectedCategories.includes(cat) && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-all">{cat}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Tight Active Filters Pills */}
              {(selectedRoles.length > 0 || selectedCategories.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-[#38434f]">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><SlidersHorizontal className="w-2.5 h-2.5" /> Active:</span>
                  {selectedRoles.map(r => (
                    <span key={r} className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {r} <X className="w-2.5 h-2.5 hover:text-white cursor-pointer" onClick={() => toggleRole(r)} />
                    </span>
                  ))}
                  {selectedCategories.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                      {c} <X className="w-2.5 h-2.5 hover:text-white cursor-pointer" onClick={() => toggleCategory(c)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Posts Feed Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#1d2226] border border-[#38434f] rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest font-mono">Loading Sandbox Updates...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-lg">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white text-xs font-bold uppercase tracking-wider">No Updates Found</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  We couldn't find any posts matching your current filters. Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedRoles([]); setSelectedCategories([]); }}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded transition-all border border-[#38434f]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {filteredPosts.map((post) => (
                    <FeedPostCard key={post.id} post={post} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
