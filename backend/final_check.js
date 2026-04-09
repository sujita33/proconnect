require("dotenv").config();
const mongoose = require("mongoose");
const Notification = require("./models/Notification");

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const notifs = await Notification.find()
        .populate("sender")
        .populate("post")
        .sort({ createdAt: -1 })
        .limit(5);

    notifs.forEach(n => {
        if (n.post) {
            console.log(`TYPE: ${n.type}`);
            console.log(`POST CONTENT: ${n.post.content}`);
            console.log('---');
        }
    });
    process.exit(0);
}
check();
