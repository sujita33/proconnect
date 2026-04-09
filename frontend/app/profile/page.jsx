"use client";
import React, { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import { FaUpload, FaTimes, FaUser, FaJava, FaVuejs, FaGithub, FaCheck } from "react-icons/fa";
import { FaTwitter, FaInstagram, FaFigma, FaProductHunt, FaBehance, FaTiktok, FaYoutube, FaMastodon, FaCode } from "react-icons/fa";
import { SiWellfound, SiThreads, SiJavascript, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiHtml5, SiCss3, SiDocker, SiAmazon, SiGo, SiRust, SiKotlin, SiSwift, SiFlutter, SiMongodb, SiPostgresql, SiTailwindcss, SiGit, SiMysql, SiFirebase, SiSupabase, SiGraphql, SiRedux, SiSvelte, SiAngular, SiCplusplus, SiDotnet, SiPhp, SiRuby, SiLaravel, SiSpring, SiDjango, SiFlask } from "react-icons/si";
import { getSkillIcon, formatDisplayName as utilsFormatDisplayName } from "../../utils/skillUtils";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Form States
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    pronouns: "",
    website: "",
    calendarLink: "",
    skills: [], // New skills array
    resumeUrl: "", // New resume URL
    socialLinks: {
      twitter: "",
      instagram: "",
      figma: "",
      producthunt: "",
      wellfound: "",
      behance: "",
      mastodon: "",
      tiktok: "",
      youtube: "",
      threads: "",
      github: "" // Added GitHub initialization
    }
  });

  // Username Check State
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = unknown, true = available, false = taken
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Search States
  const [locationQuery, setLocationQuery] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]); // Dynamic popular skills

  // Icon Mapping Helper


  // Helper to format raw StackOverflow tags (e.g., "react-native" -> "React Native")
  const formatDisplayName = (rawName) => {
    const overrides = {
      "html": "HTML",
      "css": "CSS",
      "javascript": "JavaScript", "js": "JavaScript",
      "typescript": "TypeScript", "ts": "TypeScript",
      "reactjs": "React", "react": "React",
      "next.js": "Next.js", "nextjs": "Next.js",
      "node.js": "Node.js", "nodejs": "Node.js",
      "vue.js": "Vue.js", "vuejs": "Vue.js",
      "angularjs": "Angular", "angular": "Angular",
      "c#": "C#", "csharp": "C#",
      "c++": "C++", "cpp": "C++",
      "php": "PHP", "sql": "SQL", "aws": "AWS",
      "ui": "UI Design", "ux": "UX Design",
    };

    if (overrides[rawName.toLowerCase()]) return overrides[rawName.toLowerCase()];

    // Default: Title Case and replace hyphens
    return rawName
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Re-introducing popular skills for the "Suggested" section
  // Removed static list, now fetching dynamically

  // Derived state for display
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    // Fetch user data
    api.get("/users/me")
      .then(res => {
        const data = res.data;
        setUser(data);
        // Parse name
        const [first, ...rest] = (data.name || "").split(" ");

        setFormData({
          username: data.username || "",
          firstName: data.firstName || first || "",
          lastName: data.lastName || rest.join(" ") || "",
          bio: data.bio || "",
          location: data.location || "",
          pronouns: data.pronouns || "",
          website: data.website || "",
          calendarLink: data.calendarLink || "",
          socialLinks: {
            twitter: data.socialLinks?.twitter || "",
            instagram: data.socialLinks?.instagram || "",
            figma: data.socialLinks?.figma || "",
            producthunt: data.socialLinks?.producthunt || "",
            wellfound: data.socialLinks?.wellfound || "",
            behance: data.socialLinks?.behance || "",
            mastodon: data.socialLinks?.mastodon || "",
            tiktok: data.socialLinks?.tiktok || "",
            youtube: data.socialLinks?.youtube || "",
            threads: data.socialLinks?.threads || "",
            github: data.socialLinks?.github || ""
          },
          resumeUrl: data.resumeUrl || ""
        });
        setLocationQuery(data.location || "");
        if (data.skills && Array.isArray(data.skills)) {
          setFormData(prev => ({ ...prev, skills: data.skills }));
        }
        setAvatarUrl(data.avatarUrl || data.profilePicture || "");
        setCoverUrl(data.coverUrl || "");
        setSaved(true);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch popular skills from StackOverflow for "Suggested" section
    axios.get("https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=15")
      .then(res => {
        const names = res.data.items.map(item => item.name);
        setSuggestedSkills(names);
      })
      .catch(err => console.error("Failed to fetch popular skills", err));

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const network = name.replace("social_", "");
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [network]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setSaved(false);
  };

  // Location Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationQuery.length > 2) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`
          );
          setLocationSuggestions(res.data);
          setShowLocationSuggestions(true);
        } catch (error) {
          console.error("Location search failed", error);
        }
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  // Skills Search Debounce (StackOverflow API)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (skillQuery.length > 1) { // StackOverflow API works best with at least some chars
        try {
          // Fetch tags from StackOverflow
          const res = await axios.get(
            `https://api.stackexchange.com/2.3/tags?site=stackoverflow&inname=${skillQuery}&pagesize=30&order=desc&sort=popular`
          );
          setSkillSuggestions(res.data.items || []);
          setShowSkillSuggestions(true);
        } catch (error) {
          console.error("Skills search failed", error);
        }
      } else {
        setSkillSuggestions([]);
        setShowSkillSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [skillQuery]);

  // Username Availability Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Only check if length > 2 and it's different from current user's username
      if (formData.username && formData.username.length > 2 && formData.username !== user?.username) {
        setCheckingUsername(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/users/check/${formData.username}`);
          setUsernameAvailable(res.data.available);
        } catch (error) {
          console.error("Username check failed", error);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username, user]);

  const handleLocationChange = (e) => {
    setLocationQuery(e.target.value);
    // Don't set formData immediately if you want them to pick from list, 
    // but typically we allow free text too:
    setFormData(prev => ({ ...prev, location: e.target.value }));
    setSaved(false);
  };

  const selectLocation = (locName) => {
    setLocationQuery(locName);
    setFormData(prev => ({ ...prev, location: locName }));
    setShowLocationSuggestions(false);
    setSaved(false);
  };

  const addSkill = (skill) => {
    // 1. Format the skill first (e.g. "react-native" -> "React Native")
    const formattedSkill = formatDisplayName(skill).trim();

    // 2. Check for duplicates safely (case-insensitive)
    const exists = formData.skills.some(
      s => s.toLowerCase() === formattedSkill.toLowerCase()
    );

    if (formattedSkill && !exists) {
      if (formData.skills.length < 10) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, formattedSkill] }));
        setSkillQuery("");
        setShowSkillSuggestions(false);
        setSaved(false);
      } else {
        alert("You can only add up to 10 skills.");
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
    setSaved(false);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillQuery);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAvatarUrl(res.data.url);
      setSaved(false);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCoverUrl(res.data.url);
      setSaved(false);
    } catch (err) {
      console.error("Cover upload failed", err);
      alert("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation for resume type
    if (!file.type.includes("pdf") && !file.type.includes("document") && !file.type.includes("msword")) {
      alert("Please upload a PDF or Word document.");
      return;
    }

    setUploadingResume(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData(prev => ({ ...prev, resumeUrl: res.data.url }));
      setSaved(false);
    } catch (err) {
      console.error("Resume upload failed", err);
      alert("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = () => {
    if (window.confirm("Are you sure you want to remove your resume?")) {
      setFormData(prev => ({ ...prev, resumeUrl: "" }));
      setSaved(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        ...formData,
        name: fullName,
        avatarUrl,
        coverUrl
      };

      await api.put("/users/me", payload);

      // Update local user if needed
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...payload }));

      setSaved(true);
      setTimeout(() => {
        router.push("/scroll");
      }, 1000);
    } catch (err) {
      console.error("Save failed", err);
      // Show specific error from backend (e.g. "Username is already taken")
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading settings...</div>;

  return (
    <div className="relative pb-24 bg-white dark:bg-black transition-colors min-h-screen">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400">
          <span className="sr-only">Back</span>
          ←
        </button>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Settings</div>
        <div className="text-sm text-gray-300 dark:text-gray-700">→</div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">Profile</div>
      </div>

      <div className="px-8 py-8 space-y-12">

        {/* Basic Profile */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FaUser size={12} /> Basic Profile
          </h3>

          <div className="flex flex-col gap-6 mb-8">
            {/* Cover Upload */}
            <div className="relative group cursor-pointer w-full h-32 md:h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800" onClick={() => coverInputRef.current?.click()}>
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gradient-to-r from-green-400/10 via-blue-500/5 to-purple-600/10">
                  <FaUpload size={20} />
                  <span className="text-xs mt-2 font-bold">Upload Cover Banner</span>
                </div>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm font-bold">
                  Change Banner
                </div>
              </div>
            </div>
            <input type="file" ref={coverInputRef} hidden accept="image/*" onChange={handleCoverUpload} />

            <div className="flex items-start gap-6">
              <div className="relative group cursor-pointer -mt-12 ml-4 md:ml-8" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-black shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <FaUser size={32} />
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-bold text-green-600 dark:text-green-500 group-hover:underline">Update Picture</div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Username <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => {
                    // Only allow lowercase a-z, 0-9, underscores, and dots
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                    setFormData(prev => ({ ...prev, username: val }));
                    setSaved(false);
                  }}
                  className={`w-full border ${usernameAvailable === false ? 'border-red-500 focus:border-red-500' : usernameAvailable === true ? 'border-green-500 focus:border-green-500' : 'border-gray-300 dark:border-gray-800'} bg-white dark:bg-white/5 rounded-lg pl-8 pr-10 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 outline-none transition-colors`}
                  placeholder="username"
                />
                <div className="absolute right-3 top-2.5">
                  {checkingUsername ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : usernameAvailable === true ? (
                    <FaCheck className="text-green-500" size={14} />
                  ) : usernameAvailable === false ? (
                    <FaTimes className="text-red-500" size={14} />
                  ) : null}
                </div>
              </div>
              {usernameAvailable === false && (
                <p className="text-xs text-red-500 mt-1">That username is already taken.</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your public profile URL: localhost:3000/u/{formData.username || 'username'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">First name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Last name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Brief bio <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400 dark:text-gray-500">{formData.bio.length}/120</span>
            </div>
            <textarea
              name="bio"
              maxLength={120}
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none resize-none transition-colors"
            ></textarea>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">This is the very first thing peers read about you after your name.</p>
          </div>

          {/* Resume Upload Section */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Professional Resume</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-white/5">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 flex-shrink-0">
                <FaUpload size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {formData.resumeUrl ? "Resume Uploaded" : "Upload your resume"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formData.resumeUrl ? "Click to change your resume" : "PDF, DOC, or DOCX up to 10MB"}
                </p>
                {formData.resumeUrl && (
                  <a
                    href={formData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 dark:text-green-500 font-bold hover:underline mt-1 inline-block"
                  >
                    View Current Resume
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                {formData.resumeUrl && (
                  <button
                    onClick={handleRemoveResume}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                    title="Remove Resume"
                  >
                    <FaTimes size={16} />
                  </button>
                )}
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                  {uploadingResume ? "Uploading..." : formData.resumeUrl ? "Change File" : "Select File"}
                </button>
              </div>
              <input
                type="file"
                ref={resumeInputRef}
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
            </div>
          </div>

          {/* Location - Searchable */}
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Search Cities / Country"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {locationSuggestions.map((place, idx) => (
                      <div
                        key={place.place_id || idx}
                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 truncate"
                        onMouseDown={(e) => { e.preventDefault(); selectLocation(place.display_name); }}
                      >
                        {place.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Personal pronouns</label>
                <select
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:ring-0 outline-none bg-white dark:bg-white/5 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Calendar link</label>
                <input
                  type="url"
                  name="calendarLink"
                  value={formData.calendarLink}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Add your Cal.com or Calendly URL.</p>
              </div>
            </div>
          </section>
        </section>

        <hr className="border-gray-100 dark:border-gray-900" />

        {/* Profile Tags - Searchable Skills */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            Profile Tags
          </h3>
          <div className="mb-4 relative">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Search skills, tools, roles</label>

            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <span key={skill} className="bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow-sm">
                  {getSkillIcon(skill)}
                  {formatDisplayName(skill)}
                  <button onClick={() => removeSkill(skill)} className="text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 ml-1 transition-colors">
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              placeholder="Type a skill..."
              value={skillQuery}
              onChange={(e) => {
                setSkillQuery(e.target.value);
                setShowSkillSuggestions(true);
              }}
              onFocus={() => setShowSkillSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
              className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              onKeyDown={handleSkillKeyDown}
            />

            {showSkillSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-10">
                {/* Show "Create tag" option if users want to add something not in API */}
                {/* Show "Create tag" option if users want to add something not in API */}
                {/* Show "Create tag" option if users want to add something not in API */}
                {skillQuery && !skillSuggestions.some(s => s.name.toLowerCase() === skillQuery.toLowerCase()) && !formData.skills.some(s => s.toLowerCase() === skillQuery.toLowerCase()) && (
                  <div
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm font-medium text-green-600 border-b border-gray-50 dark:border-gray-900"
                    onMouseDown={(e) => { e.preventDefault(); addSkill(skillQuery); }}
                  >
                    + Create tag "{skillQuery}"
                  </div>
                )}

                {skillSuggestions
                  .filter(item => !formData.skills.some(s => s.toLowerCase() === item.name.toLowerCase()))
                  .map((item, idx) => (
                    <div
                      key={item.name || idx}
                      className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                      onMouseDown={(e) => { e.preventDefault(); addSkill(item.name); }}
                    >
                      {/* Optional: Show icon in search dropdown too */}
                      <span className="opacity-70">{getSkillIcon(item.name)}</span>
                      <span className="font-medium">{formatDisplayName(item.name)}</span>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Suggested Skills</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">Loading suggestions...</div>
                ) : (
                  suggestedSkills
                    .filter(skill => !formData.skills.some(s => s.toLowerCase() === skill.toLowerCase()))
                    .slice(0, 10) // Show top 10
                    .map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                      >
                        {getSkillIcon(skill)}
                        {skill}
                        <span className="text-green-500 font-medium ml-1">+</span>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-100 dark:border-gray-900" />

        {/* Social Links */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            Social Links
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">Note: You only need to add your <span className="text-gray-900 dark:text-white font-bold">username</span>.</p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "twitter", icon: <FaTwitter />, prefix: "twitter.com/" },
              { name: "github", icon: <FaGithub />, prefix: "github.com/" }, // Added GitHub
              { name: "instagram", icon: <FaInstagram />, prefix: "instagram.com/" },
              { name: "figma", icon: <FaFigma />, prefix: "figma.com/@" },
              { name: "producthunt", icon: <FaProductHunt />, prefix: "producthunt.com/@" },
              { name: "wellfound", icon: <SiWellfound />, prefix: "wellfound.com/u/" },
              { name: "behance", icon: <FaBehance />, prefix: "behance.net/" },
              { name: "mastodon", icon: <FaMastodon />, placeholder: "Mastodon URL (full)" }, // No prefix for variable instances
              { name: "tiktok", icon: <FaTiktok />, prefix: "tiktok.com/@" },
              { name: "youtube", icon: <FaYoutube />, prefix: "youtube.com/" },
              { name: "threads", icon: <SiThreads />, prefix: "threads.net/@" },
            ].map((social) => (
              <div
                key={social.name}
                className="flex items-center w-full border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-white/5 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all"
              >
                <div className="text-gray-400 dark:text-gray-500 mr-2.5 flex-shrink-0">
                  {social.icon}
                </div>
                {social.prefix && (
                  <span className="text-gray-400 dark:text-gray-500 text-sm select-none mr-0.5">{social.prefix}</span>
                )}
                <input
                  type="text"
                  name={`social_${social.name}`}
                  value={formData.socialLinks[social.name] || ""}
                  onChange={handleChange}
                  placeholder={social.placeholder || "username"}
                  className="flex-1 min-w-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none bg-transparent"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sticky Footer Save - positioned absolute relative to container */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-900 rounded-b-xl flex justify-end transition-colors">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`font-bold py-2 px-6 rounded-lg transition-all text-sm flex items-center gap-2 ${saved ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-green-600 hover:bg-green-700 text-white"
              }`}
          >
            {saving ? "Saving..." : saved ? (
              <>
                Saved! <span className="text-lg leading-none">✓</span>
              </>
            ) : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
