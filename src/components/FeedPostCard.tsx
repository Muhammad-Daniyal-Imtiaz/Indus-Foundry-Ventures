"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, X, ThumbsUp, MessageSquare, Repeat2, Send, Globe2, Mail, Phone, User } from "lucide-react";

export default function FeedPostCard({ post }: { post: any }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  let imgs: string[] = [];
  try {
    imgs = JSON.parse(post.imagesJson || "[]");
  } catch (e) {}

  const nextImage = () => setCurrentImage((p) => Math.min(p + 1, imgs.length - 1));
  const prevImage = () => setCurrentImage((p) => Math.max(p - 1, 0));

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours || 1}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="bg-[#1d2226] border border-[#38434f] rounded-lg mb-2 overflow-hidden text-[#e9eaec] font-sans">
      {/* Header */}
      <div className="flex items-start px-4 pt-3 pb-1">
        <img src={post.userAvatar} className="w-12 h-12 rounded-full mr-3 cursor-pointer object-cover" />
        <div className="flex-1 leading-tight">
          <div className="flex flex-col">
             <span className="font-semibold text-[15px] cursor-pointer hover:text-[#0a66c2] hover:underline transition-colors flex items-center gap-1.5">
               {post.userName}
               <span className="text-[#8c959f] font-normal text-sm">• 1st</span>
             </span>
             <span className="text-xs text-[#8c959f] mt-0.5 truncate max-w-[90%] block">{post.userRole} | {post.category}</span>
             <div className="flex items-center text-xs text-[#8c959f] mt-0.5">
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

      {/* Body text */}
      <div className="px-4 py-2 text-sm leading-relaxed text-[#e9eaec]">
         <p className="whitespace-pre-wrap">
           {post.title ? <span className="font-bold block mb-1 text-[15px]">{post.title}</span> : null}
           {post.content}
         </p>
      </div>

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

      {/* Images Carousel - LinkedIn Style */}
      {imgs.length > 0 && (
        <div className="relative w-full bg-[#1b1f23] flex items-center justify-center mt-2 group/carousel">
          <img src={imgs[currentImage]} alt="Post media" className="max-h-[500px] object-contain w-full" />
          
          {imgs.length > 1 && (
            <>
              {currentImage > 0 && (
                 <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 transition-all cursor-pointer border border-white/20 z-10 shadow-lg shadow-black/50">
                   <ChevronLeft className="w-5 h-5" />
                 </button>
              )}
              {currentImage < imgs.length - 1 && (
                 <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 transition-all cursor-pointer border border-white/20 z-10 shadow-lg shadow-black/50">
                   <ChevronRight className="w-5 h-5" />
                 </button>
              )}
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10 border border-white/10">
                 {currentImage + 1} / {imgs.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Social Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[13px] text-[#8c959f] border-b border-[#38434f] mx-2">
         <div className="flex items-center gap-1.5">
           <div className="flex -space-x-1">
             <div className="w-[18px] h-[18px] rounded-full bg-[#0a66c2] flex items-center justify-center ring-[1.5px] ring-[#1d2226]">
               <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
             </div>
           </div>
           <span className="hover:text-[#0a66c2] cursor-pointer hover:underline">{Math.floor(Math.random() * 50) + 5}</span>
         </div>
         <div className="flex gap-2">
            <span className="hover:text-[#0a66c2] cursor-pointer hover:underline">{Math.floor(Math.random() * 20)} comments</span>
            <span>•</span>
            <span className="hover:text-[#0a66c2] cursor-pointer hover:underline">{Math.floor(Math.random() * 10)} reposts</span>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-between text-sm font-semibold text-[#8c959f]">
         <button 
           onClick={() => setLiked(!liked)} 
           className={`flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-md transition-colors cursor-pointer ${liked ? "text-[#0a66c2]" : "hover:bg-[#38434f] hover:text-[#e9eaec]"}`}
         >
           <ThumbsUp className={`w-[18px] h-[18px] ${liked ? "fill-[#0a66c2] text-[#0a66c2]" : ""}`} />
           Like
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
