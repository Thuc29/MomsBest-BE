const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const dashboardController = require("../controller/admin/dashboard");
const userController = require("../controller/admin/user");
const productController = require("../controller/admin/product");
const categoryController = require("../controller/admin/category");
const orderController = require("../controller/admin/order");
const articleController = require("../controller/admin/article");
const forumThreadController = require("../controller/admin/forumThread");
const forumCommentController = require("../controller/admin/forumComment");

router.get("/dashboard", isAdmin, dashboardController.getDashboardStats);

// Quản lý tài khoản
router.get("/users", isAdmin, userController.getUsers);
router.get("/users/:id", isAdmin, userController.getUserById);
router.post("/users", isAdmin, userController.createUser);
router.put("/users/:id", isAdmin, userController.updateUser);
router.delete("/users/:id", isAdmin, userController.deleteUser);
router.patch("/users/:id/toggle-active", isAdmin, userController.toggleActive);
router.patch("/users/:id/change-role", isAdmin, userController.changeRole);

// Quản lý sản phẩm
router.get("/products", isAdmin, productController.getProducts);
router.get("/products/:id", isAdmin, productController.getProductById);
router.post("/products", isAdmin, productController.createProduct);
router.put("/products/:id", isAdmin, productController.updateProduct);
router.delete("/products/:id", isAdmin, productController.deleteProduct);
router.patch(
  "/products/:id/toggle-active",
  isAdmin,
  productController.toggleActive
);

// Quản lý danh mục
router.get("/categories", isAdmin, categoryController.getCategories);
router.get("/categories/:id", isAdmin, categoryController.getCategoryById);
router.post("/categories", isAdmin, categoryController.createCategory);
router.put("/categories/:id", isAdmin, categoryController.updateCategory);
router.delete("/categories/:id", isAdmin, categoryController.deleteCategory);
router.patch(
  "/categories/:id/toggle-active",
  isAdmin,
  categoryController.toggleActive
);

// Quản lý đơn hàng
router.get("/orders", isAdmin, orderController.getOrders);
router.get("/orders/:id", isAdmin, orderController.getOrderById);
router.patch("/orders/:id", isAdmin, orderController.updateOrderStatus);
router.delete("/orders/:id", isAdmin, orderController.deleteOrder);

// Quản lý bài viết
router.get("/articles", isAdmin, articleController.getArticles);
router.get("/articles/:id", isAdmin, articleController.getArticleById);
router.post("/articles", isAdmin, articleController.createArticle);
router.put("/articles/:id", isAdmin, articleController.updateArticle);
router.delete("/articles/:id", isAdmin, articleController.deleteArticle);
router.patch(
  "/articles/:id/toggle-published",
  isAdmin,
  articleController.togglePublished
);

// Quản lý chủ đề forum
router.get("/forumthreads", isAdmin, forumThreadController.getThreads);
router.get("/forumthreads/:id", isAdmin, forumThreadController.getThreadById);
router.delete("/forumthreads/:id", isAdmin, forumThreadController.deleteThread);
router.patch(
  "/forumthreads/:id/toggle-pinned",
  isAdmin,
  forumThreadController.togglePinned
);

// Quản lý bình luận forum
router.get("/forumcomments", isAdmin, forumCommentController.getComments);
router.delete(
  "/forumcomments/:id",
  isAdmin,
  forumCommentController.deleteComment
);

module.exports = router;
