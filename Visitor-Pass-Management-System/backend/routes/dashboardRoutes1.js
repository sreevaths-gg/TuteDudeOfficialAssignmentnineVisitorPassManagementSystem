

const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// View dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getStats
);

module.exports = router;
