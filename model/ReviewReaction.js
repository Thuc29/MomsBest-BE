const mongoose = require("mongoose");

const reviewReactionSchema = new mongoose.Schema({
  review_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductReview" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reaction_type: {
    type: String,
    enum: ["like", "love", "laugh", "wow", "sad", "angry"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

reviewReactionSchema.index({ review_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ReviewReaction", reviewReactionSchema);
