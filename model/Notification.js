const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "thread_reply",
      "comment_like",
      "new_follower",
      "order_update",
      "system_announcement",
    ],
  },
  title: { type: String, required: true, maxlength: 255 },
  message: { type: String, required: true },
  reference_type: { type: String, maxlength: 50 },
  reference_id: { type: mongoose.Schema.Types.ObjectId },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
