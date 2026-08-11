const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });
}

async function sendApprovalEmail(alumni) {
  if (!alumni || !alumni.email) return;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    const transporter = createTransporter();
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await transporter.sendMail({
      from: `"Alumni Portal" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: alumni.email,
      subject: '🎉 Your Registration is Approved — Welcome to Alumni Portal!',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fa;padding:32px 16px;">
          <div style="background:#197fe6;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 6px;">Welcome to Alumni Portal!</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Your registration has been officially approved.</p>
          </div>
          <div style="background:#fff;border-radius:0 0 16px 16px;padding:36px 40px;">
            <p style="font-size:16px;color:#1a2744;font-weight:700;margin:0 0 8px;">Dear ${alumni.name},</p>
            <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">
              Your alumni registration has been <strong style="color:#16a34a;">approved</strong>. You are now an official member!
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${loginUrl}/user/login" style="display:inline-block;background:#197fe6;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
                Login to Your Account →
              </a>
            </div>
          </div>
        </div>
      `
    });
    console.log(`✅ Approval email sent to ${alumni.email}`);
  } catch (emailErr) {
    console.error('⚠️ Could not send approval email:', emailErr.message);
  }
}

module.exports = { createTransporter, sendApprovalEmail };
