
const express = require("express");
const router = express.Router();

const {
  getStats,
  getPasses,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Dashboard statistics: admin only.
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getStats
);

// Search, filter and paginate passes: admin only.
router.get(
  "/passes",
  authMiddleware,
  roleMiddleware("admin"),
  getPasses
);

module.exports = router;
