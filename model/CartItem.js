const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);
