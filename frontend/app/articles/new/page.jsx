"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineTag, HiOutlineClock, HiOutlineDocumentText, HiOutlineArrowUpTray } from "react-icons/hi2";
import api from "../../../lib/api";
import { getUser } from "../../../utils/auth";

export default function NewArticlePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        content: "",
        coverImage: "",
        tags: "",
        readTime: 5,
    });

    useEffect(() => {
        const u = getUser();
        if (!u) {
            router.push("/login?redirect=/articles/new");
        } else {
            setUser(u);
        }
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append("file", file);

            const res = await api.post("/upload", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setFormData((prev) => ({ ...prev, coverImage: res.data.url }));
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return alert("Title and Content are required");

        try {
            setLoading(true);
            const tagsArray = formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean);

            const res = await api.post("/articles", {
                ...formData,
                tags: tagsArray,
            });

            router.push(`/articles/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create article", err);
            alert(err.response?.data?.error || "Failed to create article");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-gray-800/50 px-6 h-16 flex items-center">
                <div className="max-w-3xl mx-auto w-full flex justify-between items-center">
                    <Link href="/articles" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group">
                        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Cancel</span>
                    </Link>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.title || !formData.content}
                        className="bg-[#00AA4F] hover:bg-[#009243] disabled:opacity-50 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95"
                    >
                        {loading ? "Publishing..." : "Publish Article"}
                    </button>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Title Section */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Article Title"
                                    className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white placeholder-gray-200 dark:placeholder-gray-800 focus:outline-none border-none p-0"
                                    value={formData.title}
                                    onChange={handleChange}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    name="subtitle"
                                    placeholder="The subtitle or a short summary..."
                                    className="w-full bg-transparent text-xl text-gray-500 dark:text-gray-400 placeholder-gray-200 dark:placeholder-gray-800 focus:outline-none border-none p-0"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Visual Settings */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HiOutlinePhoto className="w-4 h-4" /> Cover Image
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="text-green-600 hover:text-green-700 font-bold transition-colors flex items-center gap-1"
                                            >
                                                <HiOutlineArrowUpTray className="w-3 h-3" />
                                                {uploading ? "Uploading..." : "Upload from PC"}
                                            </button>
                                        </label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="coverImage"
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                value={formData.coverImage}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {formData.coverImage && (
                                            <div className="mt-2 relative aspect-[21/9] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                                                <img
                                                    src={formData.coverImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <HiOutlineTag className="w-4 h-4" /> Tags (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            placeholder="Tech, Career, Tutorial..."
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            value={formData.tags}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <HiOutlineClock className="w-4 h-4" /> Est. Read Time (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="readTime"
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            value={formData.readTime}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50 dark:border-gray-800/50">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <HiOutlineDocumentText className="w-4 h-4" /> Content
                                </label>
                                <textarea
                                    name="content"
                                    placeholder="Tell your story..."
                                    className="w-full bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-200 dark:placeholder-gray-800 focus:outline-none border-none p-0 min-h-[400px] text-lg leading-relaxed whitespace-pre-wrap"
                                    value={formData.content}
                                    onChange={handleChange}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
