const mongoose = require("mongoose");

const threadFollowSchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumThread",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});
threadFollowSchema.index({ thread_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ThreadFollower", threadFollowSchema);
