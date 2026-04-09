"use client";

import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaRocket, FaLink, FaTag, FaImage, FaListUl } from "react-icons/fa";
import { getToken } from "../utils/auth";

export default function LaunchProjectModal({ isOpen, onClose, onProjectCreated, user }) {
    const [title, setTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [techStack, setTechStack] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return alert("Please log in first");

        setLoading(true);
        try {
            await axios.post(
                "http://localhost:5000/api/projects",
                {
                    title,
                    tagline,
                    description,
                    link,
                    thumbnail,
                    techStack: techStack.split(",").map(s => s.trim()).filter(s => s !== "")
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Reset form
            setTitle("");
            setTagline("");
            setDescription("");
            setLink("");
            setThumbnail("");
            setTechStack("");

            onProjectCreated();
            onClose();
        } catch (err) {
            console.error("Failed to launch project", err);
            alert("Failed to launch project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white dark:bg-[#0A0A0A] rounded-[32px] w-full max-w-xl relative overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0A0A0A] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                            <FaRocket size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Launch a Project</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Showcase your creation to the community</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Project Name</label>
                        <div className="relative">
                            <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. ProConnect, Heroicons, ChatGPT"
                                className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Tagline</label>
                        <input
                            required
                            type="text"
                            placeholder="A short punchy description in 10-12 words"
                            className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                        />
                    </div>

                    {/* Link & Thumbnail Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Project URL</label>
                            <div className="relative">
                                <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input
                                    type="url"
                                    placeholder="https://yourapp.com"
                                    className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Logo URL</label>
                            <div className="relative">
                                <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Link to project logo"
                                    className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white"
                                    value={thumbnail}
                                    onChange={(e) => setThumbnail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Tech Stack (comma separated)</label>
                        <div className="relative">
                            <FaListUl className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input
                                type="text"
                                placeholder="React, Node.js, MongoDB, Tailwind"
                                className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Detailed Description</label>
                        <textarea
                            rows={4}
                            placeholder="Tell the community how you built it and what problems it solves..."
                            className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 border rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-gray-900 dark:text-white resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Submit Section */}
                    <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#0A0A0A] pb-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaRocket />
                                    <span>Ship It!</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
