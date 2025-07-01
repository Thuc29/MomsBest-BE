const User = require("../../model/User");
const Product = require("../../model/Product");
const Order = require("../../model/Order");
const ForumThread = require("../../model/ForumThread");
const ForumComment = require("../../model/ForumComment");
const Article = require("../../model/Article");

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
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      ForumThread.countDocuments(),
      ForumComment.countDocuments(),
      Article.countDocuments(),
    ]);
    res.json({
      userCount,
      productCount,
      orderCount,
      totalRevenue: totalRevenue[0]?.total || 0,
      threadCount,
      commentCount,
      articleCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
