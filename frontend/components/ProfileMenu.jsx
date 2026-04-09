"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { FaCog, FaSignOutAlt, FaTimes, FaUser } from "react-icons/fa";
import {
  HiOutlineMoon,
  HiOutlineShieldCheck,
  HiOutlineSun,
} from "react-icons/hi2";
import { logout } from "../utils/auth";

export default function ProfileMenu({ user, onClose }) {
  const router = useRouter();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    {
      icon: <FaUser />,
      label: "View Profile",
      link: `/u/${user?.username || user?.name || ""}`,
    },
    {
      icon: <FaCog />,
      label: "Settings",
      sub: "Edit profile, account, notifications, etc.",
      link: "/profile",
    },
    ...(user?.role === "admin"
      ? [
          {
            icon: <HiOutlineShieldCheck />,
            label: "Admin Panel",
            sub: "Manage users, posts, and system stats.",
            link: "/admin",
          },
        ]
      : []),
  ];

  return (
    <div className="w-full bg-white dark:bg-[#0A0A0A] shadow-2xl border-b border-gray-100 dark:border-gray-900 z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Header Controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-50 dark:border-gray-900/50">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-full transition-all active:scale-90 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white group"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <HiOutlineSun
              size={20}
              className="group-hover:rotate-45 transition-transform"
            />
          ) : (
            <HiOutlineMoon
              size={20}
              className="group-hover:-rotate-12 transition-transform"
            />
          )}
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-full transition-all active:scale-90 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <FaTimes />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-5 py-6 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-xl flex-shrink-0 group">
          <img
            src={
              (user?.profilePic && user.profilePic.length > 0
                ? user.profilePic
                : null) ||
              (user?.avatarUrl && user.avatarUrl.length > 0
                ? user.avatarUrl
                : null) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&size=128&background=random&bold=true`
            }
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt="User"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight truncate leading-none">
              {user?.name}
            </h3>
            {user?.verified && (
              <div
                className="text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-full p-0.5"
                title="Verified Member"
              >
                <HiOutlineShieldCheck size={16} />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">
            Manage your digital presence & settings
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="py-2">
        {menuItems.map((item, idx) => {
          const Content = () => (
            <div className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all flex items-start gap-4 group">
              <div className="mt-1 text-gray-400 dark:text-gray-500 text-xl group-hover:text-black dark:group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="min-w-0 border-b border-transparent">
                <span className="text-[15px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors block leading-none mb-1">
                  {item.label}
                </span>
                {item.sub && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate">
                    {item.sub}
                  </p>
                )}
              </div>
            </div>
          );

          return item.link ? (
            <Link
              key={idx}
              href={item.link}
              onClick={onClose}
              className="block"
            >
              <Content />
            </Link>
          ) : (
            <div key={idx} className="block opacity-50 cursor-not-allowed">
              <Content />
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-900/50 mt-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 py-2.5 rounded-xl transition-all w-full active:scale-95"
        >
          <FaSignOutAlt className="text-lg" />
          Log Out
        </button>
      </div>
    </div>
  );
}
