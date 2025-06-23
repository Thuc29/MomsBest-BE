const mongoose = require("mongoose");

const articleViewSchema = new mongoose.Schema({
  article_id: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

articleViewSchema.index({ article_id: 1, user_id: 1, created_at: 1 });

module.exports = mongoose.model("ArticleView", articleViewSchema);
