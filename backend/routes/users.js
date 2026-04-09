const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const { calculateContentSimilarity, calculateInteractionScore } = require("../utils/recommendationUtils");

// ... (lines 6-85 remain existing code, I will use precise targeting below instead of replacing whole file)

// GET /api/users/count → fetch total user count
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments({ username: { $exists: true, $ne: "" } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to count users" });
  }
});

// GET /api/users/recent → fetch recent users for landing page
router.get("/recent", async (req, res) => {
  try {
    const users = await User.find({ username: { $exists: true, $ne: "" } })
      .select("name username avatarUrl profilePicture")
      .limit(30)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Fetch recent users failed:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /api/users/search → search users by name or username
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .select("name username avatarUrl profilePicture")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// GET /api/users/check/:username → check if available
router.get("/check/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (err) {
    console.error("Check username failed:", err);
    res.status(500).json({ message: "Check failed" });
  }
});

// GET /api/users/u/:username → get public profile
router.get("/u/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password -email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch public profile failed:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

// GET /api/users/me → fetch current user profile
router.get("/me", authMiddleware, async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // The role field is already included in .select("-password")
    res.json(user);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// POST /api/users/follow/:id → follow a user
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Add to my following
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });

    // Add to target's followers
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });

    // Create Notification
    await Notification.findOneAndUpdate(
      { recipient: targetUserId, sender: currentUserId, type: "follow" },
      { read: false, createdAt: Date.now() }, // Reset read status if re-following
      { upsert: true, new: true }
    );

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error("Follow failed:", err);
    res.status(500).json({ message: "Follow failed" });
  }
});

// POST /api/users/unfollow/:id → unfollow a user
router.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Remove from my following
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    // Remove from target's followers
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow failed:", err);
    res.status(500).json({ message: "Unfollow failed" });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = [
      "name", "firstName", "lastName", "username", "bio", "avatarUrl", "coverUrl", "linkedinUrl",
      "location", "pronouns", "website", "calendarLink", "socialLinks",
      "skills", "interests", "projects", "resumeUrl"
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Check for username uniqueness if being updated
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });
    // Return consistent user object format (matching login response)
    res.json({
      id: updated._id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      verified: updated.verified,
      avatarUrl: updated.avatarUrl,
      coverUrl: updated.coverUrl,
      bio: updated.bio,
      linkedinUrl: updated.linkedinUrl,
      skills: updated.skills,
      interests: updated.interests,
      followers: updated.followers,
      following: updated.following,
      location: updated.location,
      pronouns: updated.pronouns,
      website: updated.website,
      calendarLink: updated.calendarLink,
      socialLinks: updated.socialLinks,
      resumeUrl: updated.resumeUrl,
      role: updated.role,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /api/users/:id/network → get populated followers/following
router.get("/:id/network", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name username avatarUrl profilePicture")
      .populate("following", "name username avatarUrl profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    console.error("Fetch network failed:", err);
    res.status(500).json({ message: "Fetch network failed" });
  }
});

// GET /api/users/recommended → get recommended professionals
router.get("/recommended", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Fetch all other users with completed profiles
    const others = await User.find({
      _id: { $ne: userId },
      username: { $exists: true, $ne: "" }
    }).select("-password -email");

    const userContentBase = [
      ...(currentUser.skills || []),
      ...(currentUser.interests || [])
    ];

    const recommended = others.map(other => {
      // A. Content Similarity
      const otherContentBase = [
        ...(other.skills || []),
        ...(other.interests || [])
      ];
      const contentSimilarity = calculateContentSimilarity(userContentBase, otherContentBase);

      // B. Interaction Score (Followers, etc.)
      const interactionScore = calculateInteractionScore(other, {
        views: 0, // No views tracked for users yet
        likes: 0,
        saves: 0,
        follows: 0.5 // Using followers count as a signal
      });

      // C. Final Score
      const finalScore = (contentSimilarity * 15) + interactionScore;

      return { ...other.toObject(), score: finalScore, debug: { contentSimilarity, interactionScore } };
    });

    // Sort by score and limit
    recommended.sort((a, b) => b.score - a.score);
    res.json(recommended.slice(0, 10));
  } catch (err) {
    console.error("User Recommendation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
