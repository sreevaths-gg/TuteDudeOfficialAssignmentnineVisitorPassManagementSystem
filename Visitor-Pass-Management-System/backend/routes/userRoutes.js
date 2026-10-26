const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createStaffUser,
  getAllUsers,
} = require("../controllers/userController");

// Admin can view all users
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

// Admin can create staff accounts
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createStaffUser
);

module.exports = router;