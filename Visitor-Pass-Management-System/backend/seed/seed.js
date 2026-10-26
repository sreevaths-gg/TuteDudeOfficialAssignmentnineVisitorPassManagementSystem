const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') // points one folder up from the current file
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
console.log(process.env.MONGO_URI);
const connectDB = require("../config/db");

const User = require("../models/User");
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");

const seedData = async () => {
  try {

    await connectDB();

    // Clear Existing Data
    await User.deleteMany();
    await Visitor.deleteMany();
    await Appointment.deleteMany();

    console.log("Old Data Removed");

    // Create Users

    const hashedPassword =
      await bcrypt.hash("123456", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    const employee = await User.create({
      name: "Employee User",
      email: "employee@gmail.com",
      password: hashedPassword,
      role: "employee"
    });

    console.log("Users Added");

    // Create Visitors

    const visitor1 = await Visitor.create({
      fullName: "John Doe",
      phone: "9999999999",
      email: "john@gmail.com",
      company: "ABC Pvt Ltd"
    });

    const visitor2 = await Visitor.create({
      fullName: "John Kole",
      phone: "8888888888",
      email: "kole@gmail.com",
      company: "BNM Pvt Ltd"
    });

    console.log("Visitors Added");

    // Create Appointments

    await Appointment.create({
      visitorId: visitor1._id,
      visitorName: visitor1.fullName,
      employeeId: employee._id,
      purpose: "Interview",
      visitDate: new Date("2026-10-25"),
      status: "approved"
    });

    await Appointment.create({
      visitorId: visitor2._id,
      visitorName: visitor2.fullName,
      employeeId: employee._id,
      purpose: "Meeting",
      visitDate: new Date("2026-10-26"),
      status: "pending"
    });

    console.log("Appointments Added");

    console.log("Seed Data Inserted Successfully");

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
};

seedData();