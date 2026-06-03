"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2, Globe, X as XIcon, Link2, MapPin, Users, Calendar,
  Briefcase, Tag, Sparkles, ChevronRight, Loader2, AlertCircle,
  ExternalLink, Plus, CheckCircle2, Zap, Mail, Download, Paperclip
} from "lucide-react";
import { getCompanyPageBySlug, getCompanySubmissions } from "@/app/actions/company";
import { getAllJobs, deleteJobPosting } from "@/app/actions/jobs";
import EasyApplyModal from "@/components/EasyApplyModal";
import PostJobModal from "@/components/PostJobModal";

const STAGE_COLORS: Record<string, string> = {
  Idea: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Startup: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Growth: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Scale-up": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [page, setPage] = useState<any>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "jobs" | "submissions">("about");
  const [applyJob, setApplyJob] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);

  async function handleDeleteJob(jobId: string) {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    const res = await deleteJobPosting(jobId);
    if (res.success) {
      setJobs(jobs.filter(j => j.id !== jobId));
    } else {
      alert(res.error || "Failed to delete job.");
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pageRes, jobsRes, subRes] = await Promise.all([
        getCompanyPageBySlug(slug),
        getAllJobs(),
        getCompanySubmissions(slug),
      ]);
      
      if (pageRes.success) setPage(pageRes.page);
      if (jobsRes.success) {
        setJobs(jobsRes.jobs.filter((j: any) => j.companySlug === slug));
      }
      if (subRes.success && subRes.submissions) {
        setIsOwner(true);
        setSubmissions(subRes.submissions);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-bold text-lg mb-2">Company Not Found</h2>
          <p className="text-slate-400 text-sm mb-4">This company page doesn't exist or has been removed.</p>
          <Link href="/company" className="bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-bold">Browse Companies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {page.bannerUrl ? (
          <img src={page.bannerUrl} alt="banner" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 via-slate-900 to-indigo-900/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Logo + Identity */}
        <div className="relative -mt-16 mb-4 flex items-end gap-4">
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[var(--background)] bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
            {page.logoUrl ? (
              <img src={page.logoUrl} alt={page.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            ) : (
              <Building2 className="w-10 h-10 text-slate-500" />
            )}
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{page.name}</h1>
              {page.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${STAGE_COLORS[page.stage] || STAGE_COLORS.Startup}`}>
                {page.stage}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">{page.tagline}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold mb-6 pb-6 border-b border-white/5">
          <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-emerald-400" />{page.industry}</span>
          {page.headquarters && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{page.headquarters}</span>}
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-400" />{page.companySize} employees</span>
          {page.founded && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-400" />Founded {page.founded}</span>}
          {jobs.length > 0 && <span className="flex items-center gap-1.5 text-teal-400"><Briefcase className="w-3.5 h-3.5" />{jobs.length} open {jobs.length === 1 ? "role" : "roles"}</span>}
          {/* Social Links */}
          <div className="flex items-center gap-2 ml-auto">
            {page.website && <a href={page.website} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-800 border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"><Globe className="w-3.5 h-3.5" /></a>}
            {page.linkedinUrl && <a href={page.linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-800 border border-white/10 hover:border-blue-500/30 hover:text-blue-400 transition-all"><Link2 className="w-3.5 h-3.5" /></a>}
            {page.twitterUrl && <a href={page.twitterUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-800 border border-white/10 hover:border-sky-500/30 hover:text-sky-400 transition-all"><XIcon className="w-3.5 h-3.5" /></a>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-white/5 mb-6 w-fit">
          <button onClick={() => setActiveTab("about")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "about" ? "bg-[#1d2226] text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white"}`}>
            About
          </button>
          <button onClick={() => setActiveTab("jobs")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "jobs" ? "bg-[#1d2226] text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white"}`}>
            Jobs ({jobs.length})
          </button>
          {isOwner && (
            <button onClick={() => setActiveTab("submissions")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "submissions" ? "bg-[#1d2226] text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white"}`}>
              Submissions ({submissions.length})
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1d2226] border border-[#38434f] rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3">About</h3>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{page.about}</p>
              </div>
              {page.specialties?.length > 0 && (
                <div className="bg-[#1d2226] border border-[#38434f] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {page.specialties.map((s: string) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-300 font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Sidebar summary */}
            <div className="space-y-4">
              <div className="bg-[#1d2226] border border-[#38434f] rounded-xl p-5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Company Info</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Industry</span><span className="text-white font-bold">{page.industry}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Size</span><span className="text-white font-bold">{page.companySize} employees</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Stage</span><span className="text-white font-bold">{page.stage}</span></div>
                  {page.founded && <div className="flex justify-between"><span className="text-slate-400">Founded</span><span className="text-white font-bold">{page.founded}</span></div>}
                  {page.headquarters && <div className="flex justify-between"><span className="text-slate-400">HQ</span><span className="text-white font-bold text-right">{page.headquarters}</span></div>}
                </div>
              </div>
              {jobs.length > 0 && (
                <button onClick={() => setActiveTab("jobs")} className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between hover:bg-emerald-500/15 transition-all group">
                  <div className="text-left">
                    <p className="text-xs font-black text-emerald-400">{jobs.length} Open {jobs.length === 1 ? "Role" : "Roles"}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Click to view all jobs</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="pb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white">Open Roles</h3>
              {isOwner && (
                <button onClick={() => setPostJobOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Post Job
                </button>
              )}
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-xl">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white text-xs font-bold uppercase tracking-wider">No Open Roles</p>
                <p className="text-[11px] text-slate-500 mt-1">Check back soon for new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h4>
                        {job.department && <p className="text-[10px] text-slate-500 mt-0.5">{job.department}</p>}
                      </div>
                      {job.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">Featured</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] font-bold">{job.employmentType}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[9px] font-bold flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{job.location}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[9px] font-bold">{job.experienceLevel}</span>
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <p className="text-xs text-emerald-400 font-bold mb-3">
                        {job.salaryCurrency} {job.salaryMin?.toLocaleString()}{job.salaryMax ? ` – ${job.salaryMax.toLocaleString()}` : "+"} / {job.salaryPeriod}
                      </p>
                    )}
                    
                    {/* Collapsible Details */}
                    {expandedJobId === job.id && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4 text-xs text-slate-300">
                        <div>
                          <h5 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider text-emerald-400">About the Role</h5>
                          <p className="leading-relaxed whitespace-pre-line text-slate-400">{job.description}</p>
                        </div>
                        {job.skills?.length > 0 && (
                          <div>
                            <h5 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider text-emerald-400">Required Skills</h5>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {job.skills.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-semibold text-slate-300">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {job.requirements?.length > 0 && (
                          <div>
                            <h5 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider text-emerald-400">Requirements</h5>
                            <ul className="list-disc pl-4 space-y-1 text-slate-400">
                              {job.requirements.map((req: string, idx: number) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {job.benefits?.length > 0 && (
                          <div>
                            <h5 className="font-bold text-white mb-1.5 uppercase text-[10px] tracking-wider text-emerald-400">Benefits & Perks</h5>
                            <ul className="list-disc pl-4 space-y-1 text-slate-400">
                              {job.benefits.map((ben: string, idx: number) => (
                                <li key={idx}>{ben}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 text-xs font-bold transition-all">
                        {expandedJobId === job.id ? "Hide Details" : "View Description & Details"}
                      </button>
                      <button
                        onClick={() => !job.hasApplied && setApplyJob(job)}
                        disabled={job.hasApplied}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          job.hasApplied
                            ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        }`}>
                        {job.hasApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" /> Easy Apply
                          </>
                        )}
                      </button>
                    </div>
                    {isOwner && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex justify-end gap-2">
                        <button onClick={() => { setEditJob(job); setPostJobOpen(true); }} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-white/10 transition-all">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteJob(job.id)} className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold border border-red-500/20 transition-all">
                          Delete Job
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && isOwner && (
          <div className="pb-12">
            {submissions.length === 0 ? (
              <div className="text-center py-16 bg-[#1d2226] border border-[#38434f] rounded-xl">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white text-xs font-bold uppercase tracking-wider">No Submissions Yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Applications for your company's jobs will show up here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-[#1d2226] border border-[#38434f] rounded-xl p-5 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          {sub.jobTitle}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {sub.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <a href={`mailto:${sub.email}`} className="hover:text-emerald-400 transition-colors underline">{sub.email}</a>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {sub.address}
                        </span>
                        {sub.phone && (
                          <span className="text-slate-500">Phone: {sub.phone}</span>
                        )}
                      </div>
                      {sub.coverNote && (
                        <p className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-white/5 italic max-w-2xl mt-1.5">
                          "{sub.coverNote}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <a href={sub.resumeUrl} target="_blank" rel="noreferrer"
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Open CV
                      </a>
                      {sub.portfolioLink && (
                        <a href={sub.portfolioLink} target="_blank" rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 hover:border-emerald-500/20 text-slate-300 hover:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> Portfolio
                        </a>
                      )}
                      {sub.coverLetterUrl && (
                        <a href={sub.coverLetterUrl} target="_blank" rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 hover:border-purple-500/20 text-slate-300 hover:text-purple-400 text-xs font-bold transition-all flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" /> Cover Letter
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {applyJob && (
        <EasyApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            setJobs((prev: any[]) => prev.map((j) => j.id === applyJob.id ? { ...j, hasApplied: true } : j));
          }}
        />
      )}
      
      {postJobOpen && (
        <PostJobModal
          onClose={() => { setPostJobOpen(false); setEditJob(null); }}
          onCreated={(j) => {
            if (editJob) {
              setJobs(jobs.map((job) => (job.id === j.id ? j : job)));
            } else {
              setJobs([j, ...jobs]);
            }
            setPostJobOpen(false);
            setEditJob(null);
          }}
          companies={[page]}
          editJob={editJob}
        />
      )}
    </div>
  );
}
