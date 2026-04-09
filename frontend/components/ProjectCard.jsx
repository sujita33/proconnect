"use client";

import React, { useState } from "react";
import api from "../lib/api";
import { FaChevronUp, FaExternalLinkAlt } from "react-icons/fa";
import { getToken, getUser } from "../utils/auth";

export default function ProjectCard({ project, rank, onUpdate }) {
    const user = getUser();
    const token = getToken();
    const [upvoting, setUpvoting] = useState(false);

    const isUpvoted = project.upvotes?.includes(user?.id || user?._id);

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || !token) {
            alert("Please log in to upvote projects!");
            return;
        }

        setUpvoting(true);
        try {
            await api.post(`/projects/${project._id}/upvote`, {});
            onUpdate();
        } catch (err) {
            console.error("Upvote failed", err);
        } finally {
            setUpvoting(false);
        }
    };

    return (
        <div className="group bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 transition-all hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-md flex items-center gap-4 relative">
            {/* Rank */}
            <div className="w-8 text-sm font-bold text-gray-400 dark:text-gray-600 flex-shrink-0">
                #{rank}
            </div>

            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                <img
                    src={project.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.title)}&background=random`}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
                        {project.title}
                    </h3>
                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        >
                            <FaExternalLinkAlt size={12} />
                        </a>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                    {project.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {project.techStack?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                            {tech.toUpperCase()}
                        </span>
                    ))}
                </div>
            </div>

            {/* Upvote Button */}
            <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all ${isUpvoted
                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 shadow-sm"
                    : "bg-white dark:bg-[#0D0D0D] border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 hover:border-green-200 dark:hover:border-green-500/30 hover:bg-gray-50 dark:hover:bg-green-500/5"
                    } ${upvoting ? "opacity-50" : ""}`}
            >
                <FaChevronUp size={14} className={upvoting ? "animate-bounce" : ""} />
                <span className="text-xs font-bold mt-1">{project.upvotes?.length || 0}</span>
            </button>
        </div>
    );
}
