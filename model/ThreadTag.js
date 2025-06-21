const mongoose = require("mongoose");

const threadTagSchema = new mongoose.Schema({
  thread_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForumThread" },
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityTag" },
  created_at: { type: Date, default: Date.now },
});

threadTagSchema.index({ thread_id: 1, tag_id: 1 }, { unique: true });

module.exports = mongoose.model("ThreadTag", threadTagSchema);
