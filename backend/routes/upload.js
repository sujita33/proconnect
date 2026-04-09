const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for videos
});

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Return URL
        // In simple local dev, assume serving from root/uploads
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
        });
    } catch (err) {
        console.error("Upload error", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

module.exports = router;
