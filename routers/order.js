const express = require("express");
const Order = require("../model/Order");
const OrderItem = require("../model/OrderItem");
const authMiddleware = require("../middleware/authMiddleware");
const { randomNumber } = require("../utils/randomNumber");
const router = express.Router();

router.post('/createOrder', authMiddleware, async (req, res) => {
  try {
    const { orderItems } = req.body
    const { _id } = req.user
    const newOrder = await Order.create({
      ...req.body,
      user_id: _id,
      order_number: String(randomNumber()),
    })
    const dataOrderItems = orderItems.map(i => ({
      ...i,
      order_id: newOrder._id
    }))
    await OrderItem.insertMany(dataOrderItems)
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/getOrderByUser", authMiddleware, async (req, res) => {
  try {
    const { _id } = req.user
    const orders = await Order.find({
      user_id: _id
    })
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = router