const mongoose = require("mongoose");

const hotTopicSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  thread_count: { type: Number, default: 0 },
  view_count: { type: Number, default: 0 },
  is_trending: { type: Boolean, default: false },
  start_date: { type: Date },
  end_date: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HotTopic", hotTopicSchema);
