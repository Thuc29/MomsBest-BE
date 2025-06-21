const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true, maxlength: 255 },
  name: { type: String, required: true, maxlength: 255 },
  avatar: { type: String, maxlength: 500 },
  phone: { type: String, maxlength: 20 },
  date_of_birth: { type: Date },
  address: { type: String },
  join_date: { type: Date, default: Date.now },
  last_login: { type: Date },
  is_active: { type: Boolean, default: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  total_points: { type: Number, default: 0 },
  current_level: { type: String, default: "Thành viên mới", maxlength: 50 },
  bio: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Định nghĩa bảng level
const LEVELS = [
  { name: "Thành viên mới", min: 0, max: 10 },
  { name: "Thành viên đồng", min: 10, max: 20 },
  { name: "Thành viên bạc", min: 20, max: 999 },
  { name: "Thành viên vàng", min: 1000, max: Infinity },
];
function getLevelByPoints(points) {
  return LEVELS.find((lv) => points >= lv.min && points <= lv.max).name;
}

userSchema.pre("save", function (next) {
  if (typeof this.total_points === "number") {
    const newLevel = getLevelByPoints(this.total_points);
    if (this.current_level !== newLevel) {
      this.current_level = newLevel;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
