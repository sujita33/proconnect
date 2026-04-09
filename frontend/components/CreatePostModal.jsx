"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaGlobeAmericas, FaImage, FaVideo, FaPoll, FaBook, FaSmile, FaHistory, FaTrash, FaUpload } from "react-icons/fa";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function CreatePostModal({ isOpen, onClose, user, onPostCreated, initialMediaType }) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Media States
    const [showMediaInput, setShowMediaInput] = useState(false);
    const [mediaType, setMediaType] = useState("none"); // 'image', 'video'
    const [mediaUrls, setMediaUrls] = useState([]); // Array for multiple images

    // Poll States
    const [showPollInput, setShowPollInput] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);

    // Category State
    const [category, setCategory] = useState("General");
    const categories = ["General", "Technology", "Design", "Marketing", "Business", "Development", "Education", "Health"];

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Rotating placeholder text
    const placeholders = [
        "What are you working on?",
        "Ask a question to community?",
        "Are you hiring?",
        "Share your thoughts...",
        "What's on your mind?"
    ];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    // Rotate placeholder text every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    // Load Draft on Open
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem("post_draft");
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                setContent(parsed.content || "");
                setTitle(parsed.title || "");
            }

            // Handle initial media type
            if (initialMediaType) {
                if (initialMediaType === 'poll') {
                    setShowPollInput(true);
                    setShowMediaInput(false);
                } else if (initialMediaType === 'image' || initialMediaType === 'video') {
                    setMediaType(initialMediaType);
                    setShowMediaInput(true);
                    setShowPollInput(false);
                }
            }
        } else {
            // Reset when modal closes
            setShowMediaInput(false);
            setShowPollInput(false);
            setMediaType('none');
            setMediaUrls([]);
        }
    }, [isOpen, initialMediaType]);

    const handleEmojiClick = (emojiData) => {
        setContent((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();

            if (mediaType === 'image' || (!showMediaInput && file.type.startsWith('image'))) {
                setMediaUrls(prev => [...prev, data.url].slice(0, 4));
                setMediaType('image');
            } else {
                setMediaUrls([data.url]);
                setMediaType(data.type || 'video');
            }

            // If the user selected the file, we can auto-show the input area or just rely on the preview
            if (!showMediaInput) setShowMediaInput(true);

        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            // Clear input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handlePost = async () => {
        // Validate: need either content or poll
        if (!content && !pollQuestion) return;
        if (pollQuestion && pollOptions.filter(opt => opt.trim()).length < 2) {
            alert("Poll must have at least 2 options");
            return;
        }

        console.log("Attempting to post with user:", user);
        const userId = user?._id || user?.id;

        if (!userId) {
            console.error("User ID is missing from user object:", user);
            alert("You seem to be logged out or have an invalid session. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const body = {
                content,
                mediaUrls,
                mediaType: mediaUrls.length > 0 ? mediaType : 'none',
                category
            };

            // Add poll if present
            if (pollQuestion) {
                body.poll = {
                    question: pollQuestion,
                    options: pollOptions.filter(opt => opt.trim())
                };
            }

            const res = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (onPostCreated) onPostCreated();
            } else {
                const errText = await res.text();
                console.error("Failed to create post. Status:", res.status, "Response:", errText);
                try {
                    const errJson = JSON.parse(errText);
                    alert(`Failed to create post: ${errJson.error || errText}`);
                } catch {
                    alert(`Failed to create post: ${errText}`);
                }
            }

        } catch (e) {
            console.error("Post creation failed (network error?):", e);
            alert("Network error: Failed to create post");
        } finally {
            setLoading(false);
            setContent("");
            setMediaUrls([]);
            setPollQuestion("");
            setPollOptions(["", ""]);
            setShowMediaInput(false);
            setShowPollInput(false);
            localStorage.removeItem("post_draft");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800 transition-colors duration-300">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create Post</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                            {user?.profilePic || user?.avatarUrl ? (
                                <img
                                    src={
                                        (user.profilePic && user.profilePic.length > 0 ? user.profilePic : null) ||
                                        (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
                                    }
                                    alt="User"
                                    className="w-full h-full rounded-full object-cover border border-gray-100 dark:border-gray-800"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            {/* Category Selector */}
                            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${category === cat
                                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                            : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={placeholders[placeholderIndex]}
                                className="w-full text-lg text-gray-900 dark:text-white resize-none outline-none min-h-[100px] placeholder-gray-400 dark:placeholder-gray-600 mt-2 bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Media Input Area */}
                    {showMediaInput && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                    Add {mediaType === 'none' ? 'Media' : mediaType}
                                </span>
                                <button onClick={() => setShowMediaInput(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={""} // We don't use single URL input anymore for multi-upload
                                            onChange={(e) => {
                                                if (e.target.value.trim()) {
                                                    if (mediaType === 'image') {
                                                        if (mediaUrls.length < 4) setMediaUrls(prev => [...prev, e.target.value]);
                                                    } else {
                                                        setMediaUrls([e.target.value]);
                                                    }
                                                }
                                            }}
                                            className="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-black dark:focus:border-gray-600 transition-colors text-sm bg-transparent text-gray-900 dark:text-white"
                                            placeholder={`Paste ${mediaType} URL...`}
                                        />
                                        <p className="text-[10px] text-gray-500">Paste URL and press enter (or just upload below)</p>
                                    </div>
                                    <span className="self-center text-gray-400 dark:text-gray-600 text-sm">OR</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept={mediaType === 'video' ? "video/*" : "image/*"}
                                        multiple={mediaType === 'image'}
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            if (files.length === 0) return;

                                            setUploading(true);
                                            const newUrls = [...mediaUrls];

                                            for (const file of files) {
                                                if (mediaType === 'image' && newUrls.length >= 4) break;
                                                if (mediaType === 'video' && newUrls.length >= 1) break;

                                                const formData = new FormData();
                                                formData.append("file", file);

                                                try {
                                                    const res = await fetch("http://localhost:5000/api/upload", {
                                                        method: "POST",
                                                        body: formData,
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        newUrls.push(data.url);
                                                    }
                                                } catch (err) {
                                                    console.error("Upload error:", err);
                                                }
                                            }

                                            setMediaUrls(newUrls);
                                            setUploading(false);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"></span>
                                        ) : (
                                            <FaUpload size={14} />
                                        )}
                                        Upload
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {mediaUrls.map((url, idx) => (
                                        <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center group">
                                            {mediaType === 'image' ? (
                                                <img src={url} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <video src={url} className="h-full w-full object-cover" />
                                            )}
                                            <button
                                                onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {mediaType === 'image' && mediaUrls.length < 4 && !uploading && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors aspect-video"
                                        >
                                            <FaImage className="text-gray-400" size={24} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Poll Input Area */}
                    {showPollInput && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Create a Poll</span>
                                <button onClick={() => setShowPollInput(false)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <FaTimes size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-black dark:focus:border-gray-600 mb-2 text-gray-900 dark:text-white bg-transparent"
                                placeholder="Ask a question..."
                            />
                            {/* Simple placeholders for options */}
                            <div className="space-y-2">
                                {pollOptions.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...pollOptions];
                                            newOptions[idx] = e.target.value;
                                            setPollOptions(newOptions);
                                        }}
                                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-white/5 text-sm outline-none focus:border-black dark:focus:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                ))}
                                <button
                                    onClick={() => setPollOptions([...pollOptions, ""])}
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Toolbar */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 rounded-b-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setShowMediaInput(true); setMediaType('image'); setShowPollInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${mediaType === 'image' && showMediaInput ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"}`}
                                title="Image"
                            >
                                <FaImage size={18} />
                            </button>
                            <button
                                onClick={() => { setShowMediaInput(true); setMediaType('video'); setShowPollInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${mediaType === 'video' && showMediaInput ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"}`}
                                title="Video"
                            >
                                <FaVideo size={18} />
                            </button>
                            <button
                                onClick={() => { setShowPollInput(true); setShowMediaInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${showPollInput ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"}`}
                                title="Poll"
                            >
                                <FaPoll size={18} />
                            </button>
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Book (Coming Soon)">
                                <FaBook size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : "hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"}`}
                                    title="Emoji"
                                    type="button"
                                >
                                    <FaSmile size={18} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-lg overflow-hidden">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={400} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium ${content.length > 2000 ? "text-red-500" : "text-gray-400"}`}>
                                {content.length}/2000
                            </span>
                            <button
                                onClick={handlePost}
                                disabled={!content && mediaUrls.length === 0 && !pollQuestion}
                                className="px-6 py-2 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200 dark:shadow-none"
                            >
                                {loading ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
