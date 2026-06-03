"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getProfile, saveProfile } from "@/app/actions/profile";
import {
  User,
  Phone,
  MapPin,
  Globe2,
  Link,
  MessageCircle,
  Camera,
  Code2,
  FolderGit2,
  ExternalLink,
  Briefcase,
  Check,
  Loader2,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ALL_ROLES = ["Founder", "Cofounder", "Jobseeker", "Freelancer", "Student"];
const EMPLOYMENT_STATUSES = [
  "Employed",
  "Unemployed",
  "Student",
  "Freelancing",
  "Looking for Work",
  "Running a Startup",
];

const COUNTRIES = [
  "Pakistan",
  "United Arab Emirates",
  "Saudi Arabia",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "Australia",
  "Turkey",
  "Qatar",
  "Malaysia",
  "Other",
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Profile fields
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [hackerrankUrl, setHackerrankUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bestProjectUrl, setBestProjectUrl] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [employmentStatus, setEmploymentStatus] = useState("");

  // User info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => setUserAvatar(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getProfile();
        if (res.success && res.user) {
          setUserName(res.user.name);
          setUserEmail(res.user.email);
          setUserAvatar(
            res.user.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(res.user.name)}`
          );
          if (res.profile) {
            setPhone(res.profile.phone || "");
            setCountry(res.profile.country || "");
            setLocation(res.profile.location || "");
            setLinkedinUrl(res.profile.linkedinUrl || "");
            setTwitterUrl(res.profile.twitterUrl || "");
            setInstagramUrl(res.profile.instagramUrl || "");
            setLeetcodeUrl(res.profile.leetcodeUrl || "");
            setHackerrankUrl(res.profile.hackerrankUrl || "");
            setPortfolioUrl(res.profile.portfolioUrl || "");
            setBestProjectUrl(res.profile.bestProjectUrl || "");
            setEmploymentStatus(res.profile.employmentStatus || "");
            try {
              setSelectedRoles(JSON.parse(res.profile.rolesJson || "[]"));
            } catch {
              setSelectedRoles([]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const fd = new FormData();
    fd.set("phone", phone);
    fd.set("country", country);
    fd.set("location", location);
    fd.set("linkedinUrl", linkedinUrl);
    fd.set("twitterUrl", twitterUrl);
    fd.set("instagramUrl", instagramUrl);
    fd.set("leetcodeUrl", leetcodeUrl);
    fd.set("hackerrankUrl", hackerrankUrl);
    fd.set("portfolioUrl", portfolioUrl);
    fd.set("bestProjectUrl", bestProjectUrl);
    fd.set("rolesJson", JSON.stringify(selectedRoles));
    fd.set("employmentStatus", employmentStatus);
    fd.set("avatarUrl", userAvatar);

    try {
      const res = await saveProfile(fd);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Failed to save");
      }
    } catch (err: any) {
      setSaveError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center bg-[#1d2226] border border-[#38434f] rounded-2xl p-10">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Not Signed In</h2>
          <p className="text-slate-400 text-sm">Please sign in to manage your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-6 px-4 sm:px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/3 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center"
          >
            <div className="relative mb-4">
              <img
                src={userAvatar}
                alt={userName}
                className="w-32 h-32 rounded-full border-4 border-emerald-500/20 object-cover shadow-lg"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500 text-slate-950 shadow-lg transition hover:bg-emerald-400"
                title="Upload profile image"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profile Image URL
              </label>
              <input
                value={userAvatar}
                onChange={(event) => setUserAvatar(event.target.value)}
                placeholder="Paste image URL or upload locally"
                className="w-full rounded-xl border border-[#38434f] bg-slate-900 px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 outline-none transition focus:border-emerald-500/50"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/20 mb-4 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Foundry Profile
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{userName}</h1>
            <p className="text-sm text-slate-400 mt-1 mb-5">{userEmail}</p>
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {selectedRoles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase tracking-wide"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <div>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold mb-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Saved successfully!
                  </motion.div>
                )}
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold mb-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {saveError}
                  </motion.div>
                )}
                {!saveSuccess && !saveError && (
                  <p className="text-xs text-slate-400 font-medium text-center mb-2">
                    {selectedRoles.length} role(s) selected
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Roles Selection */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-6 mb-6 shadow-xl"
        >
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Your Roles
          </h2>
          <p className="text-[11px] text-slate-500 mb-4">
            Select one or more roles that describe you best.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`relative px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900/50 border-[#38434f] text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {role}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Employment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-6 mb-6 shadow-xl"
        >
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Employment Status
          </h2>
          <p className="text-[11px] text-slate-500 mb-4">Select your current employment situation.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EMPLOYMENT_STATUSES.map((s) => {
              const isSelected = employmentStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setEmploymentStatus(isSelected ? "" : s)}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                      : "bg-slate-900/50 border-[#38434f] text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-cyan-400" />
                  )}
                  {s}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Contact & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-6 mb-6 shadow-xl"
        >
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Contact & Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                Country
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white text-xs font-semibold focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lahore, Islamabad, Karachi..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social & Professional Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-6 mb-6 shadow-xl"
        >
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-400" />
            Social & Professional Links
          </h2>
          <div className="space-y-4">
            {/* LinkedIn */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#0a66c2]" /> LinkedIn
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-[#0a66c2]/50 transition-all"
              />
            </div>
            {/* Twitter */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-sky-400" /> Twitter / X
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://x.com/your-handle"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-sky-500/50 transition-all"
              />
            </div>
            {/* Instagram */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-pink-400" /> Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/your-handle"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Coding Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#1d2226] border border-[#38434f] rounded-2xl p-6 mb-6 shadow-xl"
        >
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            Coding & Portfolio
          </h2>
          <div className="space-y-4">
            {/* LeetCode */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                LeetCode Profile
              </label>
              <input
                type="url"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                placeholder="https://leetcode.com/your-username"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            {/* HackerRank */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                HackerRank Profile
              </label>
              <input
                type="url"
                value={hackerrankUrl}
                onChange={(e) => setHackerrankUrl(e.target.value)}
                placeholder="https://hackerrank.com/profile/your-username"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>
            {/* Portfolio */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://your-portfolio.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            {/* Best Project */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">
                Best Project URL
              </label>
              <input
                type="url"
                value={bestProjectUrl}
                onChange={(e) => setBestProjectUrl(e.target.value)}
                placeholder="https://github.com/you/best-project"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-[#38434f] text-white placeholder-slate-600 text-xs font-semibold focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        </div>
      </div>
    </div>
  );
}
