const sendSMS = async ({ to, body }) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { skipped: true, reason: 'Twilio environment variables are not configured' };
  }
  if (!to) throw new Error('Recipient phone number is required');
  const twilio = require('twilio');
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client.messages.create({ from: TWILIO_PHONE_NUMBER, to, body });
};

module.exports = { sendSMS };
