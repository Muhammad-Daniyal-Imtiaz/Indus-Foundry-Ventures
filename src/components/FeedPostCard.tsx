"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send, Globe2, Mail, Phone, User, Lightbulb, Rocket, DollarSign, Users, Building2, Handshake, Loader2 } from "lucide-react";
import { toggleLike, getPostLikes } from "@/app/actions/posts";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  "Idea":                  { bg: "bg-amber-500/10", text: "text-amber-400",  border: "border-amber-500/25",  icon: Lightbulb },
  "MVP":                   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", icon: Rocket },
  "Investment Wanted":     { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/25", icon: DollarSign },
  "Partners Wanted":       { bg: "bg-cyan-500/10",  text: "text-cyan-400",  border: "border-cyan-500/25",   icon: Handshake },
  "Startup Space Wanted":  { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/25", icon: Building2 },
  "Cofounder Wanted":      { bg: "bg-rose-500/10",  text: "text-rose-400",  border: "border-rose-500/25",   icon: Users },
};

export default function FeedPostCard({ post, onLikeUpdated }: { post: any; onLikeUpdated?: (postId: string, likeCount: number, likedByMe: boolean) => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [liking, setLiking] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [likers, setLikers] = useState<{ userId: string; userName: string; userAvatar: string }[]>([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  let imgs: string[] = [];
  try {
    imgs = JSON.parse(post.imagesJson || "[]");
  } catch (e) {}

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours || 1}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const catStyle = CATEGORY_STYLES[post.category] || { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/25", icon: null };
  const CatIcon = catStyle.icon;

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    try {
      const res = await toggleLike(post.id);
      if (res.success) {
        setLiked(res.liked);
        setLikeCount(res.likeCount);
        onLikeUpdated?.(post.id, res.likeCount, res.liked);
      }
    } catch (e) {
      console.error("Failed to toggle like:", e);
    } finally {
      setLiking(false);
    }
  }

  async function handleShowLikers() {
    if (showLikers) {
      setShowLikers(false);
      return;
    }
    setLoadingLikers(true);
    try {
      const res = await getPostLikes(post.id);
      if (res.success) {
        setLikers(res.likes);
      }
    } catch (e) {
      console.error("Failed to load likers:", e);
    } finally {
      setLoadingLikers(false);
      setShowLikers(true);
    }
  }

  return (
    <div className="bg-[#1d2226] border border-[#38434f] rounded-lg mb-2 overflow-hidden text-[#e9eaec] font-sans">
      {/* Header */}
      <div className="flex items-start px-4 pt-3 pb-1">
        <Link href={`/users/${post.userId}`}>
          <img src={post.userAvatar} className="w-12 h-12 rounded-full mr-3 cursor-pointer object-cover hover:ring-2 hover:ring-emerald-500/30 transition-all" />
        </Link>
        <div className="flex-1 leading-tight">
          <div className="flex flex-col">
             <Link href={`/users/${post.userId}`} className="font-semibold text-[15px] cursor-pointer hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1.5">
               {post.userName}
               <span className="text-[#8c959f] font-normal text-sm">• 1st</span>
             </Link>
             <span className="text-xs text-[#8c959f] mt-0.5">{post.userRole}</span>
             {post.category && (
               <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border w-fit ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                 {CatIcon && <CatIcon className="w-3 h-3" />}
                 {post.category}
               </span>
             )}
             <div className="flex items-center text-xs text-[#8c959f] mt-1">
                <span>{timeAgo(post.createdAt)}</span>
                <span className="mx-1">•</span>
                <Globe2 className="w-3 h-3" />
             </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#8c959f]">
           <button className="hover:bg-[#38434f] hover:text-[#e9eaec] p-2 rounded-full transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
           <button className="hover:bg-[#38434f] hover:text-[#e9eaec] p-2 rounded-full transition-colors hidden sm:block"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Body text — clickable to post detail */}
      <Link href={`/feed/${post.id}`} className="block px-4 py-2 text-sm leading-relaxed text-[#e9eaec] hover:bg-white/[0.02] transition-colors cursor-pointer">
         <p className="whitespace-pre-wrap">
           {post.title ? <span className="font-bold block mb-1 text-[15px]">{post.title}</span> : null}
           {post.content}
         </p>
      </Link>

      {/* Contact Info Block */}
      {(post.showContactEmail || post.showContactPhone || post.showContactCountry) && (
        <div className="mx-4 mt-1 mb-2 p-3 bg-slate-900/30 border border-slate-700/40 rounded-lg text-sm text-[#8c959f]">
           <div className="font-bold text-[#e9eaec] text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="w-3 h-3 text-emerald-400"/> Creator Contact Information</div>
           <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              {post.showContactEmail && post.contactEmail && (
                <div className="flex items-center gap-1.5 text-slate-300"><Mail className="w-3.5 h-3.5 text-slate-500" /> {post.contactEmail}</div>
              )}
              {post.showContactPhone && post.contactPhone && (
                <div className="flex items-center gap-1.5 text-slate-300"><Phone className="w-3.5 h-3.5 text-slate-500" /> {post.contactPhone}</div>
              )}
              {post.showContactCountry && post.contactCountry && (
                <div className="flex items-center gap-1.5 text-slate-300"><Globe2 className="w-3.5 h-3.5 text-slate-500" /> {post.contactCountry}</div>
              )}
           </div>
        </div>
      )}

      {/* Images Carousel - LinkedIn Style — clickable to post detail */}
      {imgs.length > 0 && (
        <Link href={`/feed/${post.id}`} className="block relative w-full bg-[#1b1f23] flex items-center justify-center mt-2 group/carousel cursor-pointer">
          <img src={imgs[currentImage]} alt="Post media" className="max-h-[500px] object-contain w-full" />
          
          {imgs.length > 1 && (
            <>
              {currentImage > 0 && (
                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(p => p - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 transition-all cursor-pointer border border-white/20 z-10 shadow-lg shadow-black/50">
                   <ChevronLeft className="w-5 h-5" />
                 </button>
              )}
              {currentImage < imgs.length - 1 && (
                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(p => p + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 transition-all cursor-pointer border border-white/20 z-10 shadow-lg shadow-black/50">
                   <ChevronRight className="w-5 h-5" />
                 </button>
              )}
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10 border border-white/10">
                 {currentImage + 1} / {imgs.length}
              </div>
            </>
          )}
        </Link>
      )}

      {/* Like Count & Likers Dropdown */}
      {likeCount > 0 && (
        <div className="relative mx-4 mt-2">
          <button
            onClick={handleShowLikers}
            className="flex items-center gap-1.5 text-xs text-[#8c959f] hover:text-[#0a66c2] hover:underline transition-colors cursor-pointer"
          >
            <div className="flex -space-x-1">
              <div className="w-[16px] h-[16px] rounded-full bg-[#0a66c2] flex items-center justify-center ring-[1.5px] ring-[#1d2226]">
                <ThumbsUp className="w-2 h-2 text-white fill-white" />
              </div>
            </div>
            <span>{likeCount}</span>
          </button>

          {/* Likers Dropdown */}
          {showLikers && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#1d2226] border border-[#38434f] rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-[#38434f]">
                <p className="text-xs font-bold text-white">{likeCount} {likeCount === 1 ? "Like" : "Likes"}</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {loadingLikers ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  </div>
                ) : likers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8c959f]">No likes yet</div>
                ) : (
                  likers.map((liker) => (
                    <Link key={liker.userId} href={`/users/${liker.userId}`} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#38434f] transition-colors">
                      <img
                        src={liker.userAvatar}
                        alt={liker.userName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-white truncate">{liker.userName}</span>
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowLikers(false)}
                className="w-full p-2 text-center text-[10px] font-bold text-[#8c959f] hover:text-white border-t border-[#38434f] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Social Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[13px] text-[#8c959f] border-b border-[#38434f] mx-2 mt-1">
         <div className="flex items-center gap-1.5">
           {likeCount > 0 && (
             <div className="flex -space-x-1">
               <div className="w-[18px] h-[18px] rounded-full bg-[#0a66c2] flex items-center justify-center ring-[1.5px] ring-[#1d2226]">
                 <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
               </div>
             </div>
           )}
           {likeCount > 0 && <span>{likeCount}</span>}
         </div>
         <div className="flex gap-2">
            <span className="hover:text-[#0a66c2] cursor-pointer hover:underline">0 comments</span>
            <span>•</span>
            <span className="hover:text-[#0a66c2] cursor-pointer hover:underline">0 reposts</span>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-between text-sm font-semibold text-[#8c959f]">
         <button 
           onClick={handleLike}
           disabled={liking}
           className={`flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-md transition-colors cursor-pointer ${liked ? "text-[#0a66c2]" : "hover:bg-[#38434f] hover:text-[#e9eaec]"} ${liking ? "opacity-60" : ""}`}
         >
           {liking ? (
             <Loader2 className="w-[18px] h-[18px] animate-spin" />
           ) : (
             <ThumbsUp className={`w-[18px] h-[18px] ${liked ? "fill-[#0a66c2] text-[#0a66c2]" : ""}`} />
           )}
           {liked ? "Liked" : "Like"}
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-md hover:bg-[#38434f] hover:text-[#e9eaec] transition-colors cursor-pointer">
           <MessageSquare className="w-[18px] h-[18px]" />
           Comment
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-md hover:bg-[#38434f] hover:text-[#e9eaec] transition-colors cursor-pointer hidden sm:flex">
           <Repeat2 className="w-[18px] h-[18px]" />
           Repost
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-md hover:bg-[#38434f] hover:text-[#e9eaec] transition-colors cursor-pointer">
           <Send className="w-[18px] h-[18px] -rotate-12 mt-1" />
           Send
         </button>
      </div>
    </div>
  );
}
