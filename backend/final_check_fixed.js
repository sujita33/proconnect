require("dotenv").config();
const mongoose = require("mongoose");

// Define basic schemas to avoid populate errors
const User = mongoose.model('User', new mongoose.Schema({ name: String }));
const Post = mongoose.model('Post', new mongoose.Schema({ content: String }));
const Notification = mongoose.model('Notification', new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    type: String,
    createdAt: Date
}));

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const notifs = await Notification.find()
            .populate("sender")
            .populate("post")
            .sort({ createdAt: -1 })
            .limit(5);

        console.log("\n--- NOTIFICATION DETAILS ---");
        notifs.forEach(n => {
            if (n.post) {
                console.log(`Action: ${n.sender?.name} ${n.type}d`);
                console.log(`Post: ${n.post.content}`);
                console.log('---');
            }
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
