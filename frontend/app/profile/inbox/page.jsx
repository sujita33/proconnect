"use client";
import React from "react";
import { FaInbox } from "react-icons/fa";

export default function InboxPage() {
    return (
        <div className="p-20 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">
                <FaInbox />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Messaging & Inbox</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
                Private messaging functionality is under development. Soon you'll be able to connect with your peers directly.
            </p>
        </div>
    );
}
