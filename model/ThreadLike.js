const mongoose = require("mongoose");

const threadLikeSchema = new mongoose.Schema({
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
  type: { type: String, enum: ["like", "save"], required: true },
  created_at: { type: Date, default: Date.now },
});

threadLikeSchema.index({ thread_id: 1, user_id: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("ThreadLike", threadLikeSchema);
