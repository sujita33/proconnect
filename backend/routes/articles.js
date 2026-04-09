const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Helper middleware to get user from request
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const xUserId = req.headers['x-user-id'];

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
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

// GET all articles
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find({ status: "published" })
            .populate("author", "name avatarUrl username headline")
            .sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single article by ID
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate("author", "name avatarUrl username headline")
            .populate("comments.user", "name avatarUrl username");

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new article
router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, subtitle, content, coverImage, tags, readTime, status } = req.body;

        if (req.user.status === "banned") {
            return res.status(403).json({ error: "Your account has been suspended." });
        }

        const newArticle = new Article({
            author: req.user._id,
            title,
            subtitle,
            content,
            coverImage,
            tags,
            readTime,
            status: status || "published"
        });

        const savedArticle = await newArticle.save();
        await savedArticle.populate("author", "name avatarUrl username headline");

        res.status(201).json(savedArticle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update an article
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only update your own articles" });
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate("author", "name avatarUrl username headline");

        res.json(updatedArticle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE an article
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        if (article.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "You can only delete your own articles" });
        }

        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Like an article
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const userId = req.user._id;

        if (article.likes.includes(userId)) {
            article.likes = article.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            article.likes.push(userId);

            // Notification
            if (article.author.toString() !== userId.toString()) {
                await new Notification({
                    recipient: article.author,
                    sender: userId,
                    type: "like",
                    article: article._id
                }).save();
            }
        }

        await article.save();
        res.json(article.likes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add a comment
router.post("/:id/comment", verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Comment text is required" });

        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const newComment = {
            user: req.user._id,
            text,
        };

        article.comments.push(newComment);
        await article.save();

        const updatedArticle = await Article.findById(req.params.id)
            .populate("comments.user", "name avatarUrl username");

        // Notification
        if (article.author.toString() !== req.user._id.toString()) {
            await new Notification({
                recipient: article.author,
                sender: req.user._id,
                type: "comment",
                article: article._id
            }).save();
        }

        res.json(updatedArticle.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT Save/Unsave an article
router.put("/:id/save", verifyToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const userId = req.user._id;

        if (article.saves.includes(userId)) {
            article.saves = article.saves.filter((id) => id.toString() !== userId.toString());
        } else {
            article.saves.push(userId);
        }

        await article.save();
        res.json(article.saves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET saved articles for current user
router.get("/me/saved", verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const savedArticles = await Article.find({ saves: userId })
            .populate("author", "name avatarUrl username headline")
            .sort({ createdAt: -1 });
        res.json(savedArticles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
