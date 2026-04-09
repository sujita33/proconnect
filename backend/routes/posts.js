const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");
const { calculateContentSimilarity, calculateInteractionScore } = require("../utils/recommendationUtils");

// Helper middleware to get user from request
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const xUserId = req.headers['x-user-id'];

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const jwt = require("jsonwebtoken");
            const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const User = require("../models/User");
                const user = await User.findById(decoded.id);
                if (user) {
                    req.user = user;
                    return next();
                }
            } catch (jwtErr) {
                console.warn("JWT verification failed, falling back to x-user-id:", jwtErr.message);
            }
        }

        if (xUserId) {
            const User = require("../models/User");
            const user = await User.findById(xUserId);
            if (user) {
                req.user = user;
                return next();
            }
        }

        return res.status(401).json({ error: "Unauthorized" });
    } catch (err) {
        console.error("verifyToken error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
};

// GET all posts (Hybrid Recommendation System)
router.get("/", async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        let posts = await Post.find()
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username")
            .lean(); // Use lean for performance since we aren't saving these instances

        if (!userId) {
            // cleaning up posts if no user logged in, just sort by newest
            return res.json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }

        const user = await User.findById(userId);
        if (!user) return res.json(posts);

        // --- 1. BUILD USER PREFERENCE PROFILE ---
        // Combine skills and interests for the user's content vector
        const userContentBase = [
            ...(user.skills || []),
            ...(user.interests || [])
        ];

        // --- 2. SCORE CANDIDATES ---
        const scoredPosts = posts.map(post => {
            // A. Content Similarity (Cosine Similarity)
            const itemContentBase = [
                ...(post.skills || []),
                ...(post.technologies || []),
                post.category
            ].filter(Boolean);

            const contentSimilarity = calculateContentSimilarity(userContentBase, itemContentBase);

            // B. Interaction Score (New Points System)
            // Likes: 3 pts, Comments: 5 pts, Views: 0.1 pts
            const likesCount = (post.likes && post.likes.length) || 0;
            const commentsCount = (post.comments && post.comments.length) || 0;
            const viewsCount = (post.views && post.views.length) || 0;

            const interactionScore =
                (likesCount * 3) +
                (commentsCount * 5) +
                (viewsCount * 0.1);

            // C. Freshness Score (Kickstart Bonus)
            // 24 points max, -1 per hour. +10 Turbo Boost if < 1 hour.
            const now = new Date();
            const postDate = new Date(post.createdAt);
            const hoursOld = (now - postDate) / (1000 * 60 * 60);

            let freshnessScore = Math.max(0, 24 - hoursOld);
            if (hoursOld < 1) {
                freshnessScore += 10; // Turbo boost for brand new posts
            }

            // D. Combined Final Score
            // SkillMatch (0-10) + Interaction + Freshness
            const skillScore = contentSimilarity * 10;
            const finalScore = skillScore + interactionScore + freshnessScore;

            return {
                ...post,
                score: finalScore,
                debug: { skillScore, interactionScore, freshnessScore }
            };
        });

        // --- 3. SORT & RETURN ---
        scoredPosts.sort((a, b) => b.score - a.score);

        res.json(scoredPosts);
    } catch (err) {
        console.error("Recommendation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/posts/search -> search posts by content or title
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const posts = await Post.find({
            $or: [
                { content: { $regex: query, $options: "i" } },
                { title: { $regex: query, $options: "i" } },
            ],
        })
            .populate("author", "name username avatarUrl profilePicture headline")
            .limit(10)
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error("Post Search failed:", err);
        res.status(500).json({ message: "Search failed" });
    }
});

// GET posts from followed users
router.get("/following", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Post.find({ author: { $in: user.following } })
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET posts by a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single post by ID
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username");

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new post
router.post("/", verifyToken, async (req, res) => {
    try {
        const { content, title, image, mediaType, mediaUrl, mediaUrls, skills, technologies, category, poll } = req.body;

        // Check if banned
        if (req.user.status === "banned") {
            return res.status(403).json({ error: "Your account has been suspended for violating community guidelines." });
        }

        // Validate - either content or poll must be present
        if (!content && !poll?.question) {
            return res.status(400).json({ error: "Content or poll is required" });
        }

        // Validate media limits
        if (mediaType === 'video' && mediaUrls && mediaUrls.length > 1) {
            return res.status(400).json({ error: "Only one video is allowed per post." });
        }
        if (mediaType === 'image' && mediaUrls && mediaUrls.length > 4) {
            return res.status(400).json({ error: "Maximum 4 images are allowed per post." });
        }

        const newPost = new Post({
            author: req.user._id, // Assumes auth middleware populates req.user
            content: content || "", // Allow empty content if poll exists
            title,
            image, // Legacy
            mediaType: mediaType || (image ? 'image' : (mediaUrls?.length > 0 ? 'image' : 'none')),
            mediaUrl: mediaUrl || image || (mediaUrls?.length > 0 ? mediaUrls[0] : ""),
            mediaUrls: mediaUrls || [],
            skills,
            technologies,
            category,
            poll: poll ? {
                question: poll.question,
                options: poll.options.map(opt => ({ text: opt, voters: [] }))
            } : undefined
        });

        const savedPost = await newPost.save();
        // Populate author immediately for frontend return
        await savedPost.populate("author", "name avatarUrl username headline");

        // --- UPDATE USER STREAK ---
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                let newStreakCount = user.streakCount || 0;

                if (user.lastPostDate) {
                    const lastPost = new Date(user.lastPostDate);
                    const lastPostDay = new Date(lastPost.getFullYear(), lastPost.getMonth(), lastPost.getDate());
                    const daysDiff = Math.floor((today - lastPostDay) / (1000 * 60 * 60 * 24));

                    if (daysDiff === 0) {
                        // Already posted today - no streak change
                    } else if (daysDiff === 1) {
                        // Posted yesterday - increment streak
                        newStreakCount += 1;
                    } else {
                        // Gap of more than 1 day - reset streak to 1
                        newStreakCount = 1;
                    }
                } else {
                    // First post ever - start streak at 1
                    newStreakCount = 1;
                }

                // Update longest streak if new streak is higher
                const newLongestStreak = Math.max(user.longestStreak || 0, newStreakCount);

                await User.findByIdAndUpdate(req.user._id, {
                    streakCount: newStreakCount,
                    lastPostDate: now,
                    longestStreak: newLongestStreak
                });
            }
        } catch (streakErr) {
            console.error("Failed to update streak:", streakErr);
            // Don't fail the post creation if streak update fails
        }

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Like/Unlike a post
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Check if banned
        if (req.user.status === "banned") {
            return res.status(403).json({ error: "Suspended accounts cannot interact with posts." });
        }

        const userId = req.user._id;

        // Check if already liked
        if (post.likes.includes(userId)) {
            // Unlike
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        // Create notification for like
        try {
            if (!post.likes.includes(userId) && post.author.toString() !== userId.toString()) {
                // This check is slightly wrong because we already pushed the userId
                // Let's refine: if it's currently liked (newly added), send notification
            }

            // Re-evaluating: post.likes was just updated.
            if (post.likes.includes(userId) && post.author.toString() !== userId.toString()) {
                const existingNotification = await Notification.findOne({
                    recipient: post.author,
                    sender: userId,
                    type: "like",
                    post: post._id
                });

                if (!existingNotification) {
                    await new Notification({
                        recipient: post.author,
                        sender: userId,
                        type: "like",
                        post: post._id
                    }).save();
                }
            }
        } catch (notificationErr) {
            console.error("Failed to create like notification:", notificationErr);
        }

        res.json(post.likes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Vote on a poll
router.put("/:id/vote", verifyToken, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const userId = req.user._id;

        if (optionIndex === undefined || optionIndex === null) {
            return res.status(400).json({ error: "Option index is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        if (!post.poll || !post.poll.options) {
            return res.status(400).json({ error: "This post does not have a poll" });
        }

        if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
            return res.status(400).json({ error: "Invalid option index" });
        }

        // Check if user has already voted for ANY option
        let existingOptionIndex = -1;
        post.poll.options.forEach((opt, idx) => {
            if (opt.voters.some(v => v.toString() === userId.toString())) {
                existingOptionIndex = idx;
            }
        });

        if (existingOptionIndex === optionIndex) {
            // User clicked the same option -> UNDO vote
            post.poll.options[optionIndex].voters = post.poll.options[optionIndex].voters.filter(
                v => v.toString() !== userId.toString()
            );
        } else {
            // Remove from existing if they voted elsewhere
            if (existingOptionIndex !== -1) {
                post.poll.options[existingOptionIndex].voters = post.poll.options[existingOptionIndex].voters.filter(
                    v => v.toString() !== userId.toString()
                );
            }
            // Add to new option
            post.poll.options[optionIndex].voters.push(userId);
        }

        await post.save();
        res.json(post.poll);
    } catch (err) {
        console.error("Vote error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST add a comment
router.post("/:id/comment", verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Comment text is required" });

        // Check if banned
        if (req.user.status === "banned") {
            return res.status(403).json({ error: "Suspended accounts cannot interact with posts." });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const newComment = {
            user: req.user._id,
            text,
        };

        post.comments.push(newComment);
        await post.save();

        // Re-fetch to populate the new comment user
        const updatedPost = await Post.findById(req.params.id)
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username");

        // Create notification for comment
        try {
            if (post.author.toString() !== req.user._id.toString()) {
                await new Notification({
                    recipient: post.author,
                    sender: req.user._id,
                    type: "comment",
                    post: post._id
                }).save();
            }
        } catch (notificationErr) {
            console.error("Failed to create comment notification:", notificationErr);
        }

        res.json(updatedPost.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a reply to a comment
router.post("/:id/comment/:commentId/reply", verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Reply text is required" });

        // Check if banned
        if (req.user.status === "banned") {
            return res.status(403).json({ error: "Suspended accounts cannot interact with posts." });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const newReply = {
            user: req.user._id,
            text,
        };

        comment.replies.push(newReply);
        await post.save();

        // Re-fetch to populate the new reply user
        const updatedPost = await Post.findById(req.params.id)
            .populate("comments.user", "name avatarUrl username")
            .populate("comments.replies.user", "name avatarUrl username");

        // Create notification for reply to the original commenter
        try {
            if (comment.user.toString() !== req.user._id.toString()) {
                await new Notification({
                    recipient: comment.user,
                    sender: req.user._id,
                    type: "reply",
                    post: post._id
                }).save();
            }
        } catch (notificationErr) {
            console.error("Failed to create reply notification:", notificationErr);
        }

        res.json(updatedPost.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Save/Unsave a post
router.put("/:id/save", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        if (post.saves.includes(userId)) {
            post.saves = post.saves.filter((id) => id.toString() !== userId.toString());
        } else {
            post.saves.push(userId);
        }

        await post.save();
        res.json(post.saves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Track View
router.put("/:id/view", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        // Only add if not already viewed to avoid duplicate weight (optional logic)
        if (!post.views.includes(userId)) {
            post.views.push(userId);
            await post.save();
        }

        res.json(post.views);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a post (only by author)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user._id;

        // Check if the user is the author of the post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        // DELETE PHYSICAL FILE if it exists
        if (post.mediaUrl && post.mediaUrl.includes("localhost:5000/uploads/")) {
            try {
                const filename = post.mediaUrl.split("/").pop();
                const filePath = path.join(__dirname, "../uploads", filename);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${filePath}`);
                }
            } catch (fileErr) {
                console.error("Failed to delete physical file:", fileErr);
                // We don't fail the whole request since the DB record is already being handled
            }
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post and associated file deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST report a post
router.post("/:id/report", verifyToken, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ error: "Reason is required" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Add report
        post.reports.push({
            user: req.user._id,
            reason
        });

        await post.save();
        res.json({ message: "Post reported successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
