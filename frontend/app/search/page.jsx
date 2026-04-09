"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FaSearch, FaTimes, FaArrowRight, FaUsers,
    FaEdit, FaBriefcase, FaCube, FaPenNib
} from "react-icons/fa";
import Link from "next/link";
import PostCard from "../../components/PostCard";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("People");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const filters = [
        { name: "People", icon: <FaUsers size={14} /> },
        // { name: "Projects", icon: <FaCube size={14} /> },
        // { name: "Jobs", icon: <FaBriefcase size={14} /> },
        { name: "Posts", icon: <FaEdit size={14} /> },
        // { name: "Articles", icon: <FaPenNib size={14} /> },
    ];

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const endpoint = activeFilter === "People"
                ? `http://localhost:5000/api/users/search?query=${query}`
                : activeFilter === "Posts"
                    ? `http://localhost:5000/api/posts/search?query=${query}`
                    : null;

            if (endpoint) {
                const res = await axios.get(endpoint);
                setResults(res.data);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error("Search error:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when filter changes if query is present
    useEffect(() => {
        if (query.trim()) {
            handleSearch();
        }
    }, [activeFilter]);

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-black/95 backdrop-blur-md z-30 border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center transition-colors">
                <div className="max-w-3xl mx-auto w-full px-4 md:px-8 flex justify-between items-center">
                    <h1 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight transition-colors">
                        Search
                    </h1>
                    <div className="hidden md:flex flex-1 justify-center">
                        {/* Space for future tabs */}
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
                {/* Search Bar Container */}
                <div className="bg-white dark:bg-[#0A0A0A] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 p-3 mb-8 transition-colors">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <FaSearch className="text-gray-900 dark:text-gray-100" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${activeFilter.toLowerCase()}`}
                            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 font-medium placeholder:text-[#94A3B8] dark:placeholder:text-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <FaTimes size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-1 gap-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {filters.map((filter) => (
                                <button
                                    key={filter.name}
                                    onClick={() => setActiveFilter(filter.name)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${activeFilter === filter.name
                                        ? "bg-[#111] dark:bg-white text-white dark:text-black border-[#111] dark:border-white shadow-sm"
                                        : "bg-white dark:bg-white/5 text-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    {filter.icon}
                                    <span>{filter.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-[#00AA4F] hover:bg-[#009243] text-white p-3 rounded-full flex-shrink-0 transition-all active:scale-95 shadow-sm"
                        >
                            <FaArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                                Showing results for "{query}"
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full border border-gray-50 dark:border-gray-800">{results.length} found</span>
                            </h2>

                            {activeFilter === "People" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.map((user) => (
                                        <Link
                                            href={`/u/${user.username}`}
                                            key={user._id}
                                            className="flex items-center gap-4 p-4 bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
                                        >
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                                <img
                                                    src={user.avatarUrl || user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-sm tracking-tight">{user.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                                {user.headline && (
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{user.headline}</p>
                                                )}
                                            </div>
                                            <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                                                <FaArrowRight size={14} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : activeFilter === "Posts" ? (
                                <div className="space-y-4">
                                    {results.map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-[#0A0A0A] shadow-sm rounded-[24px] border border-gray-100 dark:border-gray-800 transition-colors">
                                    <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4 italic">Soon</div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Search for {activeFilter} is coming soon!</p>
                                </div>
                            )}
                        </div>
                    ) : query.trim() ? (
                        <div className="text-center py-20 animate-in fade-in duration-700">
                            <div className="text-6xl mb-4 text-gray-200 dark:text-gray-800">🔍</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                            <p className="text-gray-500 dark:text-gray-400">We couldn't find any {activeFilter.toLowerCase()} matching "{query}"</p>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 italic">Search for something...</h3>
                            <p className="text-gray-400 dark:text-gray-500">Try searching for people, skills, or posts</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
