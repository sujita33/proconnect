"use client";
import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Header from "../../components/Header";
import api from "../../lib/api";
import { saveSession } from "../../utils/auth";
import { auth, googleProvider } from "../../utils/firebase";

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);
      console.log("✅ Login response:", res.data); // Debug log
      console.log("✅ User avatarUrl:", res.data.user?.avatarUrl); // Debug avatarUrl specifically
      saveSession(res.data.user, res.data.token);
      setMessage("✅ Login successful!");
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "❌ Login failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await api.post("/auth/google", { token: idToken });

      saveSession(res.data.user, res.data.token);
      setMessage("✅ Google Login successful!");
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      console.error("Google Login Error:", err);
      setMessage("❌ Google Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#000000] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header/Navbar */}
      <Header />

      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-400 dark:text-gray-500 transition-colors">
            Welcome back!
          </h2>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors">
            Login to your account.
          </p>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md p-8 space-y-3 transition-colors">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-2xl py-2 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center">
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
            <span className="px-3 text-sm text-gray-400 dark:text-gray-600">
              or continue with email
            </span>
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 bg-transparent p-1 focus:outline-none"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible
                      size={20}
                      className="text-gray-500"
                    />
                  ) : (
                    <AiOutlineEye size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gray-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-gray-200 text-white font-semibold py-2 rounded-2xl transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">{message}</p>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-sm mt-6">
          <span className="text-gray-400">
            Don’t have a ProConnect profile?{" "}
          </span>
          <Link
            href="/signup"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline font-medium transition-colors"
          >
            Create One!
          </Link>
        </p>
      </div>
    </div>
  );
}
