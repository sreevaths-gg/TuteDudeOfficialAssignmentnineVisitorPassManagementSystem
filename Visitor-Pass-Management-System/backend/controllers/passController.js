const path = require("path");

const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");
const { sendSMS } = require("../utils/smsGenerator");
const generateQR = require("../utils/qrGenerator");
const generatePDF = require("../utils/pdfGenerator");
const sendEmail = require("../utils/emailService");

// Generate Pass
exports.generatePass = async (req, res) => {
  try {
    const visitor = await Visitor.findById(
      req.body.visitorId
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    const passNumber = "PASS" + Date.now();

    // Create pass
    let pass = await Pass.create({
      visitorId: visitor._id,
      appointmentId: req.body.appointmentId,
      visitorName: visitor?.fullName??"Name not available",
      email: visitor.email,
      phone: visitor.phone,
      company: visitor.company,
      passNumber,
      status: "active"
    });

    // Generate QR
    const qrCode = await generateQR(pass);

    pass.qrCode = qrCode;

    await pass.save();

    // Generate PDF
    const pdfPath = await generatePDF(pass);

    // Send Email
    await sendEmail(
      pass.email,
      "Visitor Pass Generated",
      `Hello ${pass.visitorName},

Your visitor pass has been generated successfully.

Pass Number: ${pass.passNumber},
Name : ${pass.visitorName},
Company: ${pass.company}
Status: ${pass.status}
Email: ${pass.email},
Phone: ${pass.phone},
Company: ${pass.company},
        
Please find the attached PDF pass.

Thank you,
Visitor Management System`,
      pdfPath
    );



    res.status(201).json({
      success: true,
      message: "Pass generated successfully",
      pass: {
        passId: pass._id,
        visitorId: pass.visitorId,
        visitorName: pass.visitorName,
        email: pass.email,
        phone: pass.phone,
        company: pass.company,
        passNumber: pass.passNumber,
        qrCode: pass.qrCode,
        status: pass.status,
        pdf: pdfPath
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


exports.sendPassSMS = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Pass not found",
      });
    }

    if (!pass.phone) {
      return res.status(400).json({
        success: false,
        message: "Visitor phone number is missing.",
      });
    }

    const sms = await sendSMS(pass);

    return res.status(200).json({
      success: true,
      message: "Visitor pass SMS sent successfully.",
      smsSid: sms.sid,
    });
  } catch (error) {
    console.error("SMS sending error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send SMS.",
    });
  }
};


// Get All Passes
exports.getPasses = async (req, res) => {
  try {

    const passes = await Pass.find();

    res.status(200).json({
      success: true,
      totalPasses: passes.length,
      passes: passes.map((pass) => ({
        passId: pass._id,
        visitorId: pass.visitorId,
        visitorName: pass.visitorName,
         appointmentId: pass.appointmentId,
        email: pass.email,
        phone: pass.phone,
        company: pass.company,
        passNumber: pass.passNumber,
        qrCode: pass.qrCode,
        status: pass.status,
        issueDate: pass.issueDate,
        expiryDate: pass.expiryDate,
        
        createdAt: pass.createdAt
      }))
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get Single Pass
exports.getPassById = async (req, res) => {
  try {

    const pass = await Pass.findById(
      req.params.id
    );

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Pass not found"
      });
    }

    res.status(200).json({
      success: true,
      pass: {
        passId: pass._id,
        visitorId: pass.visitorId,
        visitorName: pass.visitorName,
        email: pass.email,
        phone: pass.phone,
        company: pass.company,
        passNumber: pass.passNumber,
        qrCode: pass.qrCode,
        status: pass.status,
        createdAt: pass.createdAt
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Download PDF
exports.downloadPassPDF = async (req, res) => {
  try {

    const filePath = path.join(
      __dirname,
      "../uploads",
      `${req.params.id}.pdf`
    );

    res.download(filePath);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Verify Pass
exports.verifyPass = async (req, res) => {
  try {

    const pass = await Pass.findById(
      req.params.id
    );

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Invalid Pass"
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      pass: {
        passId: pass._id,
        visitorId: pass.visitorId,
        visitorName: pass.visitorName,
        email: pass.email,
        phone: pass.phone,
        company: pass.company,
        passNumber: pass.passNumber,
        status: pass.status
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

//Get My Visitor Pass Details

exports.getMyPass = async (req, res) => {
  try {
    console.log("Logged-in user:", req.user);

    const visitor = await Visitor.findOne({
      email: req.user.email,
    }).lean();

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor profile not found for this email.",
      });
    }

    console.log("Visitor ID:", visitor._id);

    const pass = await Pass.findOne({
      visitorId: visitor._id,
    }).lean();

  //  console.log("Pass found:", pass);

    if (!pass) {
      return res.status(404).json({
        message: "No generated pass is linked to this visitor.",
      });
    }

    return res.status(200).json({ pass });
  } catch (error) {
    console.error("Get my pass error:", error);

    return res.status(500).json({
      message: "Unable to load your pass.",
    });
  }
};



