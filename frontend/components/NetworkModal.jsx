"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaCheck } from "react-icons/fa";
import { getToken, getUser } from "../utils/auth";

export default function NetworkModal({ userId, startTab = "followers", onClose }) {
    const [activeTab, setActiveTab] = useState(startTab);
    const [data, setData] = useState({ followers: [], following: [] });
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [followLoading, setFollowLoading] = useState({}); // { [userId]: boolean }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch("http://localhost:5000/api/users/me", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setCurrentUser(userData);
                    } else {
                        // Fallback to local storage if API fails, though likely stale
                        setCurrentUser(getUser());
                    }
                } catch (err) {
                    console.error("Failed to fetch fresh user data", err);
                    setCurrentUser(getUser());
                }
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/${userId}/network`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to fetch network:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchNetwork();
    }, [userId]);

    const handleFollowToggle = async (e, targetUser) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) return;

        const targetId = targetUser._id;
        const isFollowing = currentUser.following?.includes(targetId);
        const endpoint = isFollowing ? "unfollow" : "follow";

        setFollowLoading(prev => ({ ...prev, [targetId]: true }));
        const token = getToken();

        try {
            const res = await fetch(`http://localhost:5000/api/users/${endpoint}/${targetId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                // Update local currentUser state to reflect change immediately
                setCurrentUser(prev => ({
                    ...prev,
                    following: isFollowing
                        ? prev.following.filter(id => id !== targetId)
                        : [...(prev.following || []), targetId]
                }));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(prev => ({ ...prev, [targetId]: false }));
        }
    };

    const users = activeTab === "followers" ? data.followers : data.following;
    const myId = currentUser?._id || currentUser?.id;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Network</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeTab === "followers"
                            ? "text-black"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {data.followers.length} Followers
                        {activeTab === "followers" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full mx-12"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeTab === "following"
                            ? "text-black"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {data.following.length} Following
                        {activeTab === "following" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full mx-12"></div>
                        )}
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-1">
                            {users.map((u) => {
                                const isMe = u._id === myId;
                                const isFollowing = currentUser?.following?.includes(u._id);

                                return (
                                    <Link
                                        key={u._id}
                                        href={`/u/${u.username}`}
                                        onClick={onClose}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                    >
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                            <img
                                                src={
                                                    (u.profilePicture && u.profilePicture.length > 0 ? u.profilePicture : null) ||
                                                    (u.avatarUrl && u.avatarUrl.length > 0 ? u.avatarUrl : null) ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}`
                                                }
                                                alt={u.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{u.name}</p>
                                            <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                                        </div>

                                        {!isMe && currentUser && (
                                            <button
                                                onClick={(e) => handleFollowToggle(e, u)}
                                                disabled={followLoading[u._id]}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing
                                                    ? "bg-white border border-gray-300 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 w-[100px]"
                                                    : "bg-black text-white hover:bg-gray-800 border border-transparent w-[80px]"
                                                    }`}
                                            >
                                                {followLoading[u._id] ? (
                                                    "..."
                                                ) : isFollowing ? (
                                                    <span className="group-hover/btn:hidden">Following</span>
                                                ) : (
                                                    "Follow"
                                                )}
                                            </button>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            No {activeTab} yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
