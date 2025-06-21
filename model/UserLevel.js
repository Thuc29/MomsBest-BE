const mongoose = require("mongoose");

const userLevelSchema = new mongoose.Schema({
  level_name: { type: String, required: true, unique: true, maxlength: 50 },
  min_points: { type: Number, required: true },
  max_points: { type: Number },
  badge_color: { type: String, maxlength: 20 },
  badge_icon: { type: String, maxlength: 100 },
  benefits: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserLevel", userLevelSchema);
