const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  total_price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OrderItem", orderItemSchema);
