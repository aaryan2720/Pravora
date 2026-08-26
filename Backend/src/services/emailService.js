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
      from: process.env.EMAIL_FROM || 'Pravora <noreply@pravora.in>',
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('❌  Email send error:', err.message);
    // Never throw — email failure should not break the API
    // Helper to generate a unified, premium HTML card template for Pravora emails
    const getBrandedHtml = (title, contentHtml) => {
      const logoUrl = `${process.env.FRONTEND_URL || 'https://pravora-20.vercel.app'}/favicon.svg`;
      return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
      <!-- Header banner -->
      <div style="background-color: #FFF8F2; padding: 24px; text-align: center; border-bottom: 1px solid #ECECEC;">
        <img src="${logoUrl}" alt="Pravora Logo" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 8px;" />
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #1F1F1F; font-family: sans-serif;">
          <span style="color: #E96A0A;">Pra</span><span style="color: #F58A1F;">vora</span>
        </h2>
        <p style="margin: 4px 0 0 0; color: #666666; font-size: 12px; font-weight: 500;">Smart Restaurant Operations</p>
      </div>

      <!-- Main Body Content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <h3 style="margin-top: 0; color: #1F1F1F; font-size: 17px; font-weight: 700; font-family: sans-serif; border-bottom: 2px solid #FFF8F2; padding-bottom: 12px;">
          ${title}
        </h3>
        <div style="color: #475569; font-size: 14px; line-height: 1.6;">
          ${contentHtml}
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #FFFDF9; border-top: 1px solid #ECECEC; padding: 20px; text-align: center; color: #666666; font-size: 11px;">
        <p style="margin: 0 0 4px 0;">Served by <a href="${process.env.FRONTEND_URL || 'https://pravora-20.vercel.app'}" style="color: #E96A0A; text-decoration: none; font-weight: bold;">Pravora</a> — Smart Restaurant Operations Platform</p>
        <p style="margin: 0; color: #94a3b8; font-size: 10px;">© 2026 Pravora. All rights reserved.</p>
      </div>
    </div>
  `;
    };

    // ─── Email Templates ──────────────────────────────────────────────────────────

    const sendWelcomeEmail = async (user) => {
      const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Your restaurant owner account has been successfully created. You are one step closer to automating and elevating your restaurant operations.</p>
    <p>Please complete your quick onboarding wizard to set up your tables, catalog menus, and go live:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding" 
         style="display:inline-block; background: linear-gradient(135deg, #E96A0A, #F58A1F); color:#ffffff; padding:12px 28px; border-radius:12px; text-decoration:none; font-weight:bold; box-shadow: 0 4px 12px rgba(233,106,10,0.25);">
        Complete Setup & Go Live
      </a>
    </div>
  `;
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Pravora! 🍽️',
        html: getBrandedHtml(`Welcome to Pravora, ${user.name}!`, content),
        text: `Welcome to Pravora, ${user.name}! Complete your setup at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding`,
      });
    };

    const sendReservationConfirmation = async ({ guestEmail, guestName, restaurantName, date, time, partySize }) => {
      const content = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Your table booking at <strong>${restaurantName}</strong> has been successfully confirmed. Here are your reservation details:</p>
    <div style="background-color: #FFF8F2; padding: 16px; border-radius: 12px; border: 1px solid rgba(233,106,10,0.1); margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #1F1F1F;">Restaurant:</td>
          <td style="padding: 4px 0; text-align: right;">${restaurantName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #1F1F1F;">Date:</td>
          <td style="padding: 4px 0; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #1F1F1F;">Time:</td>
          <td style="padding: 4px 0; text-align: right;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #1F1F1F;">Party Size:</td>
          <td style="padding: 4px 0; text-align: right;">${partySize} guests</td>
        </tr>
      </table>
    </div>
    <p>We look forward to hosting you. If you need to make changes, please contact the restaurant directly.</p>
  `;
      await sendEmail({
        to: guestEmail,
        subject: `Reservation Confirmed — ${restaurantName}`,
        html: getBrandedHtml('Your reservation is confirmed! 🎉', content),
        text: `Reservation confirmed at ${restaurantName} for ${date} at ${time} for ${partySize} guests.`,
      });
    };

    const sendBillReadyEmail = async ({ guestEmail, guestName, restaurantName, total }) => {
      const content = `
    <p>Hi <strong>${guestName}</strong>,</p>
    <p>Your dining session at <strong>${restaurantName}</strong> has concluded, and your bill is ready for settlement.</p>
    <div style="background-color: #FFF8F2; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(233,106,10,0.1); margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #666666;">Grand Total</p>
      <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: 800; color: #E96A0A;">₹${total}</p>
    </div>
    <p>Please check your table screen or phone session to complete the payment via cash, card, or UPI.</p>
  `;
      await sendEmail({
        to: guestEmail,
        subject: `Your bill is ready — ${restaurantName}`,
        html: getBrandedHtml('Your bill is ready 🧾', content),
        text: `Your bill at ${restaurantName} is ready. Total: ₹${total}`,
      });
    };

    const sendGuestWelcomeEmail = async (guest) => {
      const content = `
    <p>Hi <strong>${guest.name}</strong>,</p>
    <p>Welcome to the Diner Circle! You have successfully created your diner account. Get ready to experience seamless dining at all partner cafes:</p>
    <div style="background-color: #FFF8F2; border-radius: 12px; padding: 20px; border: 1px solid rgba(233,106,10,0.1); margin: 20px 0;">
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #475569;">
        <li><strong>Instant Ordering:</strong> Scan table QRs to place orders directly to the kitchen.</li>
        <li><strong>Loyalty Perks:</strong> Earn points on every visit and unlock gold/platinum tiers.</li>
        <li><strong>AI Allergy Filters:</strong> Preferences automatic safety filtering on menus.</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.FRONTEND_URL || 'https://pravora-20.vercel.app'}/discover" 
         style="display:inline-block; background: linear-gradient(135deg, #E96A0A, #F58A1F); color:#ffffff; padding:12px 28px; border-radius:12px; text-decoration:none; font-weight:bold; box-shadow: 0 4px 12px rgba(233,106,10,0.25);">
        Explore Cafe Directory
      </a>
    </div>
  `;
      await sendEmail({
        to: guest.email,
        subject: 'Welcome to Pravora Diner Circle! 🍽️',
        html: getBrandedHtml(`Welcome to the Diner Circle, ${guest.name}! 🎉`, content),
        text: `Welcome to Pravora, ${guest.name}! Start exploring restaurants at ${process.env.FRONTEND_URL || 'https://pravora-20.vercel.app'}/discover`,
      });
    };

    const sendReceiptEmail = async ({ guestEmail, guestName, bill }) => {
      let name = 'Our Cafe';
      let logo = '';
      let brandColor = '#E96A0A';
      let tagline = 'Thank you for dining with us';

      try {
        const Restaurant = require('../models/Restaurant');
        const restaurant = await Restaurant.findById(bill.restaurantId).lean();
        if (restaurant) {
          name = restaurant.name;
          logo = restaurant.logo;
          brandColor = restaurant.brandColor || '#E96A0A';
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
            Served by <a href="${process.env.FRONTEND_URL || 'https://pravora-20.vercel.app'}" style="color: #E96A0A; text-decoration: none; font-weight: bold;">Pravora</a> — Smart Restaurant Operations
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
    }
  }
};
