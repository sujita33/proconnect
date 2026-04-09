"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import api from "../../lib/api";

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [autoFill, setAutoFill] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const router = useRouter();

  // ✅ Auto-fetch user data when page loads
  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        const user = res.data;
        if (user.name) {
          const [first, ...rest] = user.name.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }
        if (user.bio) setBio(user.bio);
        if (user.username) setUsername(user.username);
        if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl);
        if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      })
      .catch((err) => console.error("❌ Failed to load user data:", err));
  }, []);

  // ✅ Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAvatarUrl(res.data.url);
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !bio || !username) {
      alert("Please fill in your first name, last name, bio, and username!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/users/me", {
        name: `${firstName.trim()} ${lastName.trim()}`,
        bio: bio.trim(),
        username: username.trim(),
        linkedinUrl: linkedinUrl.trim(),
        avatarUrl: avatarUrl,
      });

      console.log("✅ Profile updated:", res.data);

      // ✅ Update local storage with new user data
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      // ✅ Force reload to update Header
      window.location.href = "/profile";
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Welcome to ProConnect
        </h2>
        <p className="text-center text-gray-500 mb-6">
          First things first, tell us a bit about yourself!
        </p>

        <div className="flex justify-center mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 bg-gray-100 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-green-600 p-1.5 rounded-full border-2 border-white shadow-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First + Last name */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Brief bio <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              maxLength={120}
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="text-right text-xs text-gray-400">
              {bio.length}/120
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              proconnect.io/{username || "your-username"}
            </p>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              LinkedIn profile URL
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://www.linkedin.com/in/your-username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          {/* Autofill checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoFill}
              onChange={(e) => setAutoFill(e.target.checked)}
              className="h-4 w-4 border border-gray-300 rounded cursor-pointer accent-green-600"
            />
            <label className="text-gray-600 text-sm">
              Autofill from LinkedIn & save time (recommended)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Create Profile →"}
          </button>
        </form>
      </div>
    </div>
  );
}
