const mongoose = require("mongoose");
const Notification = require("./models/Notification");
const Post = require("./models/Post");

const MONGO_URI = "mongodb://localhost:27017/proconnect";

async function checkNotifications() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const latestNotifications = await Notification.find()
            .populate("sender", "name")
            .populate("post")
            .sort({ createdAt: -1 })
            .limit(5);

        console.log("\n--- Latest Notifications ---");
        latestNotifications.forEach(n => {
            console.log(`Type: ${n.type}`);
            console.log(`From: ${n.sender?.name}`);
            console.log(`Date: ${n.createdAt}`);
            if (n.post) {
                console.log(`Post: ${n.post.content?.substring(0, 100)}...`);
            } else {
                console.log("Post: N/A (likely a follow)");
            }
            console.log("----------------------------");
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNotifications();
