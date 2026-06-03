"use client";

import React, { useState } from "react";
import { X, Zap, Loader2, CheckCircle2, AlertCircle, Paperclip, Phone } from "lucide-react";
import { applyForJob } from "@/app/actions/jobs";
import { motion, AnimatePresence } from "framer-motion";

interface EasyApplyModalProps {
  job: any;
  onClose: () => void;
}

export default function EasyApplyModal({ job, onClose }: EasyApplyModalProps) {
  const [resumeUrl, setResumeUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!resumeUrl.trim() || !phone.trim()) {
      setError("Resume URL and phone are required.");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("resumeUrl", resumeUrl.trim());
    fd.append("phone", phone.trim());
    if (coverNote.trim()) fd.append("coverNote", coverNote.trim());

    const res = await applyForJob(job.id, fd);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
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
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
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
              {/* Resume URL */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  Resume / Portfolio URL *
                </label>
                <input
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="https://linkedin.com/in/yourprofile or drive link"
                />
                <p className="text-[10px] text-slate-500 mt-1">LinkedIn profile, Google Drive PDF, or portfolio website</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Phone *
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="+92 300 1234567"
                />
              </div>

              {/* Cover Note (optional) */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Cover Note <span className="text-slate-500 font-normal">(Optional, max 280 chars)</span>
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value.slice(0, 280))}
                  rows={3}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="Why you're interested in this role..."
                />
                <p className="text-[10px] text-slate-500 mt-1 text-right">{coverNote.length}/280</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Privacy note */}
              <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 text-[10px] text-slate-500 leading-relaxed">
                ✓ Your contact info will only be shared with {job.companyName}. By applying, you agree to their terms.
              </div>
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
