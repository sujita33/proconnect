const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/notifications → fetch my notifications
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate("sender", "name username avatarUrl profilePicture")
            .populate("post", "content")
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (err) {
        console.error("Fetch notifications failed:", err);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// PUT /api/notifications/read-all → mark all as read
router.put("/read-all", authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );
        res.json({ message: "All marked as read" });
    } catch (err) {
        console.error("Mark all read failed:", err);
        res.status(500).json({ message: "Failed to mark all as read" });
    }
});

// PUT /api/notifications/:id/read → mark as read
router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        console.error("Mark read failed:", err);
        res.status(500).json({ message: "Failed to mark as read" });
    }
});

// DELETE /api/notifications → clear all notifications
router.delete("/", authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.json({ message: "Notifications cleared" });
    } catch (err) {
        console.error("Clear notifications failed:", err);
        res.status(500).json({ message: "Failed to clear notifications" });
    }
});

module.exports = router;
