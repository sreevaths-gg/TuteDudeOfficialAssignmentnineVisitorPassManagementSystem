
const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getCheckLogs,
  getCheckLogById
} = require("../controllers/checkLogController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Check in a visitor
router.post(
  "/checkin",
  authMiddleware,
  roleMiddleware("admin", "security"),
  checkIn
);

// Check out a visitor
router.put(
  "/checkout/:id",
  authMiddleware,
  roleMiddleware("admin", "security"),
  checkOut
);

// View check logs
router.get(
  "/checklogs",
  authMiddleware,
  roleMiddleware("admin", "security"),
  getCheckLogs
);

// View a specific check log
router.get(
  "/checklogs/:id",
  authMiddleware,
  roleMiddleware("admin", "security", "employee"),
  getCheckLogById
);

module.exports = router;
