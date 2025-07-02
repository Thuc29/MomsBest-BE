const mongoose = require("mongoose");

const favoriteProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  created_at: { type: Date, default: Date.now },
});

favoriteProductSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("FavoriteProduct", favoriteProductSchema);
