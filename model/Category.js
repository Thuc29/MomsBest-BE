const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  description: { type: String },
  is_active: { type: Boolean, default: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
