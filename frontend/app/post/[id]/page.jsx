"use client";

import { useEffect, useState, use } from "react";
import Header from "../../../components/Header";
import PostCard from "../../../components/PostCard";
import Link from "next/link";
import { getUser } from "../../../utils/auth"; // Ensure we have user context if needed

export default function PostPage({ params }) {
    // Unwrap params using React.use() - Standard for Next.js 15
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Pass user ID in headers for like status
                const currentUser = getUser();
                const headers = {};
                const userId = currentUser?.id || currentUser?._id;
                if (userId) {
                    headers['x-user-id'] = userId;
                }

                const res = await fetch(`http://localhost:5000/api/posts/${id}`, { headers });

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Post not found");
                    throw new Error("Failed to load post");
                }

                const data = await res.json();
                setPost(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-8 pt-24">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href="/scroll"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        Back to Feed
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Post Unavailable</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Link href="/scroll" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors font-medium text-sm">
                            Go to Feed
                        </Link>
                    </div>
                ) : post ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PostCard post={post} />
                    </div>
                ) : null}
            </main>
        </div>
    );
}
