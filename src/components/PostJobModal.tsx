"use client";

import React, { useState } from "react";
import { X, Briefcase, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { createJobPosting } from "@/app/actions/jobs";
import { motion } from "framer-motion";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const LOCATION_TYPES = ["On-site", "Remote", "Hybrid"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"];
const INDUSTRIES = ["AI", "SaaS", "Fintech", "Robotics", "Semiconductors", "EdTech", "HealthTech", "AgriTech", "CleanTech", "E-commerce", "Cybersecurity", "Blockchain", "Other"];
const CURRENCIES = ["PKR", "USD", "GBP", "EUR", "AED"];
const PERIODS = ["Monthly", "Annual"];

interface PostJobModalProps {
  onClose: () => void;
  onCreated: (job: any) => void;
  companies: any[];
}

export default function PostJobModal({ onClose, onCreated, companies }: PostJobModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [benInput, setBenInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  const [form, setForm] = useState({
    companyPageId: companies[0]?.id || "",
    title: "", department: "", employmentType: "Full-time", locationType: "On-site",
    location: "", salaryMin: "", salaryMax: "", salaryCurrency: "PKR", salaryPeriod: "Monthly",
    experienceLevel: "Mid", industry: "", description: "",
    applicationDeadline: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const addTag = (val: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const v = val.trim();
    if (v && !list.includes(v)) setList([...list, v]);
    setInput("");
  };

  const canStep1 = form.companyPageId && form.title && form.employmentType && form.locationType && form.location && form.experienceLevel && form.industry;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("skills", JSON.stringify(skills));
    fd.append("requirements", JSON.stringify(requirements));
    fd.append("benefits", JSON.stringify(benefits));

    const res = await createJobPosting(fd);
    setLoading(false);
    if (res.success) {
      onCreated(res.job);
      onClose();
    } else {
      setError(res.error || "Failed to post job.");
    }
  };

  const InputCls = "w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";
  const SelectCls = "w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";
  const Label = ({ children }: { children: React.ReactNode }) => <label className="block text-xs font-bold text-slate-300 mb-1.5">{children}</label>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#1d2226] border border-[#38434f] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-teal-500/10 to-transparent shrink-0">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-black text-white">Post a Job</h2>
          </div>
          <p className="text-[10px] text-slate-500">Step {step} of 2</p>
          <div className="flex gap-1.5 mt-2">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? "bg-teal-500" : "bg-slate-700"}`} />
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {step === 1 && (
            <>
              {companies.length === 0 ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-200">
                  Create a company page first. Jobs must be posted by one of your company pages.
                </div>
              ) : (
                <div>
                  <Label>Posting Company *</Label>
                  <select value={form.companyPageId} onChange={set("companyPageId")} className={SelectCls}>
                    <option value="">Select your company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} — {company.industry}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label>Job Title *</Label>
                <input value={form.title} onChange={set("title")} className={InputCls} placeholder="e.g. Senior ML Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Department</Label>
                  <input value={form.department} onChange={set("department")} className={InputCls} placeholder="Engineering" />
                </div>
                <div>
                  <Label>Industry *</Label>
                  <select value={form.industry} onChange={set("industry")} className={SelectCls}>
                    <option value="">Select</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Employment Type *</Label>
                  <select value={form.employmentType} onChange={set("employmentType")} className={SelectCls}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Experience Level *</Label>
                  <select value={form.experienceLevel} onChange={set("experienceLevel")} className={SelectCls}>
                    {EXPERIENCE_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Work Setting *</Label>
                  <select value={form.locationType} onChange={set("locationType")} className={SelectCls}>
                    {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Location *</Label>
                  <input value={form.location} onChange={set("location")} className={InputCls} placeholder="Lahore or Remote" />
                </div>
              </div>
              {/* Salary */}
              <div>
                <Label>Salary Range <span className="text-slate-500 font-normal">(optional)</span></Label>
                <div className="flex gap-2 items-center">
                  <select value={form.salaryCurrency} onChange={set("salaryCurrency")} className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={form.salaryMin} onChange={set("salaryMin")} type="number" className={InputCls} placeholder="Min" />
                  <span className="text-slate-500 text-xs">–</span>
                  <input value={form.salaryMax} onChange={set("salaryMax")} type="number" className={InputCls} placeholder="Max" />
                  <select value={form.salaryPeriod} onChange={set("salaryPeriod")} className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all">
                    {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {/* Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mb-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(skillInput, skills, setSkills, setSkillInput))}
                    className={InputCls} placeholder="e.g. Python, PyTorch" />
                  <button type="button" onClick={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                    className="px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-300">
                        {s}
                        <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-slate-500 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Job Description *</Label>
                <textarea value={form.description} onChange={set("description")} rows={5}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="Describe the role, responsibilities, team, and what you're looking for..." />
              </div>
              {/* Requirements */}
              <div>
                <Label>Requirements <span className="text-slate-500 font-normal">(one per line)</span></Label>
                <div className="flex gap-2 mb-2">
                  <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(reqInput, requirements, setRequirements, setReqInput))}
                    className={InputCls} placeholder="e.g. 3+ years Python experience" />
                  <button type="button" onClick={() => addTag(reqInput, requirements, setRequirements, setReqInput)}
                    className="px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {requirements.length > 0 && (
                  <ul className="space-y-1">
                    {requirements.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span className="flex-1">{r}</span>
                        <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Benefits */}
              <div>
                <Label>Benefits / Perks <span className="text-slate-500 font-normal">(optional)</span></Label>
                <div className="flex gap-2 mb-2">
                  <input value={benInput} onChange={(e) => setBenInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(benInput, benefits, setBenefits, setBenInput))}
                    className={InputCls} placeholder="e.g. Health insurance, Flexible hours" />
                  <button type="button" onClick={() => addTag(benInput, benefits, setBenefits, setBenInput)}
                    className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {benefits.map((b) => (
                      <span key={b} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400">
                        {b}
                        <button onClick={() => setBenefits(benefits.filter((x) => x !== b))} className="text-emerald-500/50 hover:text-red-400 transition-all"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Deadline */}
              <div>
                <Label>Application Deadline <span className="text-slate-500 font-normal">(optional)</span></Label>
                <input value={form.applicationDeadline} onChange={set("applicationDeadline")} type="date"
                  className="bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3 shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all">Cancel</button>
              <button onClick={() => setStep(2)} disabled={!canStep1}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black transition-all">
                Continue →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all">← Back</button>
              <button onClick={handleSubmit} disabled={loading || !form.description || companies.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><CheckCircle2 className="w-4 h-4" /> Post Job</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
