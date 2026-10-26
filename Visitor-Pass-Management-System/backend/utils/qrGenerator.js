const QRCode = require("qrcode");

const generateQR = async (pass) => {
  try {
    const qrData = JSON.stringify({
      passId: pass._id,
      visitorName: pass.visitorName,
      email: pass.email,
      phone: pass.phone,
      passNumber: pass.passNumber,
      status: pass.status
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    return qrCode;
  } catch (error) {
    throw error;
  }
};

module.exports = generateQR;