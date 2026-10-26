const express = require("express");
const router = express.Router();

const {
  exportVisitors,
  exportPasses,exportMyVisitor,exportMyPass,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Export visitor reports — admin only
router.get(
  "/visitors",
  authMiddleware,
  roleMiddleware("admin"),
  exportVisitors
);

// Export pass reports — admin only
router.get(
  "/passes",
  authMiddleware,
  roleMiddleware("admin"),
  exportPasses
);

router.get(
  "/visitor/me",
    authMiddleware,
  roleMiddleware("visitor"),
    exportMyVisitor,
);

router.get(
  "/pass/me",
    authMiddleware,
  roleMiddleware("visitor"),
    exportMyPass,
);
module.exports = router;