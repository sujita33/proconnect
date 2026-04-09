require("dotenv").config();
const mongoose = require("mongoose");
const User = mongoose.model('User', new mongoose.Schema({ name: String }));
const Post = mongoose.model('Post', new mongoose.Schema({ content: String }));
const Notification = mongoose.model('Notification', new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    type: String,
    createdAt: Date
}));

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const notifs = await Notification.find()
        .populate("sender")
        .populate("post")
        .sort({ createdAt: -1 })
        .limit(3);

    process.stdout.write(JSON.stringify(notifs, null, 2));
    process.exit(0);
}
check();
