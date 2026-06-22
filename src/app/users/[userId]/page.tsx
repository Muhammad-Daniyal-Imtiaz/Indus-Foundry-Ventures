"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  UserCircle2, MapPin, Loader2, AlertCircle, ArrowLeft, Users, Briefcase,
  ShoppingBag, Globe, Mail, Calendar, ExternalLink, Sparkles
} from "lucide-react";
import { getUserProfile } from "@/app/actions/profiles";
import ConnectionButton from "@/components/ConnectionButton";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "mvps" | "freelance">("posts");

  useEffect(() => {
    async function load() {
      try {
        const res = await getUserProfile(userId);
        if (res.success) setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-slate-500" />
        <p className="text-[var(--text-secondary)] text-sm">User not found.</p>
        <Link href="/users" className="text-emerald-400 text-xs font-bold hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to Users
        </Link>
      </div>
    );
  }

  const { user, profile, posts, mvps, freelanceProjects, connectionCount, followerCount, followingCount, isFollowing, connectionStatus, isOwnProfile } = data;
  const roles = profile?.rolesJson ? JSON.parse(profile.rolesJson) : [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] py-8 px-4">
      <div className="fixed top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-all mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All Users
        </Link>

        {/* Profile Header */}
        <div className="bg-[#1d2226] border border-[#38434f] rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-emerald-900/40 via-slate-800 to-indigo-900/30 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #00a86b 0%, transparent 60%), radial-gradient(circle at 80% 50%, #2563eb 0%, transparent 60%)" }} />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-[#1d2226] object-cover bg-slate-800"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-white truncate">{user.name}</h1>
                <p className="text-sm text-slate-400 font-semibold">{user.email}</p>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {roles.map((r: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{r}</span>
                    ))}
                  </div>
                )}
              </div>
              {!isOwnProfile && (
                <ConnectionButton targetUserId={user.id} targetUserName={user.name} />
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-5 pt-5 border-t border-white/5">
              <div className="text-center">
                <p className="text-lg font-black text-white">{connectionCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Connections</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{followerCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{followingCount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Following</p>
              </div>
            </div>

            {/* Profile Details */}
            {profile && (
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
                )}
                {profile.country && (
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{profile.country}</span>
                )}
                {profile.employmentStatus && (
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{profile.employmentStatus}</span>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-400 hover:underline">
                    <ExternalLink className="w-3 h-3" />Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[#1d2226] p-1 rounded-lg border border-[#38434f] w-fit">
          {[
            { key: "posts" as const, label: "Posts", icon: Sparkles, count: posts.length },
            { key: "mvps" as const, label: "MVPs", icon: ShoppingBag, count: mvps.length },
            { key: "freelance" as const, label: "Freelance", icon: Briefcase, count: freelanceProjects.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="text-[9px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-xl">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No posts yet</p>
              </div>
            ) : posts.map((post: any) => (
              <Link key={post.id} href={`/feed/${post.id}`}
                className="block bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                <p className="text-sm font-bold text-white mb-1">{post.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{post.category}</span>
                  <span className="text-[9px] text-slate-500">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* MVPs Tab */}
        {activeTab === "mvps" && (
          <div className="space-y-3">
            {mvps.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-xl">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No MVPs listed</p>
              </div>
            ) : mvps.map((mvp: any) => (
              <div key={mvp.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-white">{mvp.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{mvp.tagline}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400">{mvp.askingPrice}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10">{mvp.category}</span>
                  {mvp.techStack?.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[9px] font-mono text-slate-500 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Freelance Tab */}
        {activeTab === "freelance" && (
          <div className="space-y-3">
            {freelanceProjects.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-xl">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No freelance projects</p>
              </div>
            ) : freelanceProjects.map((proj: any) => (
              <div key={proj.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-teal-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-white">{proj.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Client: {proj.client}</p>
                  </div>
                  <span className="text-xs font-black text-amber-400">{proj.budget}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">{proj.primaryIndustry}</span>
                  {proj.skills?.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[9px] font-mono text-slate-500 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
