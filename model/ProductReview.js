const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  created_at: { type: Date, default: Date.now },
});

const productReviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  image: { type: String },
  is_verified_purchase: { type: Boolean, default: false },
  helpful_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  replies: [replySchema],
});

module.exports = mongoose.model("ProductReview", productReviewSchema);
