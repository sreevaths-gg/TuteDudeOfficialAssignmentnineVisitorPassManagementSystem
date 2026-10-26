const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { verifyQRCode } = require("../controllers/qrController");

router.post(
  "/verify",
  authMiddleware,
  roleMiddleware("admin", "security"),
  verifyQRCode
);

module.exports = router;