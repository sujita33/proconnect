const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200,
        },
        subtitle: {
            type: String,
            trim: true,
            maxLength: 300,
        },
        content: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            default: "",
        },
        tags: [{ type: String, trim: true }],
        readTime: {
            type: Number,
            default: 5, // in minutes
        },
        views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
