const mongoose = require("mongoose");

const userPointsHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action_type: {
    type: String,
    enum: [
      "create_category",
      "post_thread",
      "comment",
      "like_received",
      "profile_complete",
      "article_read",
      "product_review",
      "thread_pinned",
      "share_content",
    ],
  },
  points_earned: { type: Number, required: true },
  description: { type: String, maxlength: 500 },
  reference_id: { type: mongoose.Schema.Types.ObjectId },
  reference_type: { type: String, maxlength: 50 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserPointsHistory", userPointsHistorySchema);
