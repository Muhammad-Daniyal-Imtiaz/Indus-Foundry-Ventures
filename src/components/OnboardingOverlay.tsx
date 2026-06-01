"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { checkUserStatus, saveUserOnboarding } from "@/app/actions/user";
import { 
  Users, 
  UserCheck, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Activity, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

export default function OnboardingOverlay() {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = !!session;
  const [checking, setChecking] = useState(false);
  const [needOnboarding, setNeedOnboarding] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyUser() {
      if (!isLoaded || !isSignedIn) return;
      setChecking(true);
      try {
        const res = await checkUserStatus();
        if (res.isAuthenticated && !res.hasRole) {
          setNeedOnboarding(true);
        }
      } catch (err) {
        console.error("Failed verification:", err);
      } finally {
        setChecking(false);
      }
    }
    verifyUser();
  }, [isLoaded, isSignedIn]);

  const handleSelectRole = async (role: string) => {
    setSelectedRole(role);
    setSaving(true);
    try {
      await saveUserOnboarding(role);
      setSuccess(true);
      setTimeout(() => {
        setNeedOnboarding(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Error onboarding:", err);
      alert("Something went wrong saving your role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn || !needOnboarding) {
    return null;
  }

  const roles = [
    {
      id: "Founder",
      title: "Founder",
      desc: "Post challenges, request capital, recruit deep-tech partners.",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      id: "Cofounder",
      title: "Cofounder / Builder",
      desc: "Align with active projects, matching models, and build chip layouts.",
      icon: UserCheck,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
    },
    {
      id: "Jobseeker",
      title: "Job Seeker",
      desc: "Direct placement pipelines, bypass standard resume screening.",
      icon: Briefcase,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    },
    {
      id: "Freelancer",
      title: "Freelancer",
      desc: "Browse deep-tech contracts with explicit fixed or hourly rates.",
      icon: Activity,
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    },
    {
      id: "Student",
      title: "Student",
      desc: "Join specialized challenge arenas, get university research grants.",
      icon: GraduationCap,
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[#04060c]/90 backdrop-blur-md"></div>
        
        {/* Animated Orbs for Onboarding Visuals */}
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-[#00a86b]/10 blur-[130px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-[#2563eb]/8 blur-[130px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-lg w-full bg-[#0c111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
        >
          {success ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-[#00a86b]/10 border border-[#00a86b]/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-[#00a86b]" />
              </motion.div>
              <h3 className="font-extrabold text-xl text-white tracking-wide">Role Selected Successfully!</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                Welcome onboard! Your portfolio is now customized for <span className="text-[#00a86b] font-bold">{selectedRole}</span>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a86b]/10 text-[#00a86b] font-mono text-[10px] font-bold border border-[#00a86b]/20 mb-3 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  Account Setup
                </span>
                <h3 className="font-black text-2xl tracking-tight text-white">Select Your Foundry Role</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Salam, <span className="text-white font-bold">{session?.user?.name?.split(" ")[0] || "User"}</span>! Select a primary role to customize your placement matches, matches can be updated later.
                </p>
              </div>

              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isPending = saving && selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      disabled={saving}
                      onClick={() => handleSelectRole(r.id)}
                      className={`w-full text-left p-4 rounded-2xl border bg-gradient-to-r ${r.color} hover:border-white/20 transition-all flex items-start gap-4 cursor-pointer relative group`}
                    >
                      <div className="p-2 rounded-xl bg-slate-950 border border-white/5 shrink-0">
                        {isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#00a86b]" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white tracking-wide uppercase">{r.title}</h4>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center text-[10px] text-slate-500 font-medium">
                Note: Investors, Incubators, and Corporate Admins are subject to separate manual HEC/PITB verification.
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
