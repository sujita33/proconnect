"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaEllipsisH,
  FaRegCommentDots,
  FaRegThumbsUp,
  FaShare,
  FaTrash,
  FaFlag,
  FaBookmark,
  FaRegBookmark,
  FaTimes
} from "react-icons/fa";
import { getUser } from "../utils/auth";
import CommentSection from "./CommentSection";
import ReportModal from "./ReportModal";
import PollCard from "./PollCard";

export default function PostCard({ post }) {
  const user = getUser();

  // Check if user has liked this post - handle both _id and id fields
  const userId = user?._id || user?.id;
  const [liked, setLiked] = useState(
    userId
      ? post.likes.some((likeId) => likeId.toString() === userId.toString())
      : false
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const MAX_CHAR_LIMIT = 280;
  const isContentLong = post.content?.length > MAX_CHAR_LIMIT;
  const displayedContent = isExpanded ? post.content : post.content?.slice(0, MAX_CHAR_LIMIT) + (isContentLong ? "..." : "");

  const handleLike = async () => {
    if (!user || !userId) return alert("Please log in to like.");

    const wasLiked = liked;

    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: "PUT",
        headers: { "x-user-id": userId },
      });
    } catch (err) {
      console.error("Like failed", err);
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: { "x-user-id": userId },
        }
      );

      if (response.ok) {
        alert("Post deleted successfully!");
        window.location.reload(); // Refresh to update the feed
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete post");
    }
  };

  const handleReport = async (reason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setShowMenu(false);
        return true;
      } else {
        alert("Failed to report post");
        return false;
      }
    } catch (err) {
      console.error("Report failed", err);
      return false;
    }
  };

  if (!post.author) return null;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden font-sans hover:shadow-md transition-all">
      {/* Post Header */}
      <div className="p-4 flex gap-3">
        <Link href={`/u/${post.author.username}`}>
          <img
            src={
              (post.author.avatarUrl && post.author.avatarUrl.length > 0 ? post.author.avatarUrl : null) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || 'User')}`
            }
            alt={post.author.name}
            className="rounded-full w-10 h-10 object-cover border border-gray-100 dark:border-gray-800 cursor-pointer"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/u/${post.author.username}`}>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:underline cursor-pointer truncate transition-colors">
                  {post.author.name}
                </h3>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {post.author.headline || `@${post.author.username}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>

              {/* Three-dot menu - only show if user is the author */}
              {userId && post.author._id?.toString() === userId.toString() && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <FaEllipsisH className="text-gray-500 dark:text-gray-400" size={14} />
                  </button>

                  {showMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />

                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-1 bg-white dark:bg-[#111] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-20 min-w-[150px]">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleDelete();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <FaTrash size={12} />
                          Delete Post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Show report for non-authors */}
              {userId && post.author._id?.toString() !== userId.toString() && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <FaEllipsisH className="text-gray-500 dark:text-gray-400" size={14} />
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 mt-1 bg-white dark:bg-[#111] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-20 min-w-[150px]">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowReportModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <FaFlag className="text-red-500" size={12} />
                          Report Post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        {post.title && (
          <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white transition-colors">{post.title}</h2>
        )}
        <p className="text-[15px] text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed transition-colors">
          {displayedContent}
          {isContentLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-green-600 dark:text-green-400 font-semibold hover:underline"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </p>
      </div>

      {/* Post Media */}
      {(post.mediaUrls?.length > 0 || (post.mediaUrl && post.mediaUrl !== "none")) && (
        <div className="mt-3 px-4 relative w-full">
          {post.mediaType === "video" ? (
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
              <video
                src={post.mediaUrls?.[0] || post.mediaUrl}
                controls
                controlsList="nodownload"
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          ) : (
            <div className={`grid gap-2 ${(post.mediaUrls?.length || 1) === 1 ? "grid-cols-1" :
              (post.mediaUrls?.length) === 2 ? "grid-cols-2" :
                (post.mediaUrls?.length) >= 3 ? "grid-cols-2" : ""
              }`}>
              {(post.mediaUrls?.length > 0 ? post.mediaUrls : [post.mediaUrl]).map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-full cursor-zoom-in rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 group ${(post.mediaUrls?.length || 1) === 1 ? "h-[300px] sm:h-[400px]" :
                    (post.mediaUrls?.length) === 2 ? "h-[200px] sm:h-[300px]" :
                      (post.mediaUrls?.length) === 3 && idx === 0 ? "h-[400px] row-span-2" :
                        "h-[200px]"
                    }`}
                >
                  <Image
                    src={url}
                    alt={`Post content ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Poll */}
      {post.poll && <PollCard poll={post.poll} postId={post._id || post.id} />}

      {/* Tags */}
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {post.category && (
          <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-100 dark:border-purple-800 transition-colors">
            {post.category}
          </span>
        )}
        {[...(post.skills || []), ...(post.technologies || [])].map(
          (tag, idx) => (
            <span
              key={idx}
              className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100 dark:border-gray-800"
            >
              #{tag}
            </span>
          )
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center gap-6 mt-2 border-t border-gray-50 dark:border-gray-900/50 bg-white dark:bg-[#0A0A0A] transition-colors">
        <button
          onClick={handleLike}
          className={`group flex items-center gap-2 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          <span className="transform group-active:scale-125 transition-transform duration-200">
            <FaRegThumbsUp className={liked ? "fill-current" : ""} />
          </span>
          <span className="text-xs">{likeCount || 0}</span>
        </button>

        <button
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${showComments ? "text-purple-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          onClick={() => setShowComments(!showComments)}
        >
          <FaRegCommentDots size={18} />
          <span className="text-xs">
            {(post.comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
          </span>
        </button>

        <button
          className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.origin + `/post/${post._id}`
            );
            alert("Link copied to clipboard!");
          }}
        >
          <FaShare size={16} />
          <span className="text-xs">Share</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection postId={post._id} initialComments={post.comments} />
      )}

      {/* Professional Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        postId={post._id}
      />
      {/* Lightbox Overlay */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[110]"
            onClick={() => setSelectedImageIndex(null)}
          >
            <FaTimes size={28} />
            <span className="sr-only">Close</span>
          </button>

          {/* Navigation */}
          {post.mediaUrls?.length > 1 && (
            <>
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] p-2 bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => (prev === 0 ? post.mediaUrls.length - 1 : prev - 1));
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] p-2 bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => (prev === post.mediaUrls.length - 1 ? 0 : prev + 1));
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={(post.mediaUrls?.length > 0 ? post.mediaUrls : [post.mediaUrl])[selectedImageIndex]}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              alt="Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
