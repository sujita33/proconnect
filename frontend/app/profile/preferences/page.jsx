"use client";
import React from "react";
import { FaBriefcase } from "react-icons/fa";

export default function PreferencesPage() {
    return (
        <div className="p-20 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">
                <FaBriefcase />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Preferences</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
                Set up your career goals and preferences here. We'll use these to recommend the best opportunities for you.
            </p>
        </div>
    );
}
