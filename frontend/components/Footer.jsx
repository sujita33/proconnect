"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative z-10 w-full">
            {/* Footer Background Pattern - Full Width */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Centered Content Container */}
            <div className="relative z-10 w-full max-w-[900px] mx-auto py-20 px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
                    {/* Logo Section - Spans 2 columns for breathing room */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                        <div>
                            <Link href="/">
                                <h2 className="text-4xl font-serif italic text-gray-200 dark:text-gray-800 tracking-tight hover:text-black dark:hover:text-white transition-colors duration-300 cursor-pointer">
                                    ProConnect
                                </h2>
                            </Link>
                            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                                The professional network for builders to show & tell. Connect
                                with the most incredible people in tech.
                            </p>
                        </div>
                    </div>

                    {/* Main Pages */}
                    <div className="pt-2">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                            Platform
                        </h3>
                        <ul className="space-y-3.5">
                            {[
                                { name: "Scroll", href: "/scroll" },
                                { name: "Launchpad", href: "/launchpad" },
                                { name: "Search Post/People", href: "/search" },
                                { name: "Articles", href: "/articles" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-[15px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tools */}
                    <div className="pt-2">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                            Tools
                        </h3>
                        <ul className="space-y-3.5">
                            {[
                                { name: "Verified Credentials", href: "/settings/profile" },
                                { name: "Project Showcase", href: "/launchpad" },
                                { name: "Daily Streaks", href: "/scroll" },
                                { name: "Work Verification", href: "/settings/profile" },
                                { name: "Article Publisher", href: "/articles" },
                                { name: "Public Portfolio", href: "/profile" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-[15px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Row: Copyright & Legal */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-900 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {/* Copyright - Spans 2 columns to align with Logo section */}
                        <div className="md:col-span-2 flex items-center gap-2.5 text-sm text-gray-400 font-medium">
                            <span>© {new Date().getFullYear()}</span>
                            <div className="flex items-center gap-1.5 local-font">
                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-[10px] font-bold">PC</span>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">ProConnect Inc.</span>
                            </div>
                        </div>

                        {/* Resources Links - Spans 2 columns to align with Platform & Tools */}
                        <div className="md:col-span-2 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] font-medium text-gray-500 pt-1">
                            {[
                                { name: "Brand Kit", href: "#" },
                                { name: "Help", href: "#" },
                                { name: "Privacy", href: "#" },
                                { name: "Code of Conduct", href: "#" },
                                { name: "Terms", href: "#" },
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
