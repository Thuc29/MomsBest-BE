const User = require("../../model/User");
const bcrypt = require("bcryptjs");

// Lấy danh sách tài khoản (có phân trang, tìm kiếm, chỉ lấy user thường)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = search
      ? {
          $and: [
            { role: "user" },
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
              ],
            },
          ],
        }
      : { role: "user" };
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết tài khoản
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo tài khoản mới (admin tạo)
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const user = new User({ email, password, name, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật thông tin tài khoản
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa tài khoản
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi trạng thái hoạt động
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.is_active = !user.is_active;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi vai trò
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Hàm khởi tạo tài khoản admin mặc định
exports.createDefaultAdmin = async () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";
  const adminName = "Admin";
  const existing = await User.findOne({ email: adminEmail, role: "admin" });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "admin",
      is_active: true,
    });
    console.log("Tạo tài khoản admin mặc định: admin@example.com / admin123");
  }
};
