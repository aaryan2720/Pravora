const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('⚠️  Email service not configured. Skipping email send.');
    return;
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'ServeLoop <noreply@serveloop.in>',
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('❌  Email send error:', err.message);
    // Never throw — email failure should not break the API
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to ServeLoop! 🍽️',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Welcome to ServeLoop, ${user.name}!</h2>
        <p>Your restaurant account has been created. Start by completing your onboarding setup to go live.</p>
        <a href="${process.env.FRONTEND_URL}/onboarding" 
           style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Complete Setup
        </a>
        <p style="color:#888;margin-top:24px;font-size:12px;">ServeLoop — Smart Restaurant Operations</p>
      </div>
    `,
    text: `Welcome to ServeLoop, ${user.name}! Complete your setup at ${process.env.FRONTEND_URL}/onboarding`,
  });
};

const sendReservationConfirmation = async ({ guestEmail, guestName, restaurantName, date, time, partySize }) => {
  await sendEmail({
    to: guestEmail,
    subject: `Reservation Confirmed — ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Your reservation is confirmed! 🎉</h2>
        <p>Hi ${guestName},</p>
        <p>Your table at <strong>${restaurantName}</strong> has been confirmed:</p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Party size:</strong> ${partySize} guests</li>
        </ul>
        <p>We look forward to seeing you!</p>
      </div>
    `,
    text: `Reservation confirmed at ${restaurantName} for ${date} at ${time} for ${partySize} guests.`,
  });
};

const sendBillReadyEmail = async ({ guestEmail, guestName, restaurantName, total }) => {
  await sendEmail({
    to: guestEmail,
    subject: `Your bill is ready — ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Your bill is ready 🧾</h2>
        <p>Hi ${guestName},</p>
        <p>Your bill at <strong>${restaurantName}</strong> is ready.</p>
        <p style="font-size:24px;font-weight:bold;">Total: ₹${total}</p>
        <p>Thank you for dining with us!</p>
      </div>
    `,
    text: `Your bill at ${restaurantName} is ready. Total: ₹${total}`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendReservationConfirmation,
  sendBillReadyEmail,
};
