"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineHeart, HiOutlineChatBubbleLeft, HiOutlineBookmark, HiOutlineShare } from "react-icons/hi2";
import api from "../../../lib/api";
import { getUser } from "../../../utils/auth";

export default function ArticleDetailPage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        setUser(getUser());
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/articles/${id}`);
            setArticle(res.data);
        } catch (err) {
            console.error("Failed to fetch article", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) return alert("Please log in to like articles");
        try {
            const res = await api.put(`/articles/${id}/like`);
            setArticle({ ...article, likes: res.data });
        } catch (err) {
            console.error("Failed to like article", err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please log in to comment");
        if (!commentText.trim()) return;

        try {
            const res = await api.post(`/articles/${id}/comment`, { text: commentText });
            setArticle({ ...article, comments: res.data });
            setCommentText("");
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard! 🔗");
        }).catch(err => {
            console.error("Failed to copy link", err);
        });
    };

    const handleSave = async () => {
        if (!user) return alert("Please log in to save articles");
        try {
            const res = await api.put(`/articles/${id}/save`);
            setArticle({ ...article, saves: res.data });
            const isSaving = res.data.includes(user.id || user._id);
            alert(isSaving ? "Article saved to your bookmarks! 🔖" : "Article removed from bookmarks.");
        } catch (err) {
            console.error("Failed to save article", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Article not found</h2>
                <Link href="/articles" className="text-green-600 font-bold hover:underline">
                    Back to Articles
                </Link>
            </div>
        );
    }

    const isLiked = article.likes?.includes(user?.id || user?._id);

    return (
        <div className="min-h-screen bg-white dark:bg-[#000000] transition-colors duration-300">
            {/* Top Navigation */}
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-gray-800/50 px-6 h-16 flex items-center">
                <div className="max-w-3xl mx-auto w-full flex justify-between items-center">
                    <Link href="/articles" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group">
                        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleShare}
                            className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                            title="Share Link"
                        >
                            <HiOutlineShare className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            className={`transition-colors p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full ${article.saves?.includes(user?.id || user?._id) ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                            title={article.saves?.includes(user?.id || user?._id) ? "Unsave" : "Save"}
                        >
                            <HiOutlineBookmark className={`w-5 h-5 ${article.saves?.includes(user?.id || user?._id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Article Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        {article.tags?.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                        <span className="text-gray-400 dark:text-gray-500 text-sm ml-auto">
                            {article.readTime} min read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        {article.title}
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {article.subtitle}
                    </p>

                    <div className="flex items-center gap-4 py-6 border-y border-gray-100 dark:border-gray-800/50">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800">
                            <img
                                src={article.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.name || "User")}`}
                                alt={article.author?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{article.author?.name}</p>
                            <p className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 bg-gray-100 dark:bg-gray-900 shadow-xl">
                    <img
                        src={article.coverImage || `https://source.unsplash.com/featured/?technology,digital&sig=${article._id}`}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
                    <div
                        className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{
                            __html: article.content.replace(/\n\n/g, '<br/><br/>')
                        }}
                    />
                </article>

                {/* Interaction Bar */}
                <div className="flex items-center gap-8 py-8 border-t border-gray-100 dark:border-gray-800/50 mb-16">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                        <HiOutlineHeart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="font-bold">{article.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-500">
                        <HiOutlineChatBubbleLeft className="w-6 h-6" />
                        <span className="font-bold">{article.comments?.length || 0}</span>
                    </div>
                </div>

                {/* Comments Section */}
                <section>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                        Comments ({article.comments?.length || 0})
                    </h3>

                    {user && (
                        <form onSubmit={handleComment} className="mb-12">
                            <textarea
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all min-h-[100px] mb-4"
                                placeholder="What are your thoughts?"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm"
                                >
                                    Respond
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-8">
                        {article.comments?.map((comment, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                    <img
                                        src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || "User")}`}
                                        alt={comment.user?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                                            {comment.user?.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
