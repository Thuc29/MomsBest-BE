const mongoose = require("mongoose");

const communityTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, maxlength: 100 },
  description: { type: String },
  usage_count: { type: Number, default: 0 },
  color: { type: String, maxlength: 20 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommunityTag", communityTagSchema);
