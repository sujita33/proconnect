const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tagline: { type: String, required: true }, // Short description
    description: { type: String },
    thumbnail: { type: String }, // Image URL
    link: { type: String }, // Project URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    techStack: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", projectSchema);
