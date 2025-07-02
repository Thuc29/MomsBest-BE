const jwt = require("jsonwebtoken");
const User = require("../model/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token); // Debug token
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token, access denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user data:", decoded);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn đã bị vô hiệu hóa" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
