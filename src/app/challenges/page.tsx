"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Target, Search, Plus, Trophy, Calendar, MapPin, Users, Loader2,
  AlertCircle, Building2, Zap, Edit, X, Sparkles, DollarSign, Medal,
  Gift, Link2, Video, Code2, Globe, UserPlus, Trash2, ChevronRight
} from "lucide-react";
import { getAllChallenges, createChallengeTeam, createChallengeSubmission, getUserTeamForChallenge, getUserSubmissionForChallenge } from "@/app/actions/challenges";
import { getMyCompanyPages } from "@/app/actions/company";
import PostChallengeModal from "@/components/PostChallengeModal";

// ─── Team Member Type ────────────────────────────────────────────────────
interface TeamMember {
  name: string;
  email: string;
  linkedinUrl: string;
  role: string;
}

interface AdditionalLink {
  label: string;
  url: string;
}

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [viewFilter, setViewFilter] = useState<"all" | "mine">("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [editChallenge, setEditChallenge] = useState<any>(null);

  // Compete flow state
  const [competingChallenge, setCompetingChallenge] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);

  // Team form
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([{ name: "", email: "", linkedinUrl: "", role: "" }]);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Submission form
  const [subTitle, setSubTitle] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [additionalLinks, setAdditionalLinks] = useState<AdditionalLink[]>([]);
  const [submittingSub, setSubmittingSub] = useState(false);

  const [flowError, setFlowError] = useState("");
  const [flowStep, setFlowStep] = useState<"team" | "submit">("team");

  useEffect(() => {
    async function loadData() {
      try {
        const [chalRes, compRes] = await Promise.all([
          getAllChallenges(),
          session ? getMyCompanyPages() : Promise.resolve({ success: true, pages: [] })
        ]);
        if (chalRes.success && chalRes.challenges) {
          setChallenges(chalRes.challenges);
        }
        if (compRes.success && compRes.pages) {
          setCompanies(compRes.pages);
        }
      } catch (err) {
        console.error("Error loading challenges:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  const companyIds = companies.map(c => c.id);
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || c.category === selectedTag;
    const matchesView = viewFilter === "all" || companyIds.includes(c.companyPageId);
    return matchesSearch && matchesTag && matchesView;
  });

  const loadUserTeamAndSubmission = async (challengeId: string) => {
    const [teamRes, subRes] = await Promise.all([
      getUserTeamForChallenge(challengeId),
      getUserSubmissionForChallenge(challengeId),
    ]);
    if (teamRes.success) setUserTeam(teamRes.team);
    else setUserTeam(null);
    if (subRes.success) setUserSubmission(subRes.submission);
    else setUserSubmission(null);
  };

  const openCompeteFlow = async (challenge: any) => {
    if (!session) { alert("Please log in to compete."); return; }
    setCompetingChallenge(challenge);
    setFlowError("");
    setFlowStep("team");
    setTeamName("");
    setMembers([{ name: session.user?.name || "", email: session.user?.email || "", linkedinUrl: "", role: "Captain" }]);
    setSubTitle("");
    setSubDesc("");
    setVideoLink("");
    setGithubUrl("");
    setLiveDemoUrl("");
    setTechStack("");
    setAdditionalLinks([]);
    await loadUserTeamAndSubmission(challenge.id);
    if (userTeam) setFlowStep("submit");
  };

  const addMember = () => {
    if (members.length < 10) {
      setMembers([...members, { name: "", email: "", linkedinUrl: "", role: "" }]);
    }
  };

  const removeMember = (idx: number) => {
    if (members.length > 1) setMembers(members.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: keyof TeamMember, value: string) => {
    const next = [...members];
    next[idx] = { ...next[idx], [field]: value };
    setMembers(next);
  };

  const addAdditionalLink = () => {
    setAdditionalLinks([...additionalLinks, { label: "", url: "" }]);
  };

  const updateAdditionalLink = (idx: number, field: keyof AdditionalLink, value: string) => {
    const next = [...additionalLinks];
    next[idx] = { ...next[idx], [field]: value };
    setAdditionalLinks(next);
  };

  const removeAdditionalLink = (idx: number) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== idx));
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) { setFlowError("Team name is required."); return; }
    const validMembers = members.filter(m => m.name.trim() && m.email.trim());
    if (!validMembers.length) { setFlowError("At least one team member with name and email is required."); return; }

    setFlowError("");
    setSubmittingTeam(true);

    const fd = new FormData();
    fd.append("challengeId", competingChallenge.id);
    fd.append("teamName", teamName.trim());
    fd.append("membersJson", JSON.stringify(validMembers));

    const res = await createChallengeTeam(fd);
    setSubmittingTeam(false);

    if (res.success) {
      setUserTeam(res.team);
      setFlowStep("submit");
    } else {
      setFlowError(res.error || "Failed to create team.");
    }
  };

  const handleCreateSubmission = async () => {
    if (!subTitle.trim()) { setFlowError("Submission title is required."); return; }
    if (!subDesc.trim()) { setFlowError("Description of what you achieved is required."); return; }

    setFlowError("");
    setSubmittingSub(true);

    const techStackArray = techStack.split(",").map(s => s.trim()).filter(Boolean);

    const fd = new FormData();
    fd.append("challengeId", competingChallenge.id);
    fd.append("teamId", userTeam.id);
    fd.append("teamName", userTeam.teamName);
    fd.append("title", subTitle.trim());
    fd.append("description", subDesc.trim());
    fd.append("videoLink", videoLink.trim());
    fd.append("githubUrl", githubUrl.trim());
    fd.append("liveDemoUrl", liveDemoUrl.trim());
    fd.append("techStackJson", JSON.stringify(techStackArray));
    fd.append("teamMembersJson", JSON.stringify(members.filter(m => m.name.trim() && m.email.trim())));
    fd.append("additionalLinksJson", JSON.stringify(additionalLinks.filter(l => l.label.trim() && l.url.trim())));

    const res = await createChallengeSubmission(fd);
    setSubmittingSub(false);

    if (res.success) {
      setUserSubmission(res.submission);
      setCompetingChallenge(null);
    } else {
      setFlowError(res.error || "Failed to submit.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const currentUserEmail = session?.user?.email?.toLowerCase().trim();

  const renderPrizes = (challenge: any) => {
    let prizes: string[] = [];
    try { prizes = JSON.parse(challenge.prizesJson || "[]"); } catch { prizes = [challenge.prize].filter(Boolean); }
    if (!prizes.length) return null;

    return (
      <div className="flex flex-col gap-1.5">
        {prizes.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {i === 0 ? (
              <Medal className="w-4 h-4 text-amber-400 shrink-0" />
            ) : i === 1 ? (
              <Medal className="w-4 h-4 text-slate-300 shrink-0" />
            ) : i === 2 ? (
              <Medal className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <Gift className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className={i === 0 ? "text-amber-400 font-extrabold" : "text-slate-300 font-semibold"}>{p}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-12 px-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-mono text-[10px] font-bold border border-violet-500/20 mb-4">
              <Target className="w-3.5 h-3.5" />
              MODULE 03 / COMPETITIVE ARENA
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
              The Challenge Arena
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Compete on real engineering bottlenecks posted by government departments and corporate partners. Secure prize capital, pilot integrations, or direct equity checks.
            </p>
          </div>

          <button 
            onClick={() => {
              if (!session) { alert("Please log in to post a challenge."); return; }
              if (companies.length === 0) { alert("You must create a Company Page first before posting a challenge."); return; }
              setEditChallenge(null);
              setShowPostModal(true);
            }}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post a Challenge
          </button>
        </div>

        {/* View Tabs */}
        {session && (
          <div className="flex items-center gap-1 mb-6 bg-[#1d2226] p-1 rounded-lg border border-[#38434f] w-fit">
            {[
              { key: "all" as const, label: "All Challenges" },
              { key: "mine" as const, label: "Posted by Me" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setViewFilter(tab.key)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewFilter === tab.key
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search bottlenecks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1d2226] border border-[#38434f] text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1d2226] p-1 rounded-lg border border-[#38434f] text-xs overflow-x-auto shrink-0">
            {['All', 'Engineering', 'AI / ML', 'Hardware / Robotics', 'Data Science'].map(tag => (
              <button key={tag} onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  selectedTag === tag 
                    ? "bg-slate-800 text-violet-400 border border-violet-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge List */}
        <div className="space-y-6 mb-16">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-2xl">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-white text-sm font-bold">{viewFilter === "mine" ? "You haven't posted any challenges yet." : "No active challenges found."}</p>
              <p className="text-xs text-slate-500 mt-1">{viewFilter === "mine" ? "Post your first challenge to get started." : "Check back later or post one yourself."}</p>
            </div>
          ) : (
            filteredChallenges.map(challenge => {
              const isOwner = companies.some(c => c.id === challenge.companyPageId);
              
              return (
                <div key={challenge.id}
                  className="bg-[#1d2226] p-6 rounded-2xl border border-[#38434f] hover:border-violet-500/30 transition-all flex flex-col md:flex-row justify-between gap-6 relative group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {challenge.companyLogo ? (
                        <img src={challenge.companyLogo} alt={challenge.companyName} className="w-5 h-5 rounded-md object-cover bg-slate-800" />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="text-xs font-bold text-slate-300">{challenge.companyName}</span>
                      <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 ml-2">
                        {challenge.category}
                      </span>
                      {challenge.status === "Open" ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{challenge.status}</span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-xl text-white tracking-wide mb-3">{challenge.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-5 max-w-3xl whitespace-pre-line">{challenge.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" /> Duration: {challenge.duration}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                        <MapPin className="w-3.5 h-3.5 text-violet-400" /> {challenge.location}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                        <Users className="w-3.5 h-3.5 text-violet-400" /> Team: {challenge.minTeamMembers}-{challenge.maxTeamMembers}
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-72 bg-slate-900 p-5 rounded-xl border border-white/5 flex flex-col shrink-0">
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> Prizes / Incentives
                      </p>
                      {renderPrizes(challenge)}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      {isOwner && (
                        <button 
                          onClick={() => { setEditChallenge(challenge); setShowPostModal(true); }}
                          className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                      <button 
                        onClick={() => openCompeteFlow(challenge)}
                        className={`py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/20 ${isOwner ? "flex-1" : "w-full"}`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Compete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Compete Flow Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {competingChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCompetingChallenge(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#1d2226] border border-[#38434f] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-transparent shrink-0">
                <button onClick={() => setCompetingChallenge(null)} className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-violet-400 fill-current" />
                  <h2 className="text-xl font-black text-white">Enter Challenge</h2>
                </div>
                <p className="text-xs text-slate-400 font-medium">Compete in: <span className="text-white font-bold">{competingChallenge.title}</span></p>
                
                {/* Steps indicator */}
                <div className="flex items-center gap-2 mt-4">
                  <div className={`flex items-center gap-1.5 ${flowStep === "team" ? "text-violet-400" : "text-emerald-400"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${flowStep === "team" ? "bg-violet-500/20 border border-violet-500/40" : "bg-emerald-500/20 border border-emerald-500/40"}`}>
                      {flowStep === "submit" ? "✓" : "1"}
                    </div>
                    <span className="text-xs font-bold">Team Setup</span>
                  </div>
                  <div className="w-8 h-px bg-slate-700" />
                  <div className={`flex items-center gap-1.5 ${flowStep === "submit" ? "text-violet-400" : "text-slate-500"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${flowStep === "submit" ? "bg-violet-500/20 border border-violet-500/40" : "bg-slate-800 border border-slate-700"}`}>
                      2
                    </div>
                    <span className="text-xs font-bold">Submission</span>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {flowError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">{flowError}</div>
                )}

                {/* Step 1: Team Setup */}
                {flowStep === "team" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Team Name *</label>
                      <input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="e.g. The Solvers"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300">Team Members (up to 10)</label>
                        {members.length < 10 && (
                          <button onClick={addMember} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                            <UserPlus className="w-3 h-3" /> Add Member
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {members.map((member, i) => (
                          <div key={i} className="bg-slate-900 border border-white/10 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Member {i + 1}{i === 0 ? " (Captain)" : ""}</span>
                              {i > 0 && (
                                <button onClick={() => removeMember(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                placeholder="Full Name *"
                                value={member.name}
                                onChange={e => updateMember(i, "name", e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                              />
                              <input
                                placeholder="Email *"
                                type="email"
                                value={member.email}
                                onChange={e => updateMember(i, "email", e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                              />
                              <input
                                placeholder="LinkedIn URL"
                                value={member.linkedinUrl}
                                onChange={e => updateMember(i, "linkedinUrl", e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                              />
                              <input
                                placeholder="Role (e.g. Developer, Designer)"
                                value={member.role}
                                onChange={e => updateMember(i, "role", e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCreateTeam}
                      disabled={submittingTeam}
                      className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
                    >
                      {submittingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Team & Continue</>}
                    </button>
                  </div>
                )}

                {/* Step 2: Submission */}
                {flowStep === "submit" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Submission Title / Project Name *</label>
                      <input
                        value={subTitle}
                        onChange={e => setSubTitle(e.target.value)}
                        placeholder="e.g. AI-Powered Traffic Optimization System"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">What You Achieved / Solution Description *</label>
                      <textarea
                        rows={4}
                        value={subDesc}
                        onChange={e => setSubDesc(e.target.value)}
                        placeholder="Describe your approach, the solution you built, key outcomes, and any technical innovations..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500/50 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1"><Video className="w-3 h-3" /> Demo Video Link</label>
                        <input
                          value={videoLink}
                          onChange={e => setVideoLink(e.target.value)}
                          placeholder="YouTube / Loom URL"
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-violet-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1"><Code2 className="w-3 h-3" /> GitHub Repository</label>
                        <input
                          value={githubUrl}
                          onChange={e => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-violet-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Live Demo URL</label>
                        <input
                          value={liveDemoUrl}
                          onChange={e => setLiveDemoUrl(e.target.value)}
                          placeholder="https://yourapp.com"
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-violet-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Tech Stack (comma separated)</label>
                        <input
                          value={techStack}
                          onChange={e => setTechStack(e.target.value)}
                          placeholder="e.g. Python, React, TensorFlow"
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:border-violet-500/50 outline-none"
                        />
                      </div>
                    </div>

                    {/* Additional Links */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300">Additional Links</label>
                        <button onClick={addAdditionalLink} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>
                      {additionalLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input
                            placeholder="Label (e.g. Deck, Demo)"
                            value={link.label}
                            onChange={e => updateAdditionalLink(i, "label", e.target.value)}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                          />
                          <input
                            placeholder="URL"
                            value={link.url}
                            onChange={e => updateAdditionalLink(i, "url", e.target.value)}
                            className="flex-[2] bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 outline-none"
                          />
                          <button onClick={() => removeAdditionalLink(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>

                    {/* Team members summary */}
                    <div className="bg-slate-900 border border-white/10 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Team Members</p>
                      <div className="space-y-1">
                        {members.filter(m => m.name.trim()).map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="font-bold">{m.name}</span>
                            {m.role && <span className="text-slate-500">({m.role})</span>}
                            {m.email && <span className="text-slate-500">- {m.email}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCreateSubmission}
                      disabled={submittingSub}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      {submittingSub ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Submit Entry</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Challenge Modal */}
      <AnimatePresence>
        {showPostModal && (
          <PostChallengeModal 
            onClose={() => { setShowPostModal(false); setEditChallenge(null); }}
            onCreated={(c) => {
              if (editChallenge) {
                setChallenges(prev => prev.map(ch => ch.id === c.id ? c : ch));
              } else {
                setChallenges(prev => [c, ...prev]);
              }
              setShowPostModal(false);
              setEditChallenge(null);
            }}
            companies={companies}
            editChallenge={editChallenge}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
