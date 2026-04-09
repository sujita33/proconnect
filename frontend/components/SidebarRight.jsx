import api from "../lib/api";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaBell, FaSearch } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import StreakMenu from "./StreakMenu";
import NotificationMenu from "./NotificationMenu";
import { getUser } from "../utils/auth";
import { useRouter } from "next/navigation";

export default function SidebarRight({ children }) {
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showStreakMenu, setShowStreakMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);
    const [streakCount, setStreakCount] = useState(0);

    const menuRef = useRef(null);
    const searchRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
        fetchUnreadCount();
        fetchStreakCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get("/notifications");
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const fetchStreakCount = async () => {
        try {
            const res = await api.get("/streak");
            setStreakCount(res.data.streakCount || 0);
        } catch (err) {
            console.error("Failed to fetch streak", err);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            // Close menus if clicking outside
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // We don't auto-close overlays here since they have their own close buttons/structure
                // But usually we want search results to close
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await api.get(`/users/search?query=${searchQuery}`);
                    setSearchResults(res.data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleUserClick = (username) => {
        router.push(`/u/${username}`);
        setShowResults(false);
        setSearchQuery("");
        setIsSearchFocused(false);
    };

    const handleNotificationClick = () => {
        if (showNotificationMenu) {
            setShowNotificationMenu(false);
            fetchUnreadCount();
        } else {
            setShowNotificationMenu(true);
        }
    };

    return (
        <div className="sticky top-0 h-screen flex flex-col border-l border-gray-200 dark:border-gray-800 bg-[#FAFAFA] dark:bg-[#000000] relative transition-colors duration-300">
            {/* Full-Cover Overlays */}
            {showProfileMenu && (
                <div className="absolute top-0 right-0 left-0 z-50">
                    <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} />
                </div>
            )}
            {showStreakMenu && (
                <div className="absolute top-0 right-0 left-0 z-50">
                    <StreakMenu onClose={() => setShowStreakMenu(false)} />
                </div>
            )}
            {showNotificationMenu && (
                <div className="absolute top-0 right-0 left-0 z-50">
                    <NotificationMenu onClose={() => {
                        setShowNotificationMenu(false);
                        fetchUnreadCount(); // Refresh count on close
                    }} />
                </div>
            )}

            {/* Header Part - Matches Main Header */}
            <div className="bg-[#FAFAFA]/95 dark:bg-[#000000]/95 backdrop-blur-md z-30 border-b border-gray-200/50 dark:border-gray-800/50 px-6 h-16 flex items-center flex-none">
                <div className="flex items-center gap-3 w-full" ref={menuRef}>
                    {/* Search Bar Container */}
                    <div className="flex-1 relative" ref={searchRef}>
                        <div className={`flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full px-3 py-2 shadow-sm focus-within:shadow-md focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-all ${isSearchFocused ? 'w-full' : ''}`}>
                            <FaSearch className="text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="ml-2 w-full text-xs outline-none bg-transparent placeholder:text-gray-400 text-gray-700 dark:text-gray-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    setIsSearchFocused(true);
                                    if (searchQuery) setShowResults(true);
                                }}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                {isSearching ? (
                                    <div className="p-4 text-center text-xs text-gray-500">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto py-1">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result._id}
                                                onClick={() => handleUserClick(result.username)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                                    <img
                                                        src={
                                                            (result.profilePicture && result.profilePicture.length > 0 ? result.profilePicture : null) ||
                                                            (result.avatarUrl && result.avatarUrl.length > 0 ? result.avatarUrl : null) ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'User')}&size=128&background=random&bold=true`
                                                        }
                                                        alt={result.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{result.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-500">No users found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions - Hidden when search is focused */}
                    {!isSearchFocused && (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowStreakMenu(true)}
                                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                            >
                                <span className="text-sm font-bold text-orange-400">{streakCount > 0 ? '🔥' : '🥚'}</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{streakCount}</span>
                            </button>

                            <button
                                onClick={handleNotificationClick}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:shadow-sm transition-all"
                            >
                                <FaBell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-black">
                                        {unreadCount > 10 ? "10+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="relative w-9 h-9 rounded-full border border-gray-200 dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-gray-100 dark:hover:ring-white/10 transition-all cursor-pointer"
                                >
                                    {user ? (
                                        <img
                                            src={
                                                (user.profilePic && user.profilePic.length > 0 ? user.profilePic : null) ||
                                                (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=128&background=random&bold=true`
                                            }
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                            <span className="text-xs">?</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content Part */}
            <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16">
                {children}

                {/* Footer Links */}
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 dark:text-gray-500 px-2 font-medium">
                    <span className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Privacy</span> •
                    <span className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Terms</span> •
                    <span className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">About</span> •
                    <span>© {new Date().getFullYear()} ProConnect</span>
                </div>
            </div>
        </div>
    );
}
