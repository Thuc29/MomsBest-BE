const mongoose = require("mongoose");

const categoryProductSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  description: { type: String },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CategoryProduct", categoryProductSchema);
