"use client";

import { useState } from "react";
import api from "../lib/api";
import { getUser } from "../utils/auth";

export default function PollCard({ poll, postId }) {
    const [pollData, setPollData] = useState(poll);
    const user = getUser();
    const userId = user?._id || user?.id;

    // Determine which option the user voted for
    const userVoteIndex = pollData?.options.findIndex(opt =>
        opt.voters?.some(v => (v._id || v).toString() === userId?.toString())
    );
    const hasVoted = userVoteIndex !== -1;

    const handleVote = async (optionIndex) => {
        if (!userId) return alert("Please login to vote");

        try {
            const res = await api.put(`/posts/${postId}/vote`, { optionIndex });
            setPollData(res.data);
        } catch (err) {
            console.error("Vote failed:", err);
            console.error("Error response:", err.response?.data);
            alert(`Failed to submit vote: ${err.response?.data?.error || err.message}`);
        }
    };

    if (!pollData || !pollData.question) return null;

    const totalVotes = pollData.options.reduce((sum, opt) => sum + (opt.voters?.length || 0), 0);

    return (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">{pollData.question}</h4>
            <div className="space-y-2">
                {pollData.options.map((option, index) => {
                    const optionVotes = option.voters?.length || 0;
                    const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(1) : 0;
                    const isMyVote = userVoteIndex === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handleVote(index)}
                            className={`w-full p-3 rounded-lg border transition-all text-left relative overflow-hidden ${isMyVote
                                ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-white/5"
                                }`}
                        >
                            {hasVoted && (
                                <div
                                    className={`absolute left-0 top-0 bottom-0 transition-all ${isMyVote ? "bg-green-200/50 dark:bg-green-500/20" : "bg-gray-200 dark:bg-white/10"
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${isMyVote ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                                        {option.text}
                                    </span>
                                    {isMyVote && <span className="text-xs text-green-600 font-bold">(Your vote)</span>}
                                </div>
                                {hasVoted && (
                                    <span className={`text-sm font-bold ${isMyVote ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                                        {percentage}% ({optionVotes})
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            {hasVoted && (
                <p className="text-xs text-gray-900 dark:text-gray-400 mt-3 font-medium">
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"} • Click your vote to undo (or pick another)
                </p>
            )}
        </div>
    );
}
