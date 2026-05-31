"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { checkUserStatus, updateUserRole } from "@/app/actions/user";
import {
  Users,
  TrendingUp,
  Handshake,
  Building2,
  Briefcase,
  Trophy,
  ChevronDown,
  Sparkles,
  Zap,
  Menu,
  X,
  Layers,
  HelpCircle,
  Cpu,
  Loader2
} from "lucide-react";

export default function Header() {
  const { isLoaded, isSignedIn } = useUser();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Clerk DB Sync State
  const [dbRole, setDbRole] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await checkUserStatus();
        if (res.isAuthenticated && res.hasRole && res.user) {
          setDbRole(res.user.role);
        } else {
          setDbRole(null);
        }
      } catch (err) {
        console.error("Error loading user in header:", err);
      }
    }
    loadUser();
  }, [pathname]);

  const handleRoleChange = async (newRole: string) => {
    setUpdatingRole(true);
    setShowRoleDropdown(false);
    try {
      await updateUserRole(newRole);
      setDbRole(newRole);
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingRole(false);
    }
  };

  // Listen to scroll to apply glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-[var(--background)]/90 backdrop-blur-md border-white/10 shadow-lg shadow-[var(--background)]/20" 
          : "bg-transparent border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
            I
            <div className="absolute inset-0 rounded-xl border border-white/20 animate-pulse"></div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              INDUS FOUNDRY <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono tracking-widest border border-emerald-500/20">VENTURES</span>
            </span>
            <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Pakistan's Startup & Jobs Engine</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Home Link */}
          <Link 
            href="/"
            className={`text-xs font-bold tracking-wide transition-all ${
              pathname === "/" ? "text-emerald-400" : "text-slate-400 hover:text-white"
            }`}
          >
            Home
          </Link>

          {/* Dropdown 1: Forging Modules */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("modules")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`flex items-center gap-1 text-xs font-bold tracking-wide transition-all ${
              activeDropdown === "modules" || ["/teams", "/jobs", "/challenges"].includes(pathname)
                ? "text-emerald-400" 
                : "text-slate-400 hover:text-white"
            }`}>
              Modules
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "modules" ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === "modules" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0b0f19] p-2.5 shadow-2xl shadow-black/85"
                >
                  <div className="text-[10px] font-extrabold text-slate-500 px-3.5 py-1 uppercase tracking-widest font-mono">Talent & Builders</div>
                  
                  <Link 
                    href="/teams" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Cofounder Teams</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Deep-tech cofounder alignment</p>
                    </div>
                  </Link>

                  <Link 
                    href="/jobs" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Jobs & Placements</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Bypass resumes via skill matching</p>
                    </div>
                  </Link>

                  <Link 
                    href="/freelance" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Freelance Projects</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Browse deep-tech contracts</p>
                    </div>
                  </Link>

                  <Link 
                    href="/challenges" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Challenge Arena</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Compete for pilot contracts & prizes</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown 2: Capital & Networks */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("capital")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`flex items-center gap-1 text-xs font-bold tracking-wide transition-all ${
              activeDropdown === "capital" || ["/funding", "/gov", "/partnerships", "/investors/individuals", "/investors/companies"].includes(pathname)
                ? "text-emerald-400" 
                : "text-slate-400 hover:text-white"
            }`}>
              Capital & Hubs
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "capital" ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === "capital" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0b0f19] p-2.5 shadow-2xl shadow-black/85"
                >
                  <div className="text-[10px] font-extrabold text-slate-500 px-3.5 py-1 uppercase tracking-widest font-mono">VCs & STATE ACCESS</div>
                  
                  <Link 
                    href="/investors/individuals" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Angel Investors</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Diaspora & Individual angels</p>
                    </div>
                  </Link>

                  <Link 
                    href="/investors/companies" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Venture Funds (VCs)</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Institutional VC funds & Companies</p>
                    </div>
                  </Link>

                  <Link 
                    href="/gov" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Government Access</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">PITB sandbox & PSF grant matching</p>
                    </div>
                  </Link>

                  <Link 
                    href="/partnerships" 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all">
                      <Handshake className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Diaspora & Corporate</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Global venture & corporate alliances</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Action Button & Clerk Auth Controls */}
        <div className="flex items-center gap-4 relative">
          
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="bg-slate-900 border border-white/10 hover:border-emerald-500/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          )}

          {isLoaded && isSignedIn && (
            <>
              <div className="relative">
                <button 
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  disabled={updatingRole}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/25 hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  {updatingRole ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>Role: {dbRole || "Loading..."}</span>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Live Role Switcher Dropdown */}
                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-950 border border-white/10 rounded-xl p-2 shadow-2xl z-50 text-xs"
                    >
                      <div className="px-2.5 py-1.5 border-b border-white/5 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Change primary role
                      </div>
                      {["Founder", "Cofounder", "Jobseeker", "Freelancer", "Student"].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                            dbRole === role 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <UserButton />
            </>
          )}

          <Link 
            href="/investors/companies"
            className="hidden sm:inline-flex bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/15 items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            Launch Application
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[var(--background)] px-6 py-6 space-y-6"
          >
            <div className="space-y-4">
              <Link 
                href="/"
                className="block text-sm font-bold text-slate-300 hover:text-white"
              >
                Home
              </Link>
              
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Forging Modules</p>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  <Link href="/teams" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-400" /> Teams</Link>
                  <Link href="/jobs" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-teal-400" /> Jobs</Link>
                  <Link href="/freelance" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Freelance</Link>
                  <Link href="/challenges" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-rose-400" /> Challenges</Link>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Capital & Hubs</p>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  <Link href="/investors/individuals" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> Angels</Link>
                  <Link href="/investors/companies" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-cyan-400" /> VCs</Link>
                  <Link href="/gov" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-cyan-400" /> Gov Access</Link>
                  <Link href="/partnerships" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5 text-indigo-400" /> Diaspora</Link>
                </div>
              </div>
            </div>

            <Link 
              href="/investors/companies"
              className="w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold py-3 rounded-lg block shadow-md shadow-emerald-500/10"
            >
              Launch Application
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
