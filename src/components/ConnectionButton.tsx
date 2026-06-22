"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Check, X, Loader2, UserCheck, UserMinus } from "lucide-react";
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection, toggleFollow, getConnectionStatus } from "@/app/actions/network";

type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "connected";

interface ConnectionButtonProps {
  targetUserId: string;
  targetUserName?: string;
  compact?: boolean;
  onStatusChange?: () => void;
}

export default function ConnectionButton({ targetUserId, targetUserName, compact = false, onStatusChange }: ConnectionButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>("none");
  const [following, setFollowing] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getConnectionStatus(targetUserId);
        if (res.success) {
          setStatus(res.status);
          setFollowing(res.following);
          setConnectionId(res.connectionId || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetUserId]);

  async function handleConnect() {
    setActing(true);
    try {
      const res = await sendConnectionRequest(targetUserId);
      if (res.success) {
        setStatus(res.status === "pending" ? "pending_sent" : status);
        onStatusChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  async function handleAccept() {
    if (!connectionId) return;
    setActing(true);
    try {
      const res = await acceptConnectionRequest(connectionId);
      if (res.success) {
        setStatus("connected");
        onStatusChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!connectionId) return;
    setActing(true);
    try {
      const res = await rejectConnectionRequest(connectionId);
      if (res.success) {
        setStatus("none");
        setConnectionId(null);
        onStatusChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  async function handleRemove() {
    setActing(true);
    try {
      const res = await removeConnection(targetUserId);
      if (res.success) {
        setStatus("none");
        setConnectionId(null);
        onStatusChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  async function handleFollow() {
    setActing(true);
    try {
      const res = await toggleFollow(targetUserId);
      if (res.success) {
        setFollowing(res.following);
        onStatusChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${compact ? "px-2 py-1" : "px-3 py-1.5"} rounded-lg`}>
        <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
      </div>
    );
  }

  const btnBase = compact
    ? "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
    : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer";

  if (status === "connected") {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleRemove} className={`${btnBase} bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30`} disabled={acting}>
          {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserCheck className="w-3 h-3" /> Connected</>}
        </button>
      </div>
    );
  }

  if (status === "pending_sent") {
    return (
      <button className={`${btnBase} bg-amber-500/10 text-amber-400 border border-amber-500/30`} disabled>
        <Loader2 className="w-3 h-3 animate-spin" /> Pending
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleAccept} className={`${btnBase} bg-emerald-500 text-slate-950 hover:bg-emerald-400`} disabled={acting}>
          {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Accept</>}
        </button>
        <button onClick={handleReject} className={`${btnBase} bg-slate-700 text-slate-300 hover:bg-red-500/20 hover:text-red-400`} disabled={acting}>
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={handleConnect} className={`${btnBase} bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950`} disabled={acting}>
        {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserPlus className="w-3 h-3" /> Connect</>}
      </button>
      <button onClick={handleFollow} className={`${btnBase} ${following ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" : "bg-slate-700 text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 border border-transparent"}`} disabled={acting}>
        {following ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
      </button>
    </div>
  );
}
