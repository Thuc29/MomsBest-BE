const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 500 },
  description: { type: String },
  detail_description: { type: String },
  price: { type: Number, required: true },
  original_price: { type: Number },
  category_id: { type: String, required: true },
  brand: { type: String, maxlength: 255 },
  images: { type: [String] },
  stock_quantity: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Products", productSchema);
