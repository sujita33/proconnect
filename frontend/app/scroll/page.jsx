"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatePostModal from "../../components/CreatePostModal";
import PostCard from "../../components/PostCard";
import { getToken, getUser } from "../../utils/auth";

export default function ScrollPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMediaType, setInitialMediaType] = useState(null);

  // Header States
  const [activeTab, setActiveTab] = useState("feed"); // feed, following

  useEffect(() => {
    const currentUser = getUser();
    const currentToken = getToken();
    setUser(currentUser);
    setToken(currentToken);
    fetchPosts();

    // Listen for "Start Streak" event from Sidebar
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener("openCreatePostModal", handleOpenModal);

    return () =>
      window.removeEventListener("openCreatePostModal", handleOpenModal);
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const currentUser = getUser();
      const headers = {};

      // Send user ID if logged in so backend can return proper like status
      const userId = currentUser?.id || currentUser?._id;
      if (userId) {
        headers["x-user-id"] = userId;
      }

      const endpoint = activeTab === "following" ? "/following" : "";
      const res = await fetch(`http://localhost:5000/api/posts${endpoint}`, {
        headers,
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const openModalWithMediaType = (mediaType) => {
    setInitialMediaType(mediaType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialMediaType(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* STICKY TOP HEADER */}
      <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-[#000000]/95 backdrop-blur-md z-30 border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-3 flex justify-between items-center h-16 transition-colors duration-300">
        {/* Left Title */}
        <div className="w-[150px] md:w-[200px]">
          {/* <h1 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight transition-colors">
            Scrol
          </h1> */}
        </div>

        {/* Center Tabs */}
        <div className="flex-1 flex justify-center">
          <div className="flex bg-white dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar transition-colors">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === "feed"
                  ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
            >
              FEED
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === "following"
                  ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
            >
              FOLLOWING
            </button>
          </div>
        </div>

        {/* Right Spacer for Balance */}
        <div className="w-[150px] md:w-[200px]"></div>
      </div>

      {/* SCROLLABLE CONTENT GRID */}
      <div className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        {/* Create Post Widget */}
        {user ? (
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6 transition-all hover:shadow-md">
            <div className="flex gap-4 items-start">
              <div className="relative w-10 h-10 flex-shrink-0">
                <img
                  src={
                    (user.profilePic && user.profilePic.length > 0
                      ? user.profilePic
                      : null) ||
                    (user.avatarUrl && user.avatarUrl.length > 0
                      ? user.avatarUrl
                      : null) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}`
                  }
                  className="w-full h-full rounded-full object-cover border border-gray-100 dark:border-gray-800"
                  alt="Me"
                />
              </div>
              <div className="flex-1">
                <div
                  className="w-full h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center px-4 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-text mb-3"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="text-gray-400 font-medium">
                    What are you working on?
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModalWithMediaType("image")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                      title="Add Image"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openModalWithMediaType("video")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                      title="Add Video"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openModalWithMediaType("poll")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                      title="Create Poll"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </button>
                    <Link
                      href="/articles/new"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                      title="Write Article"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/articles/new"
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Write Article
                    </Link>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-2xl text-center border border-gray-100 dark:border-gray-800 shadow-sm mb-6 transition-colors">
            <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">
              Join the community
            </p>
            <Link
              href="/login"
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No posts yet.</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onPostCreated={handlePostCreated}
        initialMediaType={initialMediaType}
      />
    </div>
  );
}
