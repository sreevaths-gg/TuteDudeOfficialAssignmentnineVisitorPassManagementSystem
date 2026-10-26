
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getMyAccess,
  verifyRoleAccess,
} = require("../controllers/rbacController");

// Check the logged-in user's role and permissions
router.get(
  "/my-access",
  authMiddleware,
  getMyAccess
);

// Admin-only verification
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("Admin"),
  verifyRoleAccess
);

// security-only verification
router.get(
  "/security",
  authMiddleware,
  roleMiddleware("security"),
  verifyRoleAccess
);

// Employee-only verification
router.get(
  "/employee",
  authMiddleware,
  roleMiddleware("Employee"),
  verifyRoleAccess
);

// Visitor-only verification
router.get(
  "/visitor",
  authMiddleware,
  roleMiddleware("Visitor"),
  verifyRoleAccess
);

module.exports = router;
