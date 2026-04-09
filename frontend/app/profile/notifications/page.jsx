"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import Link from "next/link";
import { FaUserPlus, FaCheck, FaBell, FaTrashAlt } from "react-icons/fa";
import { getUser } from "../../../utils/auth";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [userRes, notifRes] = await Promise.all([
                    api.get("/users/me"),
                    api.get("/notifications")
                ]);
                setCurrentUser(userRes.data);
                setNotifications(notifRes.data);

                // Mark all as read when viewing full page
                await api.put("/notifications/read-all");
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const handleFollowToggle = async (e, senderid, isFollowing) => {
        e.preventDefault();
        setFollowLoading(prev => ({ ...prev, [senderid]: true }));
        const endpoint = isFollowing ? "unfollow" : "follow";

        try {
            const res = await api.post(`/users/${endpoint}/${senderid}`);
            if (res.status === 200 || res.status === 201) {
                setCurrentUser(prev => ({
                    ...prev,
                    following: !isFollowing
                        ? [...(prev.following || []), senderid]
                        : prev.following.filter(id => id !== senderid)
                }));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(prev => ({ ...prev, [senderid]: false }));
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await api.delete("/notifications");
            setNotifications([]);
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    if (loading) return (
        <div className="p-20 text-center text-gray-400 animate-pulse">
            <FaBell className="mx-auto mb-4 text-3xl opacity-20" />
            <p className="font-medium tracking-tight">Syncing notifications...</p>
        </div>
    );

    const validNotifications = notifications.filter(n => n.sender);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Activity</h1>
                    <p className="text-gray-500 font-medium">Keep track of who's interacting with your profile.</p>
                </div>
                {validNotifications.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
                    >
                        <FaTrashAlt size={12} /> Clear all
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {validNotifications.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <div className="text-4xl mb-4">✨</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Peace and quiet</h2>
                        <p className="text-gray-400">No recent notifications to show here.</p>
                    </div>
                ) : (
                    validNotifications.map((notif) => {
                        const isFollowing = currentUser?.following?.includes(notif.sender?._id);
                        return (
                            <div
                                key={notif._id}
                                className={`group p-6 rounded-[1.5rem] border transition-all hover:shadow-md flex items-center gap-4 ${!notif.read ? 'bg-blue-50/20 border-blue-100 shadow-sm' : 'bg-white border-gray-50'}`}
                            >
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                    <img
                                        src={notif.sender?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name)}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Link href={`/u/${notif.sender?.username}`} className="font-bold text-gray-900 hover:underline">
                                            {notif.sender?.name}
                                        </Link>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {notif.type === 'follow' && "started following your journey."}
                                        {notif.type === 'like' && "liked one of your recent publications."}
                                        {notif.type === 'comment' && "shared their thoughts on your post."}
                                        {notif.type === 'reply' && "responded to your comment."}
                                    </p>
                                </div>

                                {notif.type === 'follow' && (
                                    <button
                                        onClick={(e) => handleFollowToggle(e, notif.sender._id, isFollowing)}
                                        disabled={followLoading[notif.sender._id]}
                                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${isFollowing
                                            ? 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white'
                                            : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200'}`}
                                    >
                                        {followLoading[notif.sender._id] ? "..." : isFollowing ? <><FaCheck fontSize={10} /> Following</> : <><FaUserPlus fontSize={10} /> Follow Back</>}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
