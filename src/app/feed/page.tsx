"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPosts } from "@/app/actions/posts";
import FeedPostCard from "@/components/FeedPostCard";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";

export default function FeedPage() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



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



            {/* Posts Feed Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#1d2226] border border-[#38434f] rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest font-mono">Loading Sandbox Updates...</p>
              </div>
            ) : postsList.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-lg">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white text-xs font-bold uppercase tracking-wider">No Updates Found</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  No one has posted an update yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {postsList.map((post) => (
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
