const mongoose = require("mongoose");

const aiKnowledgeBaseSchema = new mongoose.Schema({
  category: { type: String, required: true, maxlength: 255 },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  keywords: { type: String },
  confidence_threshold: { type: Number, default: 0.8 },
  usage_count: { type: Number, default: 0 },
  last_used: { type: Date },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIKnowledgeBase", aiKnowledgeBaseSchema);
