"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Search, Loader2, MapPin, Sparkles, Briefcase, ChevronRight
} from "lucide-react";
import { getAllUsers } from "@/app/actions/profiles";
import ConnectionButton from "@/components/ConnectionButton";

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getAllUsers(3);
        if (res.success) {
          setUsersList(res.users);
          setUsersCursor(res.nextCursor ?? null);
          setHasMoreUsers(res.hasMore ?? false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadMoreUsers = async () => {
    if (!usersCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getAllUsers(3, usersCursor);
      if (res.success && res.users) {
        setUsersList(prev => [...prev, ...res.users]);
        setUsersCursor(res.nextCursor ?? null);
        setHasMoreUsers(res.hasMore ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredUsers = usersList.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.profile?.location && u.profile.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] py-8 px-4">
      <div className="fixed top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 mb-3">
            <Users className="w-3.5 h-3.5" />
            PEOPLE DIRECTORY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Discover People
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            Find builders, founders, and talent across Pakistan's ecosystem.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, email, or location..."
            className="w-full bg-[#1d2226] border border-[#38434f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all shadow-lg"
          />
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest font-mono">Loading people...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-[#1d2226] border border-[#38434f] rounded-xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white text-xs font-bold uppercase tracking-wider">No people found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const roles = u.profile?.rolesJson ? JSON.parse(u.profile.rolesJson) : [];
              return (
                <div key={u.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all group">
                  {/* Banner */}
                  <div className="h-16 bg-gradient-to-br from-emerald-900/40 via-slate-800 to-indigo-900/30 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #00a86b 0%, transparent 60%), radial-gradient(circle at 80% 50%, #2563eb 0%, transparent 60%)" }} />
                  </div>

                  <div className="px-4 pb-4">
                    {/* Avatar */}
                    <div className="-mt-7 mb-2 relative z-10 flex items-end justify-between">
                      <Link href={`/users/${u.id}`}>
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-14 h-14 rounded-full border-4 border-[#1d2226] object-cover bg-slate-800 hover:ring-2 hover:ring-emerald-500/30 transition-all"
                        />
                      </Link>
                      <ConnectionButton targetUserId={u.id} targetUserName={u.name} compact />
                    </div>

                    {/* Info */}
                    <Link href={`/users/${u.id}`}>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] truncate hover:text-emerald-400 transition-colors">{u.name}</h3>
                    </Link>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{u.role || "Builder"}</p>

                    {u.profile?.location && (
                      <p className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] mt-1">
                        <MapPin className="w-2.5 h-2.5" /> {u.profile.location}
                      </p>
                    )}

                    {roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {roles.slice(0, 2).map((r: string, i: number) => (
                          <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{r}</span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />{u.postCount} posts</span>
                      <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{u.followerCount} followers</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More */}
        {hasMoreUsers && filteredUsers.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMoreUsers}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl bg-[#1d2226] border border-[#38434f] text-xs font-bold text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
}
