"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPosts } from "@/app/actions/posts";
import { checkUserStatus } from "@/app/actions/user";
import FeedPostCard from "@/components/FeedPostCard";
import PostComposerModal from "@/components/PostComposerModal";
import {
  Loader2, AlertCircle, Sparkles, Plus, Users, Briefcase, Trophy,
  ShoppingBag, Building2, UserCircle2, ChevronRight, Pencil, BookOpen,
  MapPin, CheckCircle2
} from "lucide-react";

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
  {
    label: "Company Pages",
    href: "/company",
    description: "Discover & create company pages",
    icon: Building2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    activeBg: "bg-cyan-500/20",
    border: "border-cyan-500/30",
  },
];

export default function FeedPage() {
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [companyCount, setCompanyCount] = useState(0);
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);
  const pathname = usePathname();
  const { data: session } = useSession();

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

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await checkUserStatus();
        if (res.isAuthenticated && res.user) {
          setUserInfo(res.user);
        }
      } catch {}
    }
    loadUser();
  }, [session]);

  useEffect(() => {
    async function loadFeaturedCompanies() {
      try {
        const { getAllCompanyPages } = await import("@/app/actions/company");
        const res = await getAllCompanyPages(100);
        if (res.success) {
          setCompanyCount(res.pages.length);
          const shuffled = [...res.pages].sort(() => Math.random() - 0.5);
          setFeaturedCompanies(shuffled.slice(0, 3));
        }
      } catch {}
    }
    loadFeaturedCompanies();
  }, []);



  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] pt-4 pb-12 px-4 sm:px-6 bg-grid-pattern overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar: User Profile Card + Stats */}
          <div className="lg:col-span-3 sticky top-[76px] space-y-3 hidden lg:block text-left">

            {/* Profile Card */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-xl overflow-visible shadow-lg">
              {/* Banner */}
              <div className="h-16 bg-gradient-to-br from-emerald-900/40 via-slate-800 to-indigo-900/30 relative">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #00a86b 0%, transparent 60%), radial-gradient(circle at 80% 50%, #2563eb 0%, transparent 60%)" }} />
              </div>

              {/* Avatar — overlaps banner */}
              <div className="px-4 pb-4">
                <div className="-mt-7 mb-3">
                  {userInfo?.avatarUrl || session?.user?.image ? (
                    <img
                      src={userInfo?.avatarUrl || session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                      className="w-14 h-14 rounded-full border-4 border-[#1d2226] object-cover bg-slate-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border-4 border-[#1d2226] bg-slate-800 flex items-center justify-center">
                      <UserCircle2 className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>

                {session ? (
                  <>
                    <p className="text-sm font-black text-white leading-tight truncate">
                      {session.user?.name || "Builder"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                      {session.user?.email}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                      <Link href="/profile"
                        className="flex items-center justify-between text-[11px] text-slate-400 hover:text-emerald-400 transition-colors font-semibold group">
                        <span className="flex items-center gap-1.5">
                          <Pencil className="w-3 h-3" /> Edit Profile
                        </span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <Link href="/myposts"
                        className="flex items-center justify-between text-[11px] text-slate-400 hover:text-emerald-400 transition-colors font-semibold group">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3" /> My Posts
                        </span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <Link href="/company"
                        className="flex items-center justify-between text-[11px] text-slate-400 hover:text-emerald-400 transition-colors font-semibold group">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" /> Company Pages
                        </span>
                        <span className="flex items-center gap-1.5">
                          {companyCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-black">
                              {companyCount}
                            </span>
                          )}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </Link>                    </div>
                  </>
                ) : (
                  <div className="mt-1">
                    <p className="text-sm font-black text-white">Welcome, Builder</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sign in to post and connect</p>
                    <Link href="/login"
                      className="mt-3 w-full inline-flex items-center justify-center py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Discover & Connect */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 mb-3 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Foundry Hub Feed
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                Discover & Connect
              </h2>
              <p className="text-slate-400 text-[11px] mt-2 font-medium leading-relaxed">
                Explore live updates, MVP launches, and cofounder searches from Pakistan's most innovative builders.
              </p>
            </div>

            {/* Featured Companies */}
            <div className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 text-[11px] text-slate-400">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">Featured Companies</p>
                <Link href="/company" className="text-[9px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300">
                  View All
                </Link>
              </div>

              {featuredCompanies.length > 0 ? (
                <div className="space-y-2">
                  {featuredCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/company/${company.slug}`}
                      className="group block rounded-xl border border-white/5 bg-slate-950/35 p-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="h-full w-full object-cover"
                              onError={(event) => (event.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-emerald-500/10">
                              <Building2 className="h-4 w-4 text-emerald-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-black text-white group-hover:text-emerald-300">{company.name}</p>
                            {company.isVerified && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-400">{company.tagline}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-emerald-400">
                              {company.stage}
                            </span>
                            <span className="rounded-full border border-white/10 bg-slate-800 px-2 py-0.5 text-[8.5px] font-bold text-slate-400">
                              {company.industry}
                            </span>
                          </div>
                          {company.headquarters && (
                            <p className="mt-2 flex items-center gap-1 text-[9.5px] text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {company.headquarters}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-center">
                  <Building2 className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No company pages yet</p>
                  <Link href="/company/create" className="mt-3 inline-flex rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400">
                    Create Company
                  </Link>
                </div>
              )}
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
