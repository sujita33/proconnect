"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import DomeGallery from "../components/DomeGallery";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";

export default function Landing() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    // Redirect logged-in users to /scroll
    const user = getUser();
    if (user) {
      router.push("/scroll");
      return;
    }

    setMounted(true);
    // Fetch recent users
    fetch("http://localhost:5000/api/users/recent")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => console.error("Failed to load users", err));

    // Fetch user count
    fetch("http://localhost:5000/api/users/count")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setUserCount(data.count);
      })
      .catch((err) => console.error("Failed to load user count", err));
  }, []);

  const checkUsername = () => {
    if (!username) return setAvailable(null);
    if (username.length < 3) return setAvailable(false);

    fetch(`http://localhost:5000/api/users/check/${username}`)
      .then((res) => res.json())
      .then((data) => setAvailable(data.available))
      .catch((err) => console.error(err));
  };

  // Create a display list: Real users + placeholders to fill the grid up to 30
  const displayUsers = [
    ...users,
    ...Array.from({ length: Math.max(0, 30 - users.length) }),
  ].slice(0, 30);

  // Use mounted state to prevent hydration mismatch
  // The server renders null, and the client renders null until useEffect runs
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] dark:bg-[#000000] text-gray-900 dark:text-gray-100 flex flex-col items-center transition-colors duration-300">
      {/* Header */}
      <Header />

      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 w-full max-w-[600px]">
        {/* Animated Badge (optional) */}
        <div className="mb-6 inline-flex items-center rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 px-3 py-1 text-sm text-green-800 dark:text-green-400 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2"></span>
          Join the fastest growing network
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-gray-900 dark:text-white">
          <span className="font-serif italic text-gray-700 dark:text-gray-300">
            The Professional Network
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
            for builders to show & tell!
          </span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-md mx-auto leading-relaxed">
          Showcase your work, launch projects, find jobs, and connect with
          incredible people in tech and design.
        </p>

        {/* Username Input Card */}
        <div className="w-full max-w-[440px] mt-10 p-1.5 bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500/50">
          <div className="flex items-center w-full">
            {/* Prefix */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-white/5 rounded-lg mr-2 border border-gray-100 dark:border-gray-800">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={18}
                height={18}
                className="rounded-lg"
              />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-tight">
                proconnect.io/
              </span>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="username"
              className="flex-1 outline-none text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
                )
              }
              onKeyDown={(e) => e.key === "Enter" && checkUsername()}
            />

            {/* Action Button */}
            <button
              onClick={checkUsername}
              className="group flex items-center justify-center ml-2 h-9 w-9 bg-green-600 hover:bg-green-600 text-white rounded-lg transition-all active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="h-6 mt-3 mb-10">
          {available === true && (
            <p className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full inline-block border border-green-100 dark:border-green-500/20">
              🎉 <span className="font-bold">{username}</span> is available!
              Claim it now.
            </p>
          )}
          {available === false && (
            <p className="text-red-500 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full inline-block border border-red-100 dark:border-red-500/20">
              😕 <span className="font-bold">{username}</span> is taken. Try
              another?
            </p>
          )}
          {available === null && !username && (
            <p className="text-gray-400 text-xs font-medium">
              Claim your username before it's too late!
            </p>
          )}
        </div>

        {/* Added Peer Count here to fill space */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] dark:text-white/40">
            Join {userCount > 200 ? "200+" : `${userCount}+`} peers
          </p>
        </div>
      </section>

      {/* Feature Showcase Sections */}
      <section className="relative z-10 w-full max-w-2xl px-6 space-y-23 mb-12">
        {/* Section 1: All your work at one place */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All your work at one place</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              Showcase your proof-of-work from different platforms and keep your ProConnect profile always updated with your latest work.
            </p>
          </div>
          <div
            className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl transition-transform hover:scale-[1.02] duration-500 cursor-pointer bg-white dark:bg-[#0A0A0A]"
            onClick={() => setSelectedImg("/assets/work_grid.png")}
          >
            <Image
              src="/assets/work_grid.png"
              alt="All your work at one place"
              fill
              className="object-contain p-2 md:p-3"
              onError={(e) => {
                e.target.src = "https://placehold.co/800x600/FFFFFF/000000?text=Proof+of+Work+Preview";
              }}
            />
          </div>
        </div>

        {/* Section 2: Resume with Verified Credentials! */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div
            className="order-2 md:order-1 relative aspect-[4/3] rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl transition-transform hover:scale-[1.02] duration-500 cursor-pointer bg-white dark:bg-[#0A0A0A]"
            onClick={() => setSelectedImg("/assets/resume_verified.png")}
          >
            <Image
              src="/assets/resume_verified.png"
              alt="Resume with Verified Credentials!"
              fill
              className="object-contain p-2 md:p-3"
              onError={(e) => {
                e.target.src = "https://placehold.co/800x600/FFFFFF/000000?text=Verified+Resume+Preview";
              }}
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Resume with Verified Credentials!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              Improve your credibility by verifying your workplace, education, and bootcamps you've been part of.
            </p>
          </div>
        </div>

        {/* Section 3: Launchpad */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
            <Image src="/assets/logo.png" width={16} height={16} alt="Logo" />
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Launchpad</span>
          </div>
          <div className="mb-10 w-full max-w-2xl px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Working on a project?</h2>
              <Link href="/launchpad" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
                Launchpad <span className="text-lg">→</span>
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl leading-relaxed">
              If you're building projects and are looking for the first 100 users who will share genuine feedback with you, then launch your projects on ProConnect Launchpad on Monday, every week!
            </p>
          </div>
          <div
            className="w-full relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl transition-all hover:scale-[1.01] hover:shadow-green-500/10 duration-500 cursor-pointer"
            onClick={() => router.push("/launchpad")}
          >
            <Image
              src="/assets/launchpad_preview.png"
              alt="Launchpad"
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x800/000000/FFFFFF?text=Launchpad+Leaderboard+Preview";
              }}
            />
          </div>
        </div>

        {/* Section 4: Scroll */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">
            <Image src="/assets/logo.png" width={16} height={16} alt="Logo" />
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Scroll</span>
          </div>
          <div className="mb-10 w-full max-w-2xl px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Share your work!</h2>
              <Link href="/scroll" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
                Go to Scroll <span className="text-lg">→</span>
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl leading-relaxed">
              This is not your typical content feed. It's a place to show what you are working on, share feedback, ask questions, give answers, share opportunities, and more!
            </p>
          </div>
          <div
            className="w-full relative aspect-[16/10] rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl transition-all hover:scale-[1.01] hover:shadow-green-500/10 duration-500 cursor-pointer bg-white dark:bg-[#0A0A0A]"
            onClick={() => router.push("/scroll")}
          >
            <Image
              src="/assets/scroll_preview.png"
              alt="Scroll"
              fill
              className="object-contain p-2 md:p-3"
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x800/FFFFFF/000000?text=Scroll+Feed+Preview";
              }}
            />
          </div>
        </div>

        {/* Section 5: FAQ / About */}
        <div className="flex flex-col space-y-12 text-left pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">How is ProConnect different from LinkedIn?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              ProConnect is a community for all developers to tech professionals, especially students.
              The platform is built with students and tech professionals in mind, offering a comprehensive profile
              to showcase your work across the internet—whether it's projects, open-source
              contributions, design work, or more.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              ProConnect emphasizes a community-driven experience, promoting knowledge sharing,
              collaboration, and credibility among tech professionals. It also ensures authenticity
              with verified accounts, making it a more niche and purposeful space compared to LinkedIn's
              broader, generalist approach.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What is a ProConnect profile & why do I need one?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              Your work might be spread across GitHub, Dribbble, Medium, and other platforms.
              ProConnect brings everything together into one profile with seamless integrations.
              You can also highlight your verified work experience, education, and bootcamp
              credentials in the Resume section, write articles, and showcase your interests—all on a single page.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">I joined ProConnect, what's next?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              Share what you're working on, learnings, and your projects. You can collaborate with
              other tech professionals by giving feedback, offering help, or even trying out their
              projects. You might also find opportunities to collaborate on different projects.
              Plus, you can discover relevant job opportunities or post a job if you're hiring.
              It's a community of tech professionals where you can network with like-minded individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative z-10 w-full py-16 bg-gray-50/50 dark:bg-white/5 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center px-4">
          <div className="w-full">
            <DomeGallery
              images={users.map((user) => ({
                src:
                  user.profilePicture ||
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.name}`,
                alt: user.name || user.username || "User",
              }))}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="w-full">
        <Footer />
      </div>

      {/* Lightbox Overlay */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl hover:scale-110 transition-transform"
            onClick={() => setSelectedImg(null)}
          >
            &times;
          </button>
          <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[16/10]">
            <Image
              src={selectedImg}
              alt="Enlarged view"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
