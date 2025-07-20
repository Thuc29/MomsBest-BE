const User = require("../../model/User");
const Product = require("../../model/Product");
const Order = require("../../model/Order");
const ForumThread = require("../../model/ForumThread");
const ForumComment = require("../../model/ForumComment");
const Article = require("../../model/Article");
const Category = require("../../model/Category");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      totalRevenue,
      threadCount,
      commentCount,
      articleCount,
      categoryCount,
      orderStatusStats,
      paymentStatusStats,
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Product.countDocuments().catch(() => 0),
      Order.countDocuments().catch(() => 0),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]).catch(() => [{ total: 0 }]),
      ForumThread.countDocuments().catch(() => 0),
      ForumComment.countDocuments().catch(() => 0),
      Article.countDocuments().catch(() => 0),
      Category.countDocuments({ is_active: true }).catch(() => 0),
      // Thống kê trạng thái đơn hàng
      Order.aggregate([
        {
          $group: {
            _id: "$order_status",
            count: { $sum: 1 },
          },
        },
      ]).catch(() => []),
      // Thống kê trạng thái thanh toán
      Order.aggregate([
        {
          $group: {
            _id: "$payment_status",
            count: { $sum: 1 },
          },
        },
      ]).catch(() => []),
    ]);

    // Chuyển đổi thống kê trạng thái đơn hàng thành object
    const orderStatusData = {};
    orderStatusStats.forEach((stat) => {
      orderStatusData[stat._id] = stat.count;
    });

    // Chuyển đổi thống kê trạng thái thanh toán thành object
    const paymentStatusData = {};
    paymentStatusStats.forEach((stat) => {
      paymentStatusData[stat._id] = stat.count;
    });

    res.json({
      userCount,
      productCount,
      orderCount,
      totalRevenue: totalRevenue[0]?.total || 0,
      threadCount,
      commentCount,
      articleCount,
      categoryCount,
      orderStatusStats: {
        pending: orderStatusData.pending || 0,
        confirmed: orderStatusData.confirmed || 0,
        processing: orderStatusData.processing || 0,
        shipped: orderStatusData.shipped || 0,
        delivered: orderStatusData.delivered || 0,
        cancelled: orderStatusData.cancelled || 0,
      },
      paymentStatusStats: {
        pending: paymentStatusData.pending || 0,
        paid: paymentStatusData.paid || 0,
        failed: paymentStatusData.failed || 0,
        refunded: paymentStatusData.refunded || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard API Error:", err);
    res.status(500).json({ message: err.message });
  }
};
