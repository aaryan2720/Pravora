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

const sendGuestWelcomeEmail = async (guest) => {
  await sendEmail({
    to: guest.email,
    subject: 'Welcome to the Foodie Loop! 🍽️',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 16px; padding: 24px; background-color: #fafafa;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #fd6d23; font-weight: 900; margin: 0;">ServeLoop</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Smart Dining & Loyalty Rewards</p>
        </div>
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Welcome to the Loop, ${guest.name}! 🎉</h3>
          <p style="color: #334155; line-height: 1.6;">You've successfully created your diner account. Get ready to experience seamless dining:</p>
          <ul style="color: #334155; padding-left: 20px; line-height: 1.8;">
            <li><strong>Instant ordering:</strong> Scan table QRs to place orders directly to the kitchen.</li>
            <li><strong>Loyalty points:</strong> Earn points on every rupee spent and unlock rewards.</li>
            <li><strong>Kitchen tracking:</strong> Watch your food transition from prepping to serving live!</li>
          </ul>
          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/discover" 
               style="display:inline-block; background: linear-gradient(135deg, #fd6d23, #f59e0b); color:#fff; padding:12px 28px; border-radius:12px; text-decoration:none; font-weight:bold; box-shadow: 0 4px 12px rgba(253,109,35,0.25);">
              Explore Restaurants
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="color:#94a3b8; font-size:11px; margin: 0;">Served by ServeLoop — Smart Restaurant Operations</p>
        </div>
      </div>
    `,
    text: `Welcome to ServeLoop, ${guest.name}! Start exploring restaurants at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/discover`,
  });
};

const sendReceiptEmail = async ({ guestEmail, guestName, bill }) => {
  let name = 'Our Cafe';
  let logo = '';
  let brandColor = '#fd6d23';
  let tagline = 'Thank you for dining with us';

  try {
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(bill.restaurantId).lean();
    if (restaurant) {
      name = restaurant.name;
      logo = restaurant.logo;
      brandColor = restaurant.brandColor || '#fd6d23';
      tagline = restaurant.tagline || 'Thank you for dining with us';
    }
  } catch (err) {
    console.error('Failed to load restaurant details for receipt:', err);
  }

  // Format order items lists
  let itemsHtml = '';
  if (bill.orderSnapshots && bill.orderSnapshots.length > 0) {
    for (const snap of bill.orderSnapshots) {
      for (const item of snap.items) {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #334155; font-size: 14px;">${item.qty}× ${item.name}</td>
            <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 600; font-size: 14px;">₹${item.total || (item.price * item.qty)}</td>
          </tr>
        `;
      }
    }
  }

  await sendEmail({
    to: guestEmail,
    subject: `Your receipt from ${name} 🧾`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <!-- Top branding banner -->
        <div style="background-color: ${brandColor}; padding: 30px; text-align: center; color: #ffffff;">
          ${logo ? `<img src="${logo}" alt="${name}" style="max-height: 50px; border-radius: 8px; margin-bottom: 12px; border: 2px solid #ffffff;" />` : ''}
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">${name}</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.85; font-size: 13px;">${tagline}</p>
        </div>

        <div style="padding: 30px;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Payment Receipt</h3>
          <p style="color: #64748b; font-size: 13px;">
            Hi ${guestName},<br />
            Your payment was successfully received. Here are your transaction details for Table <strong>${bill.tableLabel}</strong>.
          </p>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #f1f5f9; text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals list -->
          <div style="margin-top: 20px; border-top: 2px solid #f1f5f9; padding-top: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="color: #64748b; font-size: 13px;">
                <td style="padding: 4px 0;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right;">₹${bill.subtotal}</td>
              </tr>
              <tr style="color: #64748b; font-size: 13px;">
                <td style="padding: 4px 0;">Taxes & GST (${bill.taxRate || 10}%)</td>
                <td style="padding: 4px 0; text-align: right;">₹${bill.taxAmount}</td>
              </tr>
              <tr style="color: #64748b; font-size: 13px;">
                <td style="padding: 4px 0;">Service Charge (${bill.serviceChargeRate || 5}%)</td>
                <td style="padding: 4px 0; text-align: right;">₹${bill.serviceChargeAmount}</td>
              </tr>
              ${bill.discountAmount > 0 ? `
              <tr style="color: #10b981; font-size: 13px;">
                <td style="padding: 4px 0;">Loyalty Discount</td>
                <td style="padding: 4px 0; text-align: right;">-₹${bill.discountAmount}</td>
              </tr>
              ` : ''}
              <tr style="color: #0f172a; font-weight: 800; font-size: 16px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
                <td style="padding: 10px 0;">Grand Total Paid</td>
                <td style="padding: 10px 0; text-align: right; color: ${brandColor};">₹${bill.total}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; color: #475569; font-size: 12px; border: 1px solid #f1f5f9;">
            Paid via <strong style="text-transform: uppercase;">${bill.paymentMethod || 'Online'}</strong> on ${bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #fafafa; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0 0 4px 0;">Thank you for dining with us!</p>
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Served by <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #fd6d23; text-decoration: none; font-weight: bold;">ServeLoop</a> — Smart Restaurant Operations
          </p>
        </div>
      </div>
    `,
    text: `Your receipt from ${name} at Table ${bill.tableLabel}. Total Paid: ₹${bill.total}. Thank you for dining with us!`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendReservationConfirmation,
  sendBillReadyEmail,
  sendGuestWelcomeEmail,
  sendReceiptEmail,
};
