"use client";

import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Header from "../../components/Header";
import api from "../../lib/api";
import { saveSession } from "../../utils/auth";
import { auth, googleProvider } from "../../utils/firebase";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strong Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("❌ Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).");
      return;
    }

    try {
      // add a temporary username to avoid null conflict
      const res = await api.post("/auth/register", {
        ...formData,
        username: `user_${Date.now()}`, // temporary unique username
      });

      // save token and user in localStorage
      saveSession(res.data.user, res.data.token);
      setMessage("✅ Signup successful!");

      // redirect to complete profile page
      setTimeout(() => {
        window.location.href = "/complete-profile";
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Signup failed! Try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await api.post("/auth/google", { token: idToken });

      saveSession(res.data.user, res.data.token);
      setMessage("✅ Google Signup successful!");
      setTimeout(() => {
        window.location.href = "/complete-profile";
      }, 1000); // Redirect to complete profile if new user?
      // Actually backend handles logic, if user exists it returns user.
      // If we want consistency, we can redirect to home ("/") or check if profile is complete.
      // For now I will match the login behavior but maybe direct to completeprofile if it's a signup flow?
      // Creating a user usually leads to complete profile. I'll stick to completeprofile for signup page flow.
    } catch (err) {
      console.error("Google Signup Error:", err);
      setMessage("❌ Google Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#000000] text-gray-900 dark:text-white transition-colors duration-300">
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-gray-400 dark:text-gray-500 italic transition-colors">Join with your peers.</p>
          <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors">
            Sign up & create your profile.
          </h2>
        </div>

        <div className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md p-8 space-y-3 transition-colors">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-2xl py-2 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </button>

          <div className="my-4 flex items-center">
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
            <span className="px-3 text-sm text-gray-400 dark:text-gray-600">
              or continue with email
            </span>
            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@youremail.com"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              />
            </div>

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
                  placeholder="At least 8 characters."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 bg-transparent p-1 focus:outline-none"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  ) : (
                    <AiOutlineEye size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-gray-200 text-white font-semibold py-2 rounded-2xl transition"
            >
              Continue →
            </button>
          </form>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">{message}</p>
          )}
        </div>

        <p className="text-center text-sm mt-4">
          <span className="text-gray-400 dark:text-gray-500">Already have a profile? </span>
          <Link
            href="/login"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
