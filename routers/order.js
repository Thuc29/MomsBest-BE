const express = require("express");
const Order = require("../model/Order");
const OrderItem = require("../model/OrderItem");
const authMiddleware = require("../middleware/authMiddleware");
const { randomNumber } = require("../utils/randomNumber");
const {
  validateOrderData,
  sanitizeOrderData,
} = require("../utils/orderValidation");
const router = express.Router();

router.post("/createOrder", authMiddleware, async (req, res) => {
  try {
    const { _id } = req.user;

    // Validate order data
    const validation = validateOrderData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Sanitize order data
    const sanitizedData = sanitizeOrderData(req.body);

    const newOrder = await Order.create({
      user_id: _id,
      order_number: String(randomNumber()),
      total_amount: sanitizedData.total_amount,
      shipping_fee: sanitizedData.shipping_fee,
      discount_amount: sanitizedData.discount_amount,
      payment_method: sanitizedData.payment_method,
      shipping_address: sanitizedData.shipping_address,
      shipping_phone: sanitizedData.shipping_phone,
      shipping_name: sanitizedData.shipping_name,
      notes: sanitizedData.notes,
    });

    const dataOrderItems = sanitizedData.orderItems.map((i) => ({
      ...i,
      order_id: newOrder._id,
    }));

    await OrderItem.insertMany(dataOrderItems);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/getOrderByUser", authMiddleware, async (req, res) => {
  try {
    const { _id } = req.user;
    const orders = await Order.find({ user_id: _id }).sort({ created_at: -1 });

    // Lấy order items cho mỗi đơn hàng
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.find({
          order_id: order._id,
        }).populate(
          "product_id",
          "name price images description category_ids brand"
        );

        return {
          ...order.toObject(),
          items: orderItems,
        };
      })
    );

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error("Get orders by user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy chi tiết đơn hàng theo ID (chỉ cho user sở hữu đơn hàng)
router.get("/getOrderById/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id } = req.user;

    const order = await Order.findOne({ _id: orderId, user_id: _id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Lấy order items
    const orderItems = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
      "name price images description category_ids brand"
    );

    const orderDetail = {
      ...order.toObject(),
      items: orderItems,
    };

    res.status(200).json(orderDetail);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Hủy đơn hàng (chỉ cho user sở hữu đơn hàng)
router.patch("/cancelOrder/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { _id } = req.user;

    const order = await Order.findOne({ _id: orderId, user_id: _id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc confirmed
    if (
      order.order_status !== "pending" &&
      order.order_status !== "confirmed"
    ) {
      return res.status(400).json({
        error:
          "Cannot cancel order. Only pending or confirmed orders can be cancelled.",
      });
    }

    order.order_status = "cancelled";
    order.updated_at = new Date();
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
