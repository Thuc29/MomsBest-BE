const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
  comment_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForumComment" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

commentLikeSchema.index({ comment_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("CommentLike", commentLikeSchema);
