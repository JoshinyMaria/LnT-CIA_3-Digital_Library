const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const generateMembershipId = (role, count) => {
  const prefix = role === "member" ? "MEM" : role === "librarian" ? "LIB" : "ADM";
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
};

const calculateFine = (dueDate, returnDate, finePerDay = 2) => {
  const diffTime = returnDate.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;
  return diffDays * finePerDay;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isStaff = (user) => user && ["librarian", "admin"].includes(user.role);

const isOwnerOrStaff = (user, ownerId) =>
  isStaff(user) || (ownerId && user._id.toString() === ownerId.toString());

module.exports = {
  generateToken,
  paginate,
  generateMembershipId,
  calculateFine,
  addDays,
  isStaff,
  isOwnerOrStaff,
};
