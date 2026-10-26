
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Create a staff account (Admin only)
const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const allowedRoles = ["admin", "security", "employee"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create staff user failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create staff account",
    });
  }
};

// Get all users for the Admin table
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

module.exports = {
  createStaffUser,
  getAllUsers,
};
