const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/authMiddleware");

// GET /api/projects - Fetch all projects sorted by upvotes
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("author", "name username avatarUrl profilePicture headline")
            .lean();

        // Sort by upvote count manually for now
        const sorted = projects.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));

        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch projects" });
    }
});

// POST /api/projects - Launch a new project
router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, tagline, description, thumbnail, link, techStack } = req.body;
        const newProject = new Project({
            title,
            tagline,
            description,
            thumbnail,
            link,
            techStack,
            author: req.user.id
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ message: "Failed to launch project" });
    }
});

// POST /api/projects/:id/upvote - Toggle upvote
router.post("/:id/upvote", verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const userId = req.user.id;
        const upvoteIndex = project.upvotes.indexOf(userId);

        if (upvoteIndex === -1) {
            project.upvotes.push(userId);
        } else {
            project.upvotes.splice(upvoteIndex, 1);
        }

        await project.save();
        res.json({ upvotes: project.upvotes, upvoteCount: project.upvotes.length });
    } catch (err) {
        res.status(500).json({ message: "Failed to upvote" });
    }
});

module.exports = router;
