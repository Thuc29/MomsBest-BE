const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  order_number: { type: String, required: true, unique: true, maxlength: 50 },
  total_amount: { type: Number, required: true },
  shipping_fee: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  payment_method: {
    type: String,
    enum: ["cod", "bank_transfer", "Bank Transfer", "Cash on Delivery"],
    default: "cod",
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  order_status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  shipping_address: { type: String, required: true },
  shipping_phone: { type: String, required: true, maxlength: 20 },
  shipping_name: { type: String, required: true, maxlength: 255 },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware để chuẩn hóa payment_method trước khi lưu
orderSchema.pre("save", function (next) {
  // Chuẩn hóa payment_method
  if (this.payment_method === "Bank Transfer") {
    this.payment_method = "bank_transfer";
  } else if (this.payment_method === "Cash on Delivery") {
    this.payment_method = "cod";
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
