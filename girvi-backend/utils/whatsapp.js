const twilio = require("twilio");

let client = null;

const initTwilio = () => {
  const { TWILIO_SID, TWILIO_AUTH } = process.env;
  if (!TWILIO_SID || !TWILIO_AUTH) {
    console.warn("Twilio env vars are missing; WhatsApp messages will not send");
    return;
  }

  client = twilio(TWILIO_SID, TWILIO_AUTH);
};

const sendWhatsAppMessage = async (to, message) => {
  try {
    if (!client) return;
    if (!to || !message) return;

    const from = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!from) {
      console.warn("TWILIO_WHATSAPP_NUMBER is not set");
      return;
    }

    await client.messages.create({
      from,
      to: `whatsapp:${to.replace(/^whatsapp:/, "")}`,
      body: message
    });
  } catch (err) {
    console.error("WhatsApp send failed:", err.message);
  }
};

module.exports = { initTwilio, sendWhatsAppMessage };
