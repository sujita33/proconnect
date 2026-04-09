"use client";
import React from "react";
import { FaLock } from "react-icons/fa";

export default function AccountPage() {
    return (
        <div className="p-20 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">
                <FaLock />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Security & Privacy</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
                Advanced account settings, password changes, and privacy controls will be available here shortly.
            </p>
        </div>
    );
}
