const mongoose = require("mongoose");

const userBookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  target_type: {
    type: String,
    enum: ["thread", "article", "product"],
    required: true,
  },
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  created_at: { type: Date, default: Date.now },
});

userBookmarkSchema.index(
  { user_id: 1, target_type: 1, target_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserBookmark", userBookmarkSchema);
