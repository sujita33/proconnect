require("dotenv").config();
const mongoose = require("mongoose");
const Notification = require("./models/Notification");
const Post = require("./models/Post");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;

async function checkNotifications() {
    try {
        console.log("Connecting to Atlas...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        const latestNotifications = await Notification.find()
            .populate("sender")
            .populate("post")
            .sort({ createdAt: -1 })
            .limit(10);

        console.log("\n--- Recent Interactions ---");
        latestNotifications.forEach(n => {
            try {
                const dateStr = n.createdAt ? n.createdAt.toLocaleString() : "Unknown date";
                const senderName = n.sender ? n.sender.name : "Unknown sender";
                const type = n.type || "unknown action";
                const postContent = n.post ? n.post.content : "N/A";

                console.log(`[${dateStr}] ${senderName} ${type}d:`);
                console.log(`Content: "${postContent?.substring(0, 100)}..."`);
                console.log("----------------------------");
            } catch (e) {
                console.log("Error printing notification:", e.message);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error("FULL ERROR:", err);
        process.exit(1);
    }
}

checkNotifications();
