const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const authMiddleware = require("../middleware/authMiddleware");

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }
    if (email === "admin") {
      return res
        .status(400)
        .json({ message: "Không thể đăng ký tài khoản admin." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .json({ success: false, message: "Email đã tồn tại." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: "user",
    });
    await user.save();
    res.status(201).json({ success: true, message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Đăng nhập admin
    if (email === "admin@example.com") {
      const adminUser = await User.findOne({
        email: "admin@example.com",
        role: "admin",
      });
      if (!adminUser) {
        return res.status(200).json({
          success: false,
          message: "Tài khoản admin chưa được khởi tạo.",
        });
      }
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (!isMatch) {
        return res
          .status(200)
          .json({ success: false, message: "Email hoặc mật khẩu không đúng." });
      }
      const token = jwt.sign(
        { userId: adminUser._id, role: adminUser.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );
      adminUser.last_login = new Date();
      await adminUser.save();
      return res.json({
        success: true,
        token,
        user: {
          _id: adminUser._id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          avatar: adminUser.avatar,
          current_level: adminUser.current_level,
        },
      });
    }
    // Đăng nhập user thường
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    user.last_login = new Date();
    await user.save();
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        current_level: user.current_level,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

// Cập nhật thông tin cá nhân user
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, avatar, email } = req.body;
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (email) user.email = email;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

module.exports = router;
