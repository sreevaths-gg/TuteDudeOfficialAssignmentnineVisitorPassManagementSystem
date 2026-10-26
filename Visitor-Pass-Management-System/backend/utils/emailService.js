const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendEmail = async (
  email,
  subject,
  text,
  pdfPath = null
) => {
  try {

    const mailOptions = {
      from: "visitorpass@vms.com",
      to: email,
      subject,
      text
    };

    if (pdfPath) {
      mailOptions.attachments = [
        {
          filename: "VisitorPass.pdf",
          path: pdfPath
        }
      ];
    }

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Email Sent:",
      info.messageId
    );

  } catch (error) {

    console.log(
      "Mail Error:",
      error.message
    );

  }
};

module.exports = sendEmail;