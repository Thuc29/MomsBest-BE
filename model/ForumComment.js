const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema({
  thread_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForumThread" },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumComment",
  },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ForumComment", forumCommentSchema);
