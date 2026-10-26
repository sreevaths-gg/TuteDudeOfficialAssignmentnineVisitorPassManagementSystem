require("dotenv").config();
const twilio = require("twilio");

const generateSMS = (pass) => {
  return `Hello ${pass.visitorName || "Visitor"},

Your visitor pass has been generated successfully.

Pass Number: ${pass.passNumber}
Company: ${pass.company || "N/A"}
Status: ${pass.status}

Please keep your pass number for verification.

Thank you,
Visitor Management System`;
};

const sendSMS = async (pass) => {
  if (!pass.phone) {
    throw new Error("Visitor phone number is missing.");
  }

  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    throw new Error("SMS provider configuration is missing.");
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
  const message = await client.messages.create({
    body: generateSMS(pass),
    from: process.env.TWILIO_PHONE_NUMBER,
    to: pass.phone,
  });

  console.log("SMS status:", message.status);
  console.log("Twilio message SID:", message.sid);

  return message;
} catch (error) {
  console.error("Twilio error code:", error.code);
  console.error("Twilio error message:", error.message);
  throw error;
}
};

module.exports = { generateSMS, sendSMS };
