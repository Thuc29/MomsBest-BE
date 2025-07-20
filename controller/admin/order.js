const Order = require("../../model/Order");
const OrderItem = require("../../model/OrderItem");
const Product = require("../../model/Product");

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
      .populate({
        path: "user_id",
        select: "name email phone",
        options: { lean: true },
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });

    // Debug: Log orders to check user_id population
    console.log("Orders found:", orders.length);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        order_number: order.order_number,
        shipping_name: order.shipping_name,
        user_id: order.user_id,
        has_user: !!order.user_id,
      });
    });

    const total = await Order.countDocuments(query);

    res.json({ orders, total });
  } catch (err) {
    console.error("Error in getOrders:", err);
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết đơn hàng với sản phẩm
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "user_id",
      select: "name email phone",
      options: { lean: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Lấy chi tiết sản phẩm trong đơn hàng
    const orderItems = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
      "name price images description category_ids brand"
    );

    const orderDetail = {
      ...order.toObject(),
      items: orderItems,
    };

    res.json(orderDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate trạng thái đơn hàng
    const validOrderStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (order_status && !validOrderStatuses.includes(order_status)) {
      return res.status(400).json({
        message:
          "Invalid order status. Valid statuses: " +
          validOrderStatuses.join(", "),
      });
    }

    // Validate trạng thái thanh toán
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        message:
          "Invalid payment status. Valid statuses: " +
          validPaymentStatuses.join(", "),
      });
    }

    // Cập nhật trạng thái
    if (order_status) {
      order.order_status = order_status;
    }
    if (payment_status) {
      order.payment_status = payment_status;
    }

    order.updated_at = new Date();
    await order.save();

    // Populate user info trước khi trả về
    await order.populate("user_id", "name email phone");

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật trạng thái thanh toán
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        message:
          "Invalid payment status. Valid statuses: " +
          validPaymentStatuses.join(", "),
      });
    }

    order.payment_status = payment_status;
    order.updated_at = new Date();
    await order.save();

    await order.populate("user_id", "name email phone");

    res.json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa đơn hàng (chỉ cho phép khi đã hủy hoặc hoàn thành)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Chỉ cho phép xóa khi đơn hàng đã hủy hoặc hoàn thành
    if (
      order.order_status !== "cancelled" &&
      order.order_status !== "delivered"
    ) {
      return res.status(400).json({
        message:
          "Cannot delete order. Only cancelled or delivered orders can be deleted.",
      });
    }

    // Xóa các order items trước
    await OrderItem.deleteMany({ order_id: order._id });

    // Xóa đơn hàng
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: "Order deleted successfully",
      deletedOrder: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thống kê đơn hàng
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total_amount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "pending"] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "confirmed"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "processing"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$order_status", "cancelled"] }, 1, 0] },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$payment_status", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(
      stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidOrders: 0,
        pendingPayments: 0,
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy đơn hàng gần đây
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find()
      .populate("user_id", "name email phone")
      .sort({ created_at: -1 })
      .limit(Number(limit));

    res.json(recentOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kiểm tra và phân tích dữ liệu đơn hàng
exports.analyzeOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersWithUser = await Order.countDocuments({
      user_id: { $exists: true, $ne: null },
    });
    const ordersWithoutUser = await Order.countDocuments({
      $or: [{ user_id: { $exists: false } }, { user_id: null }],
    });

    // Lấy một số đơn hàng mẫu để kiểm tra
    const sampleOrders = await Order.find()
      .populate("user_id", "name email phone")
      .limit(10)
      .sort({ created_at: -1 });

    const analysis = {
      totalOrders,
      ordersWithUser,
      ordersWithoutUser,
      percentageWithUser:
        totalOrders > 0 ? ((ordersWithUser / totalOrders) * 100).toFixed(2) : 0,
      sampleOrders: sampleOrders.map((order) => ({
        order_number: order.order_number,
        shipping_name: order.shipping_name,
        user_id: order.user_id,
        has_user: !!order.user_id,
        created_at: order.created_at,
      })),
    };

    res.json(analysis);
  } catch (err) {
    console.error("Error in analyzeOrders:", err);
    res.status(500).json({ message: err.message });
  }
};
