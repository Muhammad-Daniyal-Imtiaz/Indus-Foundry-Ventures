"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Loader2, CheckCircle2, AlertCircle, Paperclip, User, Mail, MapPin, Globe } from "lucide-react";
import { applyForJob } from "@/app/actions/jobs";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface EasyApplyModalProps {
  job: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EasyApplyModal({ job, onClose, onSuccess }: EasyApplyModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetterUrl, setCoverLetterUrl] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleApply = async () => {
    if (!name.trim() || !email.trim() || !address.trim() || !resumeUrl.trim()) {
      setError("Name, Email, Address, and CV File are required.");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("email", email.trim());
    fd.append("address", address.trim());
    fd.append("resumeUrl", resumeUrl.trim());
    if (portfolioLink.trim()) {
      fd.append("portfolioLink", portfolioLink.trim());
    }
    if (coverLetterUrl.trim()) {
      fd.append("coverLetterUrl", coverLetterUrl.trim());
    }

    const res = await applyForJob(job.id, fd);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(onClose, 2500);
    } else {
      setError(res.error || "Failed to submit application.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#1d2226] border border-[#38434f] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-emerald-400 fill-current" />
            <h2 className="text-base font-black text-white">Easy Apply</h2>
          </div>
          <p className="text-xs text-slate-400">
            <span className="font-bold text-white">{job.title}</span> at {job.companyName}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Job Description Preview */}
          <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl text-left">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">Job Description Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto pr-1">
              {job.description || "No description provided."}
            </p>
            {job.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {job.skills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[9px] text-slate-400 font-semibold">{s}</span>
                ))}
              </div>
            )}
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Application Submitted!</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Your application has been sent to {job.companyName}. They'll review it soon.
              </p>
            </div>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Full Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="Muhammad Daniyal"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="name@domain.com"
                />
              </div>

              {/* Address / Location */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Address / City *
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="e.g. Lahore, Pakistan"
                />
              </div>

              {/* Resume / CV File Upload */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  CV / Resume File *
                </label>
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setResumeUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
                {resumeUrl && <p className="text-[10px] text-slate-400 mt-1">CV loaded successfully.</p>}
              </div>

              {/* Portfolio Link */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Portfolio Website Link
                </label>
                <input
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="https://daniyal.dev"
                />
              </div>

              {/* Cover Letter File Upload */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  Cover Letter File
                </label>
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setCoverLetterUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
                {coverLetterUrl && <p className="text-[10px] text-slate-400 mt-1">Cover letter loaded successfully.</p>}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
