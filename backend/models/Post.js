const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: false,
            trim: true,
            maxLength: 2000,
        },
        title: {
            type: String,
            trim: true,
            maxLength: 100,
        },
        image: {
            type: String, // Legacy support
            default: "",
        },
        mediaType: {
            type: String, // 'image', 'video'
            enum: ['image', 'video', 'none'],
            default: 'none'
        },
        mediaUrl: {
            type: String,
            default: ""
        },
        mediaUrls: [{ type: String }], // Array for multiple images (up to 4)
        skills: [{ type: String, trim: true }],
        technologies: [{ type: String, trim: true }],
        category: { type: String, trim: true, default: "General" },
        views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        poll: {
            question: String,
            options: [{ text: String, voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }]
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                    trim: true,
                },
                replies: [
                    {
                        user: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User",
                            required: true,
                        },
                        text: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        createdAt: {
                            type: Date,
                            default: Date.now,
                        },
                    }
                ],
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        reports: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                reason: { type: String, trim: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
