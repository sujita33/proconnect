const mongoose = require("mongoose");
const Notification = require("./models/Notification");
const Post = require("./models/Post");
const User = require("./models/User");

const MONGO_URI = "mongodb://localhost:27017/proconnect";

async function dumpDB() {
    try {
        await mongoose.connect(MONGO_URI);

        const notifCount = await Notification.countDocuments();
        const postCount = await Post.countDocuments();
        const userCount = await User.countDocuments();

        console.log(`Stats: ${userCount} users, ${postCount} posts, ${notifCount} notifications`);

        const notifs = await Notification.find().populate("sender").populate("recipient").populate("post").sort({ createdAt: -1 }).limit(10);
        console.log("\n--- Notifications ---");
        notifs.forEach(n => {
            console.log(`[${n.createdAt.toISOString()}] ${n.sender?.name} ${n.type}d ${n.recipient?.name}'s post: "${n.post?.content?.substring(0, 50)}..."`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dumpDB();
