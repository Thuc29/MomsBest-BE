const mongoose = require("mongoose");

const forumThreadSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  is_pinned: { type: Boolean, default: false },
  thread_type: {
    type: String,
    enum: ["question", "sharing", "discussion", "review"],
    default: "discussion",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Virtual để đếm số lượng comment của thread
forumThreadSchema.virtual("commentsCount", {
  ref: "ForumComment",
  localField: "_id",
  foreignField: "thread_id",
  count: true,
});

forumThreadSchema.set("toObject", { virtuals: true });
forumThreadSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ForumThread", forumThreadSchema);
