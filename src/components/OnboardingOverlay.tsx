"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { checkUserStatus, saveUserOnboarding } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function OnboardingOverlay() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoaded = status !== "loading";
  const isSignedIn = !!session;
  const [checking, setChecking] = useState(false);
  const [needOnboarding, setNeedOnboarding] = useState(false);
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

  const handleSetupProfile = async () => {
    setSaving(true);
    try {
      // Create user with "None" role – they will pick roles on the profile page
      await saveUserOnboarding("None");
      setSuccess(true);
      setTimeout(() => {
        setNeedOnboarding(false);
        setSuccess(false);
        router.push("/profile");
      }, 1200);
    } catch (err) {
      console.error("Error onboarding:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn || !needOnboarding) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[#04060c]/90 backdrop-blur-md"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-[#00a86b]/10 blur-[130px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-[#2563eb]/8 blur-[130px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-md w-full bg-[#0c111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
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
              <h3 className="font-extrabold text-xl text-white tracking-wide">Welcome Aboard!</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                Redirecting you to set up your profile...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a86b]/10 text-[#00a86b] font-mono text-[10px] font-bold border border-[#00a86b]/20 mb-3 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  Welcome to Indus Foundry
                </span>
                <h3 className="font-black text-2xl tracking-tight text-white">
                  Let's Set Up Your Profile
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Salam, <span className="text-white font-bold">{session?.user?.name?.split(" ")[0] || "User"}</span>! 
                  Complete your profile to unlock co-founder matching, MVP showcases, and funding opportunities.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-400 mb-6">
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400 font-bold text-[10px]">1</span>
                  </div>
                  <span>Select your <span className="text-white font-bold">roles</span> (Founder, Cofounder, Freelancer, etc.)</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-cyan-400 font-bold text-[10px]">2</span>
                  </div>
                  <span>Add your <span className="text-white font-bold">social links</span> — LinkedIn, GitHub, Portfolio</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-400 font-bold text-[10px]">3</span>
                  </div>
                  <span>Set your <span className="text-white font-bold">location & employment status</span></span>
                </div>
              </div>

              <button
                onClick={handleSetupProfile}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Set Up My Profile
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-500 font-medium mt-4">
                You can update your profile at any time from the header menu.
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
