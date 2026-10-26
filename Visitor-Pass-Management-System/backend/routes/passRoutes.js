
const express = require("express");
const router = express.Router();

const {
  generatePass,
  getPasses,
  getPassById,
  downloadPassPDF,  sendPassSMS, getMyPass,
} = require("../controllers/passController");

const sendPassEmail = require(
  "../controllers/sendPassEmailController"
);

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Generate a pass
router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("admin", "security"),
  generatePass
);

// List passes (controller must filter records by role)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "security", "employee"),
  getPasses
);
// View  my visitor pass
router.get(
  "/me",
   authMiddleware,
   roleMiddleware("visitor"),
   getMyPass,
   
);

// View a particular pass
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "security",  "visitor"),
  getPassById
);

// Download pass PDF
router.get(
  "/:id/pdf",
  authMiddleware,
  roleMiddleware("admin", "security", "employee", "visitor"),
  downloadPassPDF
);

// Email a pass
router.post(
  "/:id/email",
  authMiddleware,
  roleMiddleware("admin", "security", "employee", "visitor"),
  sendPassEmail
);

// SMS a pass
router.post(
  "/:id/sms",
  authMiddleware,
  roleMiddleware("admin", "security", "employee", "visitor"),
  sendPassSMS
);



module.exports = router;
