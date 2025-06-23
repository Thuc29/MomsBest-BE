const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatConversation",
  },
  sender_type: { type: String, enum: ["user", "ai"], required: true },
  message: { type: String, required: true },
  message_type: {
    type: String,
    enum: ["text", "quick_reply"],
    default: "text",
  },
  metadata: { type: String },
  ai_confidence_score: { type: Number },
  is_helpful: { type: Boolean },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
