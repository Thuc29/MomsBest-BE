const User = require("../model/User");
const UserPointsHistory = require("../model/UserPointsHistory");
const pointsConfig = require("../config/pointsConfig");

async function addUserPoints({
  userId,
  actionType,
  referenceId,
  referenceType,
  description,
}) {
  const points = pointsConfig[actionType] || 0;
  if (points === 0) return;
  await UserPointsHistory.create({
    user_id: userId,
    action_type: actionType,
    points_earned: points,
    description,
    reference_id: referenceId,
    reference_type: referenceType,
  });
  const user = await User.findById(userId);
  if (user) {
    user.total_points += points;
    await user.save();
  }
}

module.exports = { addUserPoints };
