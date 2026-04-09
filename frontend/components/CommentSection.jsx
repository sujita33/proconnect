"use client";

import { useState } from "react";
import Link from "next/link";
import { getUser } from "../utils/auth";
import { FaPaperPlane, FaReply } from "react-icons/fa";

export default function CommentSection({ postId, initialComments }) {
    const user = getUser();
    const userId = user?._id || user?.id;
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // commentId
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !userId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ text: newComment }),
            });

            if (response.ok) {
                const updatedComments = await response.json();
                setComments(updatedComments);
                setNewComment("");
            } else {
                console.error("Failed to post comment");
            }
        } catch (err) {
            console.error("Comment submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (e, commentId) => {
        e.preventDefault();
        if (!replyText.trim() || !userId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment/${commentId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ text: replyText }),
            });

            if (response.ok) {
                const updatedComments = await response.json();
                setComments(updatedComments);
                setReplyText("");
                setReplyingTo(null);
            } else {
                console.error("Failed to post reply");
            }
        } catch (err) {
            console.error("Reply submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 py-4 bg-gray-50 dark:bg-[#070707] border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
            {/* Comment Input */}
            {userId ? (
                <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                    <img
                        src={
                            (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`
                        }
                        alt={user.name}
                        className="rounded-full w-8 h-8 object-cover border border-gray-200 dark:border-gray-800"
                    />
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 p-1.5 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full disabled:text-gray-300 transition-colors"
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-center text-sm text-gray-500 mb-6">
                    Please <Link href="/login" className="text-purple-600 font-semibold hover:underline">log in</Link> to comment.
                </p>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment, idx) => (
                        <div key={idx} className="space-y-4">
                            {/* Parent Comment */}
                            <div className="flex gap-3 group">
                                <Link href={`/u/${comment.user?.username}`}>
                                    <img
                                        src={
                                            (comment.user?.avatarUrl && comment.user.avatarUrl.length > 0 ? comment.user.avatarUrl : null) ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}`
                                        }
                                        alt={comment.user?.name}
                                        className="rounded-full w-8 h-8 object-cover border border-gray-200 dark:border-gray-800 cursor-pointer"
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-[#111] p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm relative group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <Link href={`/u/${comment.user?.username}`}>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-xs hover:underline cursor-pointer">
                                                    {comment.user?.name}
                                                </span>
                                            </Link>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                                            {comment.text}
                                        </p>
                                    </div>

                                    {/* Action bar for comment */}
                                    <div className="flex items-center gap-4 mt-1 px-1">
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                            className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                                        >
                                            <FaReply size={10} /> Reply
                                        </button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === comment._id && (
                                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder={`Reply to ${comment.user?.name}...`}
                                                className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!replyText.trim() || isSubmitting}
                                                className="text-purple-600 p-1.5 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full disabled:text-gray-300 transition-colors"
                                            >
                                                <FaPaperPlane size={12} />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-11 space-y-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                                    {comment.replies.map((reply, ridx) => (
                                        <div key={ridx} className="flex gap-3 group/reply">
                                            <Link href={`/u/${reply.user?.username}`}>
                                                <img
                                                    src={
                                                        (reply.user?.avatarUrl && reply.user.avatarUrl.length > 0 ? reply.user.avatarUrl : null) ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.name || 'User')}`
                                                    }
                                                    alt={reply.user?.name}
                                                    className="rounded-full w-6 h-6 object-cover border border-gray-100 dark:border-gray-800 cursor-pointer"
                                                />
                                            </Link>
                                            <div className="flex-1">
                                                <div className="bg-gray-50/50 dark:bg-white/5 p-2.5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm relative group-hover/reply:border-gray-200 dark:group-hover/reply:border-gray-700 transition-colors">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <Link href={`/u/${reply.user?.username}`}>
                                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-[11px] hover:underline cursor-pointer">
                                                                {reply.user?.name}
                                                            </span>
                                                        </Link>
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                                            {new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                                                        {reply.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-400 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
