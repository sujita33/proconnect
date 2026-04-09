"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import { getUser, getToken } from "../../../utils/auth";
import { FaCheck, FaGithub, FaLink } from "react-icons/fa";
import { FiCalendar, FiMapPin, FiBriefcase, FiFileText, FiGrid } from "react-icons/fi";
import { FaTwitter, FaInstagram, FaLinkedin, FaGlobe } from "react-icons/fa";
import NetworkModal from "../../../components/NetworkModal";
import { getSkillIcon, formatDisplayName } from "../../../utils/skillUtils";
import PostCard from "../../../components/PostCard";
import ArticleCard from "../../../components/ArticleCard";

// Social Icon Helper
const getSocialIcon = (platform) => {
    switch (platform) {
        case "twitter": return <FaTwitter size={18} />;
        case "instagram": return <FaInstagram size={18} />;
        case "linkedin": return <FaLinkedin size={18} />;
        case "github": return <FaGithub size={18} />;
        default: return <FaGlobe size={18} />;
    }
};

// Simplified GitHub Repos Component
const GitHubRepos = ({ username }) => {
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        if (!username) return;
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRepos(data);
            })
            .catch(err => console.error("GitHub fetch error:", err));
    }, [username]);

    if (repos.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map(repo => (
                <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-green-500 dark:hover:border-green-500/50 hover:shadow-sm transition-all bg-white dark:bg-white/5"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2">{repo.name}</h4>
                        <span className="text-xs border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-full text-gray-500 whitespace-nowrap">
                            {repo.visibility || 'public'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-3">{repo.description || "No description available."}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {repo.language && (
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                {repo.language}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <span>⭐</span> {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🍴</span> {repo.forks_count}
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default function PublicProfile() {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    // Network Modal State
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [networkTab, setNetworkTab] = useState("followers");

    // Posts State
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    // Articles State
    const [userArticles, setUserArticles] = useState([]);
    const [savedArticles, setSavedArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(false);

    useEffect(() => {
        const loggedInUser = getUser();
        setCurrentUser(loggedInUser);
    }, []);

    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:5000/api/users/u/${username}`)
            .then((res) => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                // Check if I am following only if I'm logged in and data is loaded
                if (getUser()) {
                    const myId = getUser()._id || getUser().id;
                    // Ensure we check against the list of followers if it exists
                    if (data.followers && data.followers.includes(myId)) {
                        setIsFollowing(true);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to fetch public profile:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [username]);

    // Fetch data when tab changes
    useEffect(() => {
        if (activeTab === 'posts' && user?._id) {
            setPostsLoading(true);
            fetch(`http://localhost:5000/api/posts/user/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setUserPosts(data);
                })
                .catch(err => console.error("Failed to fetch user posts", err))
                .finally(() => setPostsLoading(false));
        } else if (activeTab === 'articles' && user?._id) {
            setArticlesLoading(true);
            fetch(`http://localhost:5000/api/articles`) // We'll filter on frontend or add backend route if needed
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUserArticles(data.filter(a => a.author?._id === user._id || a.author?.id === user._id));
                    }
                })
                .catch(err => console.error("Failed to fetch user articles", err))
                .finally(() => setArticlesLoading(false));
        } else if (activeTab === 'saved' && isMe) {
            setArticlesLoading(true);
            const token = getToken();
            fetch(`http://localhost:5000/api/articles/me/saved`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSavedArticles(data);
                })
                .catch(err => console.error("Failed to fetch saved articles", err))
                .finally(() => setArticlesLoading(false));
        }
    }, [activeTab, user]);

    const handleFollowToggle = async () => {
        if (!currentUser || !user) return;

        setFollowLoading(true);
        const token = getToken();
        const endpoint = isFollowing ? "unfollow" : "follow";

        try {
            const res = await fetch(`http://localhost:5000/api/users/${endpoint}/${user._id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                setIsFollowing(!isFollowing);
                // Update local follower count visually
                setUser(prev => ({
                    ...prev,
                    followers: isFollowing
                        ? prev.followers.filter(id => id !== currentUser._id)
                        : [...(prev.followers || []), currentUser._id]
                }));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(false);
        }
    };

    const openNetworkModal = (tab) => {
        setNetworkTab(tab);
        setShowNetworkModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User not found 😕</h2>
                    <p className="text-gray-500 dark:text-gray-400">The user @{username} does not exist.</p>
                </div>
            </div>
        );
    }

    const isMe = currentUser && (currentUser._id === user._id || currentUser.id === user._id);
    const socialLinks = user.socialLinks || {};

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors">
            <Header />

            <main className="flex-1 flex flex-col items-center pb-8">
                {/* Cover Area */}
                <div className="w-full h-48 md:h-64 relative transition-colors">
                    {user.coverUrl ? (
                        <img
                            src={user.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-green-400/20 via-blue-500/10 to-purple-600/20 dark:from-green-500/10 dark:via-blue-500/5 dark:to-purple-600/10 transition-colors"></div>
                    )}
                </div>

                <div className="w-full max-w-4xl px-4">
                    {/* Identity Section */}
                    <div className="relative -mt-16 md:-mt-20 mb-8 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <div className="relative mb-4 sm:mb-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-[#0A0A0A] shadow-xl bg-white dark:bg-[#111]">
                                <img
                                    src={
                                        (user.profilePicture && user.profilePicture.length > 0 ? user.profilePicture : null) ||
                                        (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`
                                    }
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {user.verified && (
                                <div className="absolute bottom-2 right-2 bg-white dark:bg-black rounded-full p-1 shadow-sm">
                                    <FaCheck className="text-green-500 text-sm" title="Verified" />
                                </div>
                            )}
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 sm:pt-20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">
                                        {user.name}
                                    </h1>
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
                                        {user.bio || "Crafting something amazing..."}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 justify-center sm:justify-end">
                                    {!isMe && currentUser && (
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={followLoading}
                                            className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${isFollowing
                                                ? "bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                                : "bg-green-600 text-white hover:bg-green-700 border border-transparent"
                                                }`}
                                        >
                                            {isFollowing ? "Following" : "Follow"}
                                        </button>
                                    )}
                                    {isMe && (
                                        <button
                                            onClick={() => window.location.href = '/profile'}
                                            className="px-6 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-all border border-gray-200 dark:border-gray-800"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Badges */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6">
                                <button
                                    onClick={() => openNetworkModal("followers")}
                                    className="flex items-center gap-1.5 text-sm group"
                                >
                                    <span className="font-black text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{user.followers?.length || 0}</span>
                                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors lowercase font-medium">followers</span>
                                </button>
                                <button
                                    onClick={() => openNetworkModal("following")}
                                    className="flex items-center gap-1.5 text-sm group"
                                >
                                    <span className="font-black text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{user.following?.length || 0}</span>
                                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors lowercase font-medium">following</span>
                                </button>

                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-2 hidden sm:block"></div>

                                {user.location && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs" title={user.location}>
                                        <FiMapPin className="flex-shrink-0" />
                                        <span className="truncate">{user.location.split(',')[0]}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    <FiCalendar className="flex-shrink-0" />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                </div>
                                {user.website && (
                                    <a
                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500 font-bold hover:underline"
                                    >
                                        <FaLink className="flex-shrink-0" />
                                        <span>Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills Row */}
                    {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-10 overflow-x-auto no-scrollbar">
                            {user.skills.map((skill, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:border-green-500 dark:hover:border-green-500/50 transition-all cursor-default whitespace-nowrap"
                                >
                                    <span className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{getSkillIcon(skill)}</span>
                                    <span>{formatDisplayName(skill)}</span>
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-800 mb-6 transition-colors">
                        <div className="flex gap-8 justify-center">
                            <button
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'work' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                onClick={() => setActiveTab('work')}
                            >
                                WORK
                            </button>
                            <button
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'resume' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                onClick={() => setActiveTab('resume')}
                            >
                                RESUME
                            </button>
                            <button
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'posts' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                POSTS
                            </button>
                            <button
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'articles' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                onClick={() => setActiveTab('articles')}
                            >
                                ARTICLES
                            </button>
                            {isMe && (
                                <button
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'saved' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('saved')}
                                >
                                    SAVED
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'posts' && (
                            <div className="flex flex-col gap-4">
                                {postsLoading ? (
                                    <div className="text-center py-8 text-gray-400 italic">Loading posts...</div>
                                ) : userPosts.length > 0 ? (
                                    userPosts.map(post => (
                                        <PostCard key={post._id} post={post} currentUser={currentUser} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 border-dashed">
                                        <p className="text-gray-400">No posts yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'articles' && (
                            <div className="flex flex-col gap-4">
                                {articlesLoading ? (
                                    <div className="text-center py-8 text-gray-400 italic">Loading articles...</div>
                                ) : userArticles.length > 0 ? (
                                    userArticles.map(article => (
                                        <ArticleCard key={article._id} article={article} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 border-dashed">
                                        <p className="text-gray-400">No articles published yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'saved' && isMe && (
                            <div className="flex flex-col gap-4">
                                {articlesLoading ? (
                                    <div className="text-center py-8 text-gray-400 italic">Loading saved items...</div>
                                ) : savedArticles.length > 0 ? (
                                    savedArticles.map(article => (
                                        <ArticleCard key={article._id} article={article} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 border-dashed">
                                        <p className="text-gray-400">You haven't saved any articles yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'work' && (
                            <div className="flex flex-col gap-8">

                                {/* GitHub Section */}
                                {socialLinks.github && (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaGithub size={24} className="text-gray-900 dark:text-white" />
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">GitHub</h2>
                                        </div>

                                        {/* Contribution Graph (Image based for simplicity) */}
                                        <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-[#111]">
                                            <h3 className="text-sm font-medium text-gray-500 mb-4">Contributions in the last year</h3>
                                            <div className="w-full overflow-x-auto">
                                                <img
                                                    src={`https://ghchart.rshah.org/4faa41/${socialLinks.github}`}
                                                    alt="GitHub Contributions"
                                                    className="min-w-[600px] w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* GitHub Repos (Client-side fetch wrapper would be ideal, but for now specific component logic) */}
                                        <GitHubRepos username={socialLinks.github} />
                                    </div>
                                )}

                                {/* Projects Section */}
                                {user.projects && user.projects.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiGrid size={24} className="text-gray-900 dark:text-white" />
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Projects</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {user.projects.map((project, idx) => (
                                                <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500/50 transition-colors bg-white dark:bg-white/5">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            {project.image ? (
                                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-md bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                                                                    {project.title.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{project.title}</h3>
                                                                {project.link && (
                                                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1">
                                                                        View Project <FaLink size={10} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{project.description}</p>

                                                    {project.tags && project.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-auto">
                                                            {project.tags.slice(0, 3).map((tag, tIdx) => (
                                                                <span key={tIdx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {project.tags.length > 3 && <span className="text-xs text-gray-400">+{project.tags.length - 3}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    !socialLinks.github && (
                                        <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 border-dashed">
                                            <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <FiBriefcase className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <h3 className="text-gray-900 dark:text-gray-100 font-medium">Work & Projects</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hasn't added any work or projects yet.</p>
                                        </div>
                                    )
                                )}

                            </div>
                        )}
                        {activeTab === 'resume' && (
                            <div className="flex flex-col items-center justify-center text-center py-12 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 border-dashed">
                                {user.resumeUrl ? (
                                    <>
                                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-500">
                                            <FiFileText size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Professional Resume</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                                            View {user.name}'s professional experience and qualifications.
                                        </p>
                                        <a
                                            href={user.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition-all shadow-md flex items-center gap-2"
                                        >
                                            <FiFileText /> View Resume
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                            <FiFileText className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-gray-900 dark:text-gray-100 font-medium">Resume</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Resume not available.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Socials - Inspired by Peerlist Bottom Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex justify-center pb-8 transition-colors">
                        <div className="flex gap-4">
                            {/* Render Social Links if they exist */}
                            {Object.entries(socialLinks).map(([platform, handle]) => {
                                if (!handle) return null;
                                // Simple URL builder assumption
                                let url = handle;
                                if (!url.startsWith('http')) {
                                    if (platform === 'twitter') url = `https://twitter.com/${handle}`;
                                    else if (platform === 'instagram') url = `https://instagram.com/${handle}`;
                                    else if (platform === 'github') url = `https://github.com/${handle}`;
                                    else if (platform === 'linkedin') url = handle; // LinkedIn usually full url
                                }

                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
                                        title={platform}
                                    >
                                        {getSocialIcon(platform)}
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Network Modal */}
            {showNetworkModal && (
                <NetworkModal
                    userId={user._id || user.id}
                    startTab={networkTab}
                    onClose={() => setShowNetworkModal(false)}
                />
            )}
        </div>
    );
}
