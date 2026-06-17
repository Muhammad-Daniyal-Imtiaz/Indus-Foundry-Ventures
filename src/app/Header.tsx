"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { checkUserStatus } from "@/app/actions/user";
import ThemeSwitcher from "@/components/ThemeSwitcher";
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
  Loader2,
  ShoppingBag
} from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = !!session;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Server-side user fallback (used when NextAuth client fetch errors)
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; image?: string; role?: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await checkUserStatus();
        if (res.isAuthenticated && res.user) {
          setUserInfo({
            name: res.user.name,
            email: res.user.email,
            image: res.user.avatarUrl || undefined,
            role: res.user.role,
          });
        } else {
          setUserInfo(null);
        }
      } catch (err) {
        console.error("Error loading user in header:", err);
      }
    }
    loadUser();
  }, [pathname]);

  // Effective auth state — client session OR server-verified user
  const effectivelySignedIn = isSignedIn || !!userInfo;
  const effectiveUser = session?.user || userInfo;



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
      className={`sticky top-0 z-50 w-full transition-all duration-300 glass`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo — ConnectIn brand mark */}
        <Link href="/" className="flex items-center group shrink-0 h-12">
          <img
            src="/Connectin.webp"
            alt="ConnectIn"
            className="h-full w-auto object-contain group-hover:scale-105 transition-all duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Home Link */}
          <Link 
            href="/"
            className={`text-xs font-bold tracking-wide transition-all ${
              pathname === "/" ? "text-accent" : "text-secondary hover:text-primary"
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
              activeDropdown === "modules" || ["/teams", "/jobs", "/challenges", "/company"].some(p => pathname.startsWith(p))
                ? "text-accent" 
                : "text-secondary hover:text-primary"
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
                  className="absolute left-0 mt-3 w-64 rounded-2xl p-2.5 shadow-2xl"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="text-[10px] font-extrabold px-3.5 py-1 uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>Talent & Builders</div>
                  
                  <Link 
                    href="/feed" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Foundry Feed</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Live updates & ideas stream</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/teams" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Cofounder Teams</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Deep-tech cofounder alignment</p>
                    </div>
                  </Link>

                  <Link 
                    href="/jobs" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Jobs & Placements</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Bypass resumes via skill matching</p>
                    </div>
                  </Link>

                  <Link 
                    href="/company" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Company Pages</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Create & discover companies</p>
                    </div>
                  </Link>

                  <Link 
                    href="/freelance" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Freelance Projects</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Browse deep-tech contracts</p>
                    </div>
                  </Link>

                  <Link 
                    href="/challenges" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Challenge Arena</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Compete for pilot contracts & prizes</p>
                    </div>
                  </Link>

                  <Link 
                    href="/mvps" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>MVP Marketplace</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Buy/Sell ready-to-scale apps</p>
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
                  className="absolute left-0 mt-3 w-64 rounded-2xl p-2.5 shadow-2xl"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="text-[10px] font-extrabold px-3.5 py-1 uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>VCs & STATE ACCESS</div>
                  
                  <Link 
                    href="/investors/individuals" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Angel Investors</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Diaspora & Individual angels</p>
                    </div>
                  </Link>

                  <Link 
                    href="/investors/companies" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Venture Funds (VCs)</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Institutional VC funds & Companies</p>
                    </div>
                  </Link>

                  <Link 
                    href="/gov" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Government Access</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>PITB sandbox & PSF grant matching</p>
                    </div>
                  </Link>

                  <Link 
                    href="/partnerships" 
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all">
                      <Handshake className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Diaspora & Corporate</p>
                      <p className="text-[9.5px] font-medium" style={{ color: "var(--text-muted)" }}>Global venture & corporate alliances</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Action Button & Clerk Auth Controls */}
        <div className="flex items-center gap-4 relative">
          
          {isLoaded && !effectivelySignedIn && (
            <Link 
              href="/login"
              className="btn-secondary text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Sign In
            </Link>
          )}

          {isLoaded && effectivelySignedIn && (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold badge cursor-pointer"
              >
                <span>Profile</span>
              </Link>
              <Link
                href="/myposts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold transition-all cursor-pointer"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <span>My Posts</span>
              </Link>
              
              {/* User Avatar & Logout */}
              <div className="flex items-center gap-3 relative shrink-0">
                <img
                  src={effectiveUser?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveUser?.name || "User")}`}
                  alt={effectiveUser?.name || "User"}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ border: "1px solid var(--border-primary)" }}
                />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-secondary text-[10px] px-3 py-1.5 rounded-lg cursor-pointer uppercase tracking-wider font-mono hover:text-red-400 hover:border-red-500/30"
                >
                  Logout
                </button>
              </div>
            </>
          )}

          <ThemeSwitcher />

          <Link 
            href="/investors/companies"
            className="hidden sm:inline-flex btn-primary items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            Launch Application
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}
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
            className="md:hidden border-t px-6 py-6 space-y-6"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}
          >
            <div className="space-y-4">
              <Link 
                href="/"
                className="block text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Home
              </Link>
              
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>Forging Modules</p>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  <Link href="/feed" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Feed</Link>
                  <Link href="/teams" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Users className="w-3.5 h-3.5 text-emerald-400" /> Teams</Link>
                  <Link href="/jobs" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Briefcase className="w-3.5 h-3.5 text-teal-400" /> Jobs</Link>
                  <Link href="/freelance" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Freelance</Link>
                  <Link href="/challenges" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Trophy className="w-3.5 h-3.5 text-rose-400" /> Challenges</Link>
                  <Link href="/mvps" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> MVPs</Link>
                  <Link href="/company" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Building2 className="w-3.5 h-3.5 text-cyan-400" /> Companies</Link>
                  {isSignedIn && <Link href="/myposts" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Layers className="w-3.5 h-3.5 text-emerald-400" /> My Posts</Link>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>Capital & Hubs</p>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  <Link href="/investors/individuals" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Users className="w-3.5 h-3.5 text-amber-400" /> Angels</Link>
                  <Link href="/investors/companies" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Building2 className="w-3.5 h-3.5 text-cyan-400" /> VCs</Link>
                  <Link href="/gov" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Building2 className="w-3.5 h-3.5 text-cyan-400" /> Gov Access</Link>
                  <Link href="/partnerships" className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Handshake className="w-3.5 h-3.5 text-indigo-400" /> Diaspora</Link>
                </div>
              </div>
            </div>

            <Link 
              href="/investors/companies"
              className="w-full text-center btn-primary text-xs font-bold py-3 rounded-lg block"
            >
              Launch Application
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
