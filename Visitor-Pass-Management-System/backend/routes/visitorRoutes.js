
const express = require("express");
const router = express.Router();

const {
  createVisitor,
  getVisitors,  getMyVisitor
} = require("../controllers/visitorController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create a visitor, optionally including a photo
router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("photo"),
  roleMiddleware("admin", "security"),
  createVisitor
);

// Get visitors — Admin and Security
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "security"),
  getVisitors
);

// Get all visitors — Admin only
router.get(
  "/all-visitors",
  authMiddleware,
  roleMiddleware("admin","security"),
  getVisitors
);

// Get own visitor ID
router.get(
  "/me",
   authMiddleware,
   roleMiddleware("visitor"),
   getMyVisitor,
   
);



module.exports = router;
