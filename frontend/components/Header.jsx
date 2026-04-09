"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getUser, logout } from "../utils/auth";

export default function Header() {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = getUser();
    setUser(savedUser || null);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 relative">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src="/assets/logo.png"
              alt="ProConnect"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-xl tracking-tight leading-none font-sans">
            ProConnect
          </span>
        </Link>

        {/* Desktop Navigation - Absolutely Centered */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href="/scroll" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Scroll
          </Link>
          {/* <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Jobs
          </Link> */}
          <Link href="/launchpad" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Launchpad
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {/* User Profile / Auth Buttons */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={
                      (user.profilePic && user.profilePic.length > 0 ? user.profilePic : null) ||
                      (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>

              {/* Enhanced Dropdown */}
              {openDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5 dark:ring-white/10">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-white/5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user.email || "user@example.com"}
                    </p>
                  </div>

                  <div className="p-1">
                    <Link
                      href={`/u/${user.username || user.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      View Profile
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      Settings
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUser(null);
                        setOpenDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-black dark:hover:bg-gray-200 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {openMobileMenu && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-md absolute w-full shadow-lg p-4 space-y-4 animate-in slide-in-from-top-2">
          <Link href="/scroll" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setOpenMobileMenu(false)}>Scroll</Link>
          {/* <Link href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setOpenMobileMenu(false)}>Jobs</Link> */}
          <Link href="/launchpad" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setOpenMobileMenu(false)}>Launchpad</Link>
          <hr className="border-gray-100 dark:border-gray-800" />
          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login" className="text-center py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setOpenMobileMenu(false)}>Log In</Link>
              <Link href="/signup" className="text-center py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium" onClick={() => setOpenMobileMenu(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
