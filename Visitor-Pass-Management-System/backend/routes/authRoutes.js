const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

// Public registration
router.post("/register", register);

// Public login
router.post("/login", login);

module.exports = router;