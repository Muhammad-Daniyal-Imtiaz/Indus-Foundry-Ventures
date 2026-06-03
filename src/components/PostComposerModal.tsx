"use client";

import React, { FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createPost } from "@/app/actions/posts";

const categories = [
  "Idea",
  "MVP",
  "Investment Wanted",
  "Partners Wanted",
  "Startup Space Wanted",
  "Cofounder Wanted",
];

type PostComposerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (post: any) => void;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export default function PostComposerModal({ open, onClose, onCreated }: PostComposerModalProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Idea");
  const [images, setImages] = useState<string[]>([]);
  const [showContactEmail, setShowContactEmail] = useState(false);
  const [showContactPhone, setShowContactPhone] = useState(false);
  const [showContactCountry, setShowContactCountry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("Idea");
    setImages([]);
    setShowContactEmail(false);
    setShowContactPhone(false);
    setShowContactCountry(false);
    setError("");
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const availableSlots = Math.max(0, 3 - images.length);
    if (availableSlots === 0) {
      setError("You can upload up to 3 images only.");
      return;
    }

    const files = Array.from(event.target.files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots);

    if (files.length === 0) {
      setError("Please select valid image files.");
      return;
    }

    const uploaded = await Promise.all(files.map(readFileAsDataUrl));
    setImages((current) => [...current, ...uploaded].slice(0, 3));
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please write a title and description for your post.");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("images", JSON.stringify(images));
    formData.append("showContactEmail", String(showContactEmail));
    formData.append("showContactPhone", String(showContactPhone));
    formData.append("showContactCountry", String(showContactCountry));

    const result = await createPost(formData);
    if (result.success && result.post) {
      onCreated(result.post);
      resetForm();
      onClose();
    } else {
      setError(result.error || "Failed to create post.");
    }

    setSubmitting(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <button aria-label="Close composer" onClick={onClose} className="absolute inset-0 cursor-default" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#38434f] bg-[#1d2226] text-white shadow-2xl shadow-black"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#38434f] bg-[#1d2226]/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                  Create a Foundry Post
                </h2>
                <p className="text-xs text-slate-400">Share an idea, MVP, cofounder request, or update.</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!session ? (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <h3 className="text-sm font-black uppercase tracking-wider">Sign in to post</h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-400">
                  Only signed-in builders can publish updates on the Foundry Hub Feed.
                </p>
                <a href="/login?callbackUrl=/feed" className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400">
                  Access Login
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-5 text-xs font-semibold">
                {error && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Title</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g., Seeking Rust Dev for custom blockchain verification"
                      required
                      className="w-full rounded-xl border border-white/5 bg-[#05070c] p-3 font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Post Category</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-full cursor-pointer rounded-xl border border-white/5 bg-[#05070c] p-3 font-bold text-white outline-none transition focus:border-emerald-500/40"
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Description / Update Details</span>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Outline your update, active targets, technical requirements, or offer terms here..."
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/5 bg-[#05070c] p-3 font-semibold leading-relaxed text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40"
                  />
                </label>

                <div className="space-y-2">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Upload Images (Max 3)</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 bg-[#05070c] p-4 text-slate-500 transition hover:border-emerald-500/30 hover:bg-[#0c111d] hover:text-white"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Upload</span>
                    </button>
                    <input ref={fileInputRef} type="file" onChange={handleImageUpload} multiple accept="image/*" className="hidden" />

                    {images.map((image, index) => (
                      <div key={`${image}-${index}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                        <img src={image} alt={`Upload preview ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 rounded-lg bg-red-500 p-1 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {images.length === 0 && (
                      <div className="flex h-24 min-w-40 items-center justify-center rounded-xl border border-white/5 bg-slate-950/30 px-4 text-center text-[11px] text-slate-500">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Optional media preview
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-white/5 bg-slate-900/50 p-4">
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Include Contact Information</span>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">Toggle these to display your profile details publicly on this post.</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {[
                      ["email", "Show Email", showContactEmail, setShowContactEmail],
                      ["phone", "Show Phone", showContactPhone, setShowContactPhone],
                      ["country", "Show Country", showContactCountry, setShowContactCountry],
                    ].map(([key, label, checked, setter]) => (
                      <label key={key as string} className="group flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked as boolean}
                          onChange={(event) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)}
                          className="hidden"
                        />
                        <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${(checked as boolean) ? "border-emerald-500 bg-emerald-500" : "border-slate-600 group-hover:border-slate-400"}`}>
                          {(checked as boolean) && <Check className="h-3 w-3 text-slate-950" />}
                        </div>
                        <span className={`text-xs font-bold ${(checked as boolean) ? "text-white" : "text-slate-400"}`}>{label as string}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-xs font-black uppercase text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Submit Post</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
