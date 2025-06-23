const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true },
  summary: { type: String },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  thumbnail: { type: String, maxlength: 500 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false },
  is_published: { type: Boolean, default: true },
  published_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Article", articleSchema);
