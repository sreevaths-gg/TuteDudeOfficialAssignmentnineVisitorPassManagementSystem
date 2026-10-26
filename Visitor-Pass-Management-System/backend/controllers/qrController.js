const Pass = require("../models/Pass");

const verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        message: "QR code is required",
      });
    }

    const pass = await Pass.findOne({ qrCode });

    if (!pass) {
      return res.status(404).json({
        message: "Invalid QR code or pass not found",
      });
    }

    return res.status(200).json({
      message: "QR code verified successfully",
      pass,
    });
  } catch (error) {
    console.error("QR verification error:", error);

    return res.status(500).json({
      message: "Server error while verifying QR code",
    });
  }
};

module.exports = { verifyQRCode };