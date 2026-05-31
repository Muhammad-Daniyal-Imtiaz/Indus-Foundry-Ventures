"use client";

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";

import { freelanceProjectsData, freelanceProjectsData as initialData, startupCategories, FreelanceProject } from "../data";

export default function FreelancePage() {
  const [projects, setProjects] = useState<FreelanceProject[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Post Freelance Project Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

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

  const handlePostProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: FreelanceProject = {
      id: `f_user_${Date.now()}`,
      title: formTitle,
      client: formClient,
      budget: formBudget,
      budgetType: formBudgetType,
      duration: formDuration,
      primaryIndustry: formPrimaryIndustry,
      secondaryIndustries: formSecondaryIndustries,
      skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
      description: formDesc,
      postedDate: 'Just now'
    };

    setProjects(prev => [newProject, ...prev]);
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
  };

  const toggleSecondaryIndustry = (tag: string) => {
    if (formSecondaryIndustries.includes(tag)) {
      setFormSecondaryIndustries(prev => prev.filter(t => t !== tag));
    } else {
      setFormSecondaryIndustries(prev => [...prev, tag]);
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

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#f8fafc] py-12 px-6 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">

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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-teal-500/50"
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
              <div 
                key={project.id}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-all flex flex-col md:flex-row justify-between gap-6"
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

                <div className="w-full md:w-64 bg-[#0b0f19]/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between shrink-0">
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

                  <button 
                    onClick={() => alert(`Proposal submitted! Indus Foundry Placements pipeline will match your portfolio criteria with ${project.client}.`)}
                    className="w-full mt-6 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Apply for Contract
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

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
                        placeholder="e.g. $2,500 or PKR 200,000"
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
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    Load Contract to Platform Board
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
