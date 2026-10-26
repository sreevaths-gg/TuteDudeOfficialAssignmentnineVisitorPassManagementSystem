
const fs = require("fs");
const path = require("path");

const Pass = require("../models/Pass");
const sendEmail = require("../utils/emailService");

const sendPassEmail = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        message: "Visitor pass not found",
      });
    }

    // Update this field if your PDF path is stored differently.
    const pdfPath = path.join(
      __dirname,
      "..",
      "uploads",
      `${pass._id}.pdf`
    );

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        message: "Pass PDF file not found",
      });
    }

    await sendEmail(
      pass.email,
      "Visitor Pass Generated",
      `Hello ${pass.visitorName},

Your visitor pass has been generated successfully.

Pass Number: ${pass.passNumber}
Name: ${pass.visitorName}
Company: ${pass.company}
Status: ${pass.status}
Email: ${pass.email}
Phone: ${pass.phone}

Please find the attached PDF pass.

Thank you,
Visitor Management System`,
      pdfPath
    );

    return res.status(200).json({
      message: "Visitor pass email sent successfully",
    });
  } catch (error) {
    console.error("Send pass email error:", error);

    return res.status(500).json({
      message: "Failed to send visitor pass email",
    });
  }
};

module.exports = sendPassEmail;
