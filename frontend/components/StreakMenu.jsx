import api from "../lib/api";
import { useState, useEffect } from "react";
import { FaFire } from "react-icons/fa";

export default function StreakMenu({ onClose }) {
    const [streakData, setStreakData] = useState({
        streakCount: 0,
        longestStreak: 0,
        lastPostDate: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStreak();
    }, []);

    const fetchStreak = async () => {
        try {
            const res = await api.get("/streak");
            setStreakData(res.data);
        } catch (err) {
            console.error("Failed to fetch streak:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartStreak = () => {
        window.dispatchEvent(new Event("openCreatePostModal"));
        onClose();
    };

    const getStreakMessage = () => {
        if (streakData.streakCount === 0) {
            return "You haven't started a streak yet. Start posting to build your fire!";
        } else if (streakData.streakCount === 1) {
            return "Great start! Post again tomorrow to keep the flame alive! 🔥";
        } else if (streakData.streakCount < 7) {
            return `You're on fire! Keep going to reach a week-long streak! 🔥`;
        } else if (streakData.streakCount < 30) {
            return `Incredible dedication! You're building an unstoppable habit! 🚀`;
        } else {
            return `Legendary! You're a posting machine! 👑`;
        }
    };

    return (
        <div className="w-full bg-white shadow-xl border-b border-gray-200 z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h3 className="font-bold text-gray-900">Your Streak</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors font-medium text-sm text-gray-500"
                >
                    Close
                </button>
            </div>

            <div className="p-6 text-center">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${streakData.streakCount > 0 ? 'bg-orange-100' : 'bg-orange-50'
                            }`}>
                            <FaFire className={`text-4xl ${streakData.streakCount > 0 ? 'text-orange-500' : 'text-orange-300'
                                }`} />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                            {streakData.streakCount} {streakData.streakCount === 1 ? 'Day' : 'Days'}
                        </h2>

                        <p className="text-gray-500 text-sm mb-4">{getStreakMessage()}</p>

                        {streakData.longestStreak > 0 && streakData.longestStreak > streakData.streakCount && (
                            <p className="text-xs text-gray-400 mb-4">
                                🏆 Your best streak: <span className="font-bold text-gray-600">{streakData.longestStreak} days</span>
                            </p>
                        )}

                        <button
                            onClick={handleStartStreak}
                            className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                        >
                            {streakData.streakCount > 0 ? 'Keep the Streak' : 'Start Streak'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
