"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Plus,
  X,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2
} from "lucide-react";

import { freelanceProjectsData, startupCategories, FreelanceProject } from "../data";
import { getFreelanceProjects, createFreelanceProject } from "../actions/freelance";
import FreelanceProposalModal from "@/components/FreelanceProposalModal";

export default function FreelancePage() {
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [projectsCursor, setProjectsCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);

  // Post Freelance Project Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Apply logic
  const [applyProject, setApplyProject] = useState<any>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formBudgetType, setFormBudgetType] = useState<'Fixed' | 'Hourly'>('Fixed');
  const [formDuration, setFormDuration] = useState("");
  const [formPrimaryIndustry, setFormPrimaryIndustry] = useState("AI SaaS");
  const [formSecondaryIndustries, setFormSecondaryIndustries] = useState<string[]>([]);
  const [formSkills, setFormSkills] = useState("");
  const [formDesc, setFormDesc] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getFreelanceProjects(3);
        if (result.success && result.projects && result.projects.length > 0) {
          setProjects(result.projects.map(p => ({
            ...p,
            postedDate: "Just now"
          })) as any);
          setProjectsCursor(result.nextCursor ?? null);
          setHasMoreProjects(result.hasMore ?? false);
        } else {
          setProjects(freelanceProjectsData);
          setHasMoreProjects(false);
        }
      } catch (e) {
        console.error("Failed to fetch freelance projects:", e);
        setProjects(freelanceProjectsData);
        setHasMoreProjects(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("client", formClient);
      formData.append("budget", formBudget);
      formData.append("budgetType", formBudgetType);
      formData.append("duration", formDuration);
      formData.append("primaryIndustry", formPrimaryIndustry);
      formData.append("secondaryIndustries", JSON.stringify(formSecondaryIndustries));
      formData.append("skills", formSkills);
      formData.append("description", formDesc);

      const result = await createFreelanceProject(formData);
      if (result.success && result.project) {
        setProjects(prev => [{
          ...result.project,
          postedDate: "Just now"
        } as any, ...prev]);
      }
      setSuccessToast(true);

      // Reset Form
      setFormTitle("");
      setFormClient("");
      setFormBudget("");
      setFormDuration("");
      setFormSkills("");
      setFormDesc("");
      setFormSecondaryIndustries([]);

      setTimeout(() => {
        setShowPostModal(false);
        setSuccessToast(false);
      }, 2000);
    } catch (e) {
      console.error("Failed to create freelance project:", e);
      alert("Failed to post your freelance project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSecondaryIndustry = (tag: string) => {
    if (formSecondaryIndustries.includes(tag)) {
      setFormSecondaryIndustries(prev => prev.filter(t => t !== tag));
    } else {
      setFormSecondaryIndustries(prev => [...prev, tag]);
    }
  };

  const loadMoreProjects = async () => {
    if (!projectsCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getFreelanceProjects(3, projectsCursor);
      if (result.success && result.projects) {
        setProjects(prev => [...prev, ...result.projects.map(p => ({
          ...p,
          postedDate: "Just now"
        })) as any]);
        setProjectsCursor(result.nextCursor ?? null);
        setHasMoreProjects(result.hasMore ?? false);
      }
    } catch (e) {
      console.error("Failed to load more freelance projects:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === "All" || 
                       p.primaryIndustry === selectedTag || 
                       p.secondaryIndustries.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-3" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[#f8fafc] py-12 px-6 bg-grid-pattern overflow-hidden">
      {/* Patriotic Tech Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#00a86b]/6 blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-[#2563eb]/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-white/2 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold border border-teal-500/20 mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              FREELANCE Placements
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Freelance Projects
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Post specialized software contracts or browse active deep-tech work packages in compilers, localized AI, and embedded robotics.
            </p>
          </div>

          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold px-5 py-3 rounded-lg hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post Freelance Project
          </button>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search contracts (e.g. LLVM, compiler, ROS2)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs overflow-x-auto shrink-0">
            {['All', 'AI SaaS', 'AI agents', 'LLM apps', 'Chip design', 'Robotics software', 'EDA tools'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
                  selectedTag === tag 
                    ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Main List */}
        <div className="space-y-6 mb-16">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No freelance projects found matching the criteria</p>
              <button onClick={() => { setSearchTerm(""); setSelectedTag("All"); }} className="text-xs text-teal-400 mt-2 underline">Clear all filters</button>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="flex flex-col gap-2">
                <div
                  className="bg-[#1d2226] p-6 rounded-2xl border border-[#38434f] hover:border-teal-500/20 transition-all flex flex-col md:flex-row justify-between gap-6"
                >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                      Client: {project.client}
                    </span>
                    <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                      {project.primaryIndustry}
                    </span>
                    {project.secondaryIndustries.map((ind, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                        {ind}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-extrabold text-lg text-white tracking-wide mb-2">{project.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[9.5px] font-bold font-mono bg-slate-900 text-slate-400 px-2.5 py-0.5 rounded border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-64 bg-[#141b24] p-5 rounded-2xl border border-[#38434f] flex flex-col justify-between shrink-0">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PROJECT BUDGET</p>
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {project.postedDate}
                      </span>
                    </div>
                    <p className="text-xl font-extrabold text-amber-400 mb-1">{project.budget}</p>
                    <p className="text-[10.5px] text-slate-400 font-medium">Budget scheme: <span className="text-teal-400 font-bold">{project.budgetType}</span></p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-white/5">
                      <span>Contract Duration</span>
                      <span className="font-extrabold text-white">{project.duration}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 w-full">
                    {project.isOwner ? (
                      <button 
                        onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {expandedProjectId === project.id ? "Hide Submissions" : `View Submissions (${project.submissions?.length || 0})`}
                      </button>
                    ) : (
                      <button 
                        onClick={() => !project.hasApplied && setApplyProject(project)}
                        disabled={project.hasApplied}
                        className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          project.hasApplied
                            ? "bg-slate-800 text-teal-400 border border-teal-500/30 cursor-not-allowed"
                            : "bg-teal-500 hover:bg-teal-400 text-slate-950"
                        }`}
                      >
                        {project.hasApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-3.5 h-3.5" /> Submit Proposal
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expandable Submissions Section */}
              {project.isOwner && expandedProjectId === project.id && (
                <div className="mt-2 glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/50">
                  <h5 className="text-sm font-bold text-white mb-4">Proposals & Submissions</h5>
                  {!project.submissions || project.submissions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No proposals submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {project.submissions.map((sub: any) => (
                        <div key={sub.id} className="bg-slate-900 border border-white/10 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-2">
                                {sub.applicantName || sub.name}
                                <span className="text-[10px] text-slate-500 font-normal">{sub.email}</span>
                              </p>
                            </div>
                            {sub.bidAmount && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                Bid: ${sub.bidAmount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap italic bg-slate-950 p-3 rounded-lg border border-white/5 mt-2">
                            "{sub.proposalText}"
                          </p>
                          {sub.portfolioLink && (
                            <a href={sub.portfolioLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-teal-400 hover:underline mt-3 font-semibold">
                              <Globe className="w-3 h-3" /> View Portfolio
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {/* Show More Projects */}
        {hasMoreProjects && filteredProjects.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMoreProjects}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl bg-[#1d2226] border border-[#38434f] text-xs font-bold text-slate-400 hover:text-white hover:border-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      {applyProject && (
        <FreelanceProposalModal
          project={applyProject}
          onClose={() => setApplyProject(null)}
          onSuccess={() => {
            setProjects((prev: any[]) => prev.map(p => p.id === applyProject.id ? { ...p, hasApplied: true } : p));
          }}
        />
      )}

      {/* Post Project Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-sm cursor-pointer" onClick={() => setShowPostModal(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-3xl border border-teal-500/20 max-w-2xl w-full relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-400" />
                    Post Freelance Project
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Let Pakistans top-tier engineering freelancers build your tech stack.</p>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {successToast ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-16 h-16 text-teal-400 mx-auto mb-4 animate-bounce" />
                  <h4 className="font-extrabold text-lg text-white">Project Posted Successfully!</h4>
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-2 leading-relaxed">
                    Your deep-tech contract was loaded onto the active freelance board. Matching technicians have been alerted.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePostProject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RISC-V LLVM Optimization"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company / Client Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Markhor Labs"
                        value={formClient}
                        onChange={(e) => setFormClient(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget Type</label>
                      <select 
                        value={formBudgetType}
                        onChange={(e) => setFormBudgetType(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="Fixed">Fixed Rate</option>
                        <option value="Hourly">Hourly Rate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget Amount</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. $3,500 or PKR 250,000"
                        value={formBudget}
                        onChange={(e) => setFormBudget(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expected Duration</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2 Months or 3 Weeks"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Tech Tag</label>
                      <select
                        value={formPrimaryIndustry}
                        onChange={(e) => setFormPrimaryIndustry(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="AI SaaS">AI SaaS</option>
                        <option value="LLM apps">LLM apps</option>
                        <option value="Chip design">Chip design</option>
                        <option value="Robotics software">Robotics software</option>
                        <option value="SaaS">SaaS General</option>
                        <option value="Deep Tech">Deep Tech</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills (Comma-separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LLVM, C++, RISC-V"
                        value={formSkills}
                        onChange={(e) => setFormSkills(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>

                  {/* Multi tag selection for Secondary Industries */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Secondary Tech Sectors (Multiple selection)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-white/5 text-xs">
                      {Object.values(startupCategories).flat().slice(0, 30).map((tag, idx) => {
                        const isSelected = formSecondaryIndustries.includes(tag);
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => toggleSecondaryIndustry(tag)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                                : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Scope / Technical Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Detail the technical parameters of the contract, APIs to be integrated, testing conditions..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-teal-500/50 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    {submitting ? "Posting Project..." : "Load Contract to Platform Board"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
