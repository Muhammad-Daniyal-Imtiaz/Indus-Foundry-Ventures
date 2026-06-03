"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPosts } from "@/app/actions/posts";
import FeedPostCard from "@/components/FeedPostCard";
import PostComposerModal from "@/components/PostComposerModal";
import { Loader2, AlertCircle, Sparkles, Plus, Users, Briefcase, Trophy, ShoppingBag } from "lucide-react";

const MODULES = [
  {
    label: "Foundry Feed",
    href: "/feed",
    description: "Live updates & ideas stream",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
  },
  {
    label: "Cofounder Teams",
    href: "/teams",
    description: "Deep-tech cofounder alignment",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
  },
  {
    label: "Jobs & Placements",
    href: "/jobs",
    description: "Bypass resumes via skill matching",
    icon: Briefcase,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    activeBg: "bg-teal-500/20",
    border: "border-teal-500/30",
  },
  {
    label: "Freelance Projects",
    href: "/freelance",
    description: "Browse deep-tech contracts",
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
  },
  {
    label: "Challenge Arena",
    href: "/challenges",
    description: "Compete for pilot contracts & prizes",
    icon: Trophy,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    activeBg: "bg-rose-500/20",
    border: "border-rose-500/30",
  },
  {
    label: "MVP Marketplace",
    href: "/mvps",
    description: "Buy/Sell ready-to-scale apps",
    icon: ShoppingBag,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    activeBg: "bg-indigo-500/20",
    border: "border-indigo-500/30",
  },
];

export default function FeedPage() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const pathname = usePathname();

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

          {/* Left Sidebar: Info + Stats */}
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

          {/* Center Column: Feed */}
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

            <button
              onClick={() => setComposerOpen(true)}
              className="w-full rounded-lg border border-[#38434f] bg-[#1d2226] p-4 text-left shadow-lg transition hover:border-emerald-500/40 hover:bg-[#22282d]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Post a Foundry Update</p>
                  <p className="mt-0.5 text-xs text-slate-400">Share an idea, MVP, cofounder request, or local startup update.</p>
                </div>
                <span className="hidden rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-950 sm:inline-flex">
                  Create
                </span>
              </div>
            </button>

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

          {/* Right Sidebar: Modules Navigation */}
          <div className="lg:col-span-3 sticky top-[76px] space-y-4 hidden lg:block text-left">
            <div className="bg-[#1d2226] border border-[#38434f] rounded-lg p-3 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 mb-3 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Talent & Builders
              </div>
              <div className="space-y-1">
                {MODULES.map((module) => {
                  const Icon = module.icon;
                  const isActive = pathname === module.href;
                  return (
                    <Link
                      key={module.href}
                      href={module.href}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-all group ${
                        isActive
                          ? `${module.activeBg} border ${module.border}`
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${module.bg} ${module.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                          {module.label}
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-medium truncate">
                          {module.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
      <PostComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={(post) => setPostsList((current) => [post, ...current])}
      />
    </div>
  );
}
