"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";
import api from "../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationMenu({ onClose }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState({}); // { [userId]: boolean }
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get("/users/me");
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to fetch fresh user data", err);
                setCurrentUser(getUser());
            }
        };

        fetchCurrentUser();
        fetchNotifications();
        markAllRead();
    }, []);

    const markAllRead = async () => {
        try {
            await api.put("/notifications/read-all");
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (e, senderid, isFollowing) => {
        e.preventDefault();
        e.stopPropagation();

        setFollowLoading(prev => ({ ...prev, [senderid]: true }));
        const endpoint = isFollowing ? "unfollow" : "follow";

        try {
            const res = await api.post(`/users/${endpoint}/${senderid}`);

            if (res.status === 200 || res.status === 201) {
                // Update local currentUser state to reflect change immediately
                if (currentUser) {
                    setCurrentUser(prev => ({
                        ...prev,
                        following: !isFollowing
                            ? [...(prev.following || []), senderid]
                            : prev.following.filter(id => id !== senderid)
                    }));
                }

                // Also update notification item state as fallback
                setNotifications(prev => prev.map(n =>
                    n.sender?._id === senderid ? { ...n, isFollowedBack: !isFollowing } : n
                ));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(prev => ({ ...prev, [senderid]: false }));
        }
    };

    const handleClearAll = async () => {
        try {
            await api.delete("/notifications");
            setNotifications([]);
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    // Filter out notifications that don't have a sender (prevents crashes)
    const validNotifications = notifications.filter(n => n.sender);

    return (
        <div className="absolute top-16 right-6 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {validNotifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 px-2 py-1 rounded-md transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : validNotifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <span className="text-2xl">🔕</span>
                        <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {validNotifications.map((notif) => {
                            // Check initialization safely
                            const isFollowing = notif.isFollowedBack || (currentUser && currentUser.following?.includes(notif.sender?._id));

                            return (
                                <div
                                    key={notif._id}
                                    onClick={() => {
                                        onClose();
                                        if (notif.type === 'follow') {
                                            router.push(`/u/${notif.sender?.username}`);
                                        } else if (notif.post) {
                                            router.push(`/post/${notif.post._id || notif.post}`);
                                        }
                                    }}
                                    className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img
                                            src={
                                                (notif.sender?.profilePicture && notif.sender.profilePicture.length > 0 ? notif.sender.profilePicture : null) ||
                                                (notif.sender?.avatarUrl && notif.sender.avatarUrl.length > 0 ? notif.sender.avatarUrl : null) ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'User')}`
                                            }
                                            alt={notif.sender?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            <Link
                                                href={`/u/${notif.sender?.username}`}
                                                className="font-bold hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {notif.sender?.name}
                                            </Link>
                                            <span className="text-gray-500">
                                                {notif.type === 'follow' && " followed you."}
                                                {notif.type === 'like' && " liked your post."}
                                                {notif.type === 'comment' && " commented on your post."}
                                                {notif.type === 'reply' && " replied to your comment."}
                                            </span>
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>

                                        {/* Follow Action Button */}
                                        {notif.type === 'follow' && notif.sender && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={(e) => handleFollowToggle(e, notif.sender._id, isFollowing)}
                                                    disabled={followLoading[notif.sender._id]}
                                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isFollowing
                                                        ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent"
                                                        : "bg-black text-white hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {followLoading[notif.sender._id] ? (
                                                        "..."
                                                    ) : isFollowing ? (
                                                        <>
                                                            <FaCheck size={10} /> Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaUserPlus size={10} /> Follow Back
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
