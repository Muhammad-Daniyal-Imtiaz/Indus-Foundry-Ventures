"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Sparkles, 
  Mail, 
  User, 
  ArrowRight, 
  Loader2, 
  ShieldAlert,
  Compass,
  Cpu
} from "lucide-react";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("callbackUrl") || "/";

  // Form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Founder");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(redirectUrl);
    }
  }, [status, session, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    if (isRegistering && !name) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        name: isRegistering ? name.trim() : (email.split("@")[0] || "User"),
        role: role,
        callbackUrl: redirectUrl,
      });

      if (result?.error) {
        setErrorMsg("Failed to authenticate. Please check your credentials.");
      } else {
        router.refresh();
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#04060c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04060c] relative flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Decorative backdrop */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0c111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Sleek top border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent"></div>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group cursor-pointer">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black">
              <Cpu className="w-5 h-5 group-hover:rotate-12 transition-all" />
            </div>
            <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
              Indus Foundry
            </span>
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold leading-relaxed">
            {isRegistering 
              ? "Join Pakistan's premier deep-tech startup and placement portal."
              : "Sign in with your email to access your personalized placement match portfolio."}
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-2.5 text-xs text-red-400 font-bold"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field */}
          <AnimatePresence>
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required={isRegistering}
                    placeholder="Muhammad Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#05070c] border border-white/5 text-white placeholder-slate-600 text-xs font-semibold rounded-xl focus:outline-none focus:border-emerald-500/30 transition-all outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="ali@ventures.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#05070c] border border-white/5 text-white placeholder-slate-600 text-xs font-semibold rounded-xl focus:outline-none focus:border-emerald-500/30 transition-all outline-none"
              />
            </div>
          </div>

          {/* Role selector field */}
          <AnimatePresence>
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Select Primary Role</label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#05070c] border border-white/5 text-white text-xs font-semibold rounded-xl focus:outline-none focus:border-emerald-500/30 transition-all cursor-pointer outline-none font-bold"
                  >
                    <option value="Founder">Founder</option>
                    <option value="Cofounder">Cofounder / Builder</option>
                    <option value="Jobseeker">Job Seeker</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black uppercase text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? "Register Account" : "Access Application"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute left-0 right-0 h-[1px] bg-white/5"></div>
          <span className="relative px-3 bg-[#0c111d] text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Or continue with
          </span>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            signIn("google", { callbackUrl: redirectUrl });
          }}
          disabled={loading}
          className="w-full bg-[#05070c] hover:bg-[#080d16] border border-white/5 hover:border-white/10 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google Workspace</span>
        </button>

        {/* Toggle */}
        <div className="mt-6 text-center text-xs font-semibold text-slate-500">
          {isRegistering ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMsg("");
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-all cursor-pointer underline"
              >
                Sign In here
              </button>
            </span>
          ) : (
            <span>
              New to Indus Foundry?{" "}
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMsg("");
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-all cursor-pointer underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#04060c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
