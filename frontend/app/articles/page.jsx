"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "../../components/ArticleCard";
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil } from "react-icons/hi2";
import api from "../../lib/api";

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await api.get("/articles");
            setArticles(res.data);
        } catch (err) {
            console.error("Failed to fetch articles", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(
        (a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen">
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-[#000000]/95 backdrop-blur-md z-30 border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-3 h-16 transition-all duration-300">
                <div className="max-w-3xl mx-auto w-full flex justify-between items-center h-full">
                    <h1 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight flex items-center gap-2">
                        <HiOutlinePencil className="text-gray-900 dark:text-white" size={18} />
                        Articles
                    </h1>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/articles/new"
                            className="bg-[#00AA4F] hover:bg-[#009243] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                            Write
                        </Link>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 px-4 md:px-8 py-8 max-w-3xl mx-auto w-full">
                {/* Intro Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Discover knowledge</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500">
                            <HiOutlineMagnifyingGlass />
                            <span>LATEST</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Insights, tutorials, and stories from the ProConnect community.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-[200px] bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0A0A0A] rounded-[24px] border-2 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="text-4xl mb-4">✍️</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No articles found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Be the first to share your insights!</p>
                        <Link
                            href="/articles/new"
                            className="bg-black dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors inline-block"
                        >
                            Write an article
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredArticles.map((article) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
