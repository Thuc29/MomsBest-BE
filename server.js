const express = require("express");
const connectDB = require("./config/db");
const { json, urlencoded } = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const app = express();
const authRouter = require("./routers/auth");
const categoryRouter = require("./routers/category");
const forumThreadRouter = require("./routers/forumThread");
const forumCommentRouter = require("./routers/forumComment");
const productRouter = require("./routers/product");
const productReviewRouter = require("./routers/review");
const orderRouter = require("./routers/order");
const chatbotRouter = require("./routers/chatbot");
const adminRouter = require("./routers/admin");
const adminUserController = require("./controller/admin/user");
const favoriteRouter = require("./routers/favorite");

// Connect Database
connectDB();
adminUserController.createDefaultAdmin();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://momsbest-fe.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
  })
);
app.use(express.json());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

// Cho phép truy cập ảnh review qua URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/forumthreads", forumThreadRouter);
app.use("/api/forumcomments", forumCommentRouter);
app.use("/api/products", productRouter);
app.use("/api/productReviews", productReviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/admin", adminRouter);
app.use("/api/favorite", favoriteRouter);

const PORT = process.env.PORT || 9999;

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
