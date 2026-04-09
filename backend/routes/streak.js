const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/streak - Get current user's streak data
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("streakCount lastPostDate longestStreak");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if streak should be reset (more than 1 day since last post)
        let currentStreak = user.streakCount;
        if (user.lastPostDate) {
            const now = new Date();
            const lastPost = new Date(user.lastPostDate);
            const daysSinceLastPost = Math.floor((now - lastPost) / (1000 * 60 * 60 * 24));

            // If more than 1 day has passed, streak is broken
            if (daysSinceLastPost > 1) {
                currentStreak = 0;
                // Update the database to reflect broken streak
                await User.findByIdAndUpdate(req.user.id, { streakCount: 0 });
            }
        }

        res.json({
            streakCount: currentStreak,
            lastPostDate: user.lastPostDate,
            longestStreak: user.longestStreak
        });
    } catch (err) {
        console.error("Failed to fetch streak:", err);
        res.status(500).json({ message: "Failed to fetch streak data" });
    }
});

module.exports = router;
