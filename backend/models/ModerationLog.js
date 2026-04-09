const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            enum: ["delete_post", "dismiss_reports", "ban_user", "unban_user", "verify_user", "unverify_user", "change_role"],
            required: true,
        },
        targetType: {
            type: String,
            enum: ["post", "user"],
            required: true,
        },
        targetId: {
            type: String, // ID of the post or user acted upon
            required: true,
        },
        reason: {
            type: String, // Optional reason for the action
        },
        details: {
            type: mongoose.Schema.Types.Mixed, // Any extra data (e.g., content of deleted post)
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ModerationLog", moderationLogSchema);
