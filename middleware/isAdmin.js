const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async function (req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, access denied" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn đã bị vô hiệu hóa" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
