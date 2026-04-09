// backend/middleware/adminMiddleware.js
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        next();
    } catch (err) {
        console.error("Admin middleware error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = adminMiddleware;
