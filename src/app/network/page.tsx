"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, UserPlus, UserCheck, UserMinus, Loader2, AlertCircle,
  Check, X, Globe2, MapPin, Search, Sparkles, Building2, Handshake
} from "lucide-react";
import { getMyNetwork } from "@/app/actions/network";
import ConnectionButton from "@/components/ConnectionButton";

export default function NetworkPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "connections" | "pending" | "suggestions">("all");

  async function load() {
    try {
      const res = await getMyNetwork();
      if (res.success) setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleRefresh() {
    setLoading(true);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-slate-500" />
        <p className="text-[var(--text-secondary)] text-sm">Failed to load network.</p>
        <Link href="/feed" className="text-emerald-400 text-xs font-bold hover:underline">← Back to Feed</Link>
      </div>
    );
  }

  const filteredSuggestions = (data.peopleYouMayKnow || []).filter((u: any) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-8 px-4">
      {/* Background Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 mb-3">
            <Users className="w-3.5 h-3.5" />
            MY NETWORK
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Your Network
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            Manage connections, follow builders, and grow your professional network.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Connections", value: data.connectionCount, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Followers", value: data.followerCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Following", value: data.followingCount, icon: UserPlus, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { label: "Pending", value: (data.pendingIncoming?.length || 0) + (data.pendingOutgoing?.length || 0), icon: UserMinus, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border ${stat.border} ${stat.bg} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-[#1d2226] p-1 rounded-lg border border-[#38434f] w-fit">
          {[
            { key: "all" as const, label: "All" },
            { key: "connections" as const, label: "Connections" },
            { key: "pending" as const, label: "Pending" },
            { key: "suggestions" as const, label: "Suggestions" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending Requests */}
        {(activeTab === "all" || activeTab === "pending") && (data.pendingIncoming?.length > 0 || data.pendingOutgoing?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-amber-400" />
              Pending Requests
            </h2>

            {/* Incoming */}
            {data.pendingIncoming?.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Incoming ({data.pendingIncoming.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.pendingIncoming.map((req: any) => (
                    <div key={req.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{req.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{req.since ? new Date(req.since).toLocaleDateString() : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => { await import("@/app/actions/network").then(m => m.acceptConnectionRequest(req.id)); handleRefresh(); }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all">
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={async () => { await import("@/app/actions/network").then(m => m.rejectConnectionRequest(req.id)); handleRefresh(); }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-all">
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing */}
            {data.pendingOutgoing?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Sent ({data.pendingOutgoing.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.pendingOutgoing.map((req: any) => (
                    <div key={req.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-amber-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{req.name}</p>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Connections */}
        {(activeTab === "all" || activeTab === "connections") && data.connections?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Your Connections ({data.connectionCount})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.connections.map((conn: any) => (
                <div key={conn.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={conn.avatar} alt={conn.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{conn.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Connected {conn.since ? new Date(conn.since).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People You May Know */}
        {(activeTab === "all" || activeTab === "suggestions") && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                People You May Know
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search people..."
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-[#1d2226] border border-[#38434f] text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 w-48"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredSuggestions.map((user: any) => (
                <div key={user.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all group">
                  {/* Banner */}
                  <div className="h-16 bg-gradient-to-br from-emerald-900/40 via-slate-800 to-indigo-900/30 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #00a86b 0%, transparent 60%), radial-gradient(circle at 80% 50%, #2563eb 0%, transparent 60%)" }} />
                  </div>
                  {/* Avatar */}
                  <div className="px-4 pb-4">
                    <div className="-mt-7 mb-2 relative z-10">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-14 h-14 rounded-full border-4 border-[#1d2226] object-cover bg-slate-800"
                      />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{user.role || "Builder"}</p>
                    {user.profile?.location && (
                      <p className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] mt-1">
                        <MapPin className="w-2.5 h-2.5" /> {user.profile.location}
                      </p>
                    )}
                    {user.profile?.rolesJson && (() => {
                      try {
                        const roles = JSON.parse(user.profile.rolesJson);
                        if (roles.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {roles.slice(0, 2).map((r: string, i: number) => (
                                <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{r}</span>
                              ))}
                            </div>
                          );
                        }
                      } catch { return null; }
                    })()}
                    <div className="mt-3">
                      <ConnectionButton targetUserId={user.id} targetUserName={user.name} compact />
                    </div>
                  </div>
                </div>
              ))}
              {filteredSuggestions.length === 0 && (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-sm">
                  No people found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
