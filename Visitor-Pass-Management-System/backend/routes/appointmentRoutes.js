
const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  approveAppointment,
  rejectAppointment
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create an appointment: Visitor or employee
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "security", "employee","visitor"),
  createAppointment
);

// View appointments: admin, security, or employee
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "security", "employee","visitor"),
  getAppointments
);

// Approve appointments: admin or employee (host)
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin", "employee","visitor", "security"),
  approveAppointment
);

// Reject appointments: admin or employee (host)
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "employee","visitor", "security"),
  rejectAppointment
);

module.exports = router;
