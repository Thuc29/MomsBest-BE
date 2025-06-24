const Order = require("../../model/Order");

// Lấy danh sách đơn hàng (phân trang, tìm kiếm, lọc)
exports.getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status,
      payment_status,
    } = req.query;
    let query = {};
    if (search) {
      query.order_number = { $regex: search, $options: "i" };
    }
    if (status) {
      query.order_status = status;
    }
    if (payment_status) {
      query.payment_status = payment_status;
    }
    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
