
const express = require("express");
const router = express.Router();

const { logout } = require("../controllers/logoutController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, logout);

module.exports = router;
