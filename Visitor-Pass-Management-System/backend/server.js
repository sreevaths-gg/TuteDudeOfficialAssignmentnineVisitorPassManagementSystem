require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const passRoutes = require("./routes/passRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const checkLogRoutes = require("./routes/checklogRoutes");
const reportRoutes =  require("./routes/reportRoutes");
const rbacRoutes = require("./routes/rbacRoutes");
const userRoutes = require("./routes/userRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const qrRoutes = require("./routes/qrRoutes");


const app = express();

// Database Connection
connectDB();



// 1. Global middleware
app.use(cors());
app.use(express.json());

// 2. Public authentication routes (login/register)
app.use("/api/auth", authRoutes);

// 3. RBAC verification routes
app.use("/api/rbac", rbacRoutes);

// 4. Application routes
// Authorization must be applied inside each route file.
app.use("/api/visitors", visitorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", checkLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/qr", qrRoutes);
// Static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Home Route
app.get("/", (req, res) => {
  res.send("Visitor Pass Management API Running");
});


// Handle errors, including Multer file-upload errors.
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Photo size must not exceed 5 MB"
          : err.message,
    });
  }

  if (
    err.message ===
    "Only JPG, PNG, and WEBP images are allowed"
  ) {
    return res.status(400).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
