const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { requireDb, getDb } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// ── User Login ────────────────────────────────────────────────────────────────

router.post('/user/login', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { username, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users || users.length === 0) return res.status(401).json({ message: 'Invalid username or password' });
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid username or password' });
    const token = jwt.sign({ id: user.id, username: user.username, type: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, name: user.name });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// ── Users CRUD ────────────────────────────────────────────────────────────────

router.get('/users/check-username/:username', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [results] = await db.query('SELECT id FROM users WHERE username = ?', [req.params.username]);
    res.json({ available: !results || results.length === 0 });
  } catch (err) {
    console.error('Error checking username (users):', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!users || users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { name, username, password, place } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing && existing.length > 0) return res.status(400).json({ message: 'Username already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, username, password, place) VALUES (?, ?, ?, ?)', [name, username, hashedPassword, place]);
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { name, username, password, place } = req.body;
    const userId = req.params.id;
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
    if (existing && existing.length > 0) return res.status(400).json({ message: 'Username already exists' });
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET name=?, username=?, password=?, place=? WHERE id=?', [name, username, hashedPassword, place, userId]);
      await db.query('UPDATE alumni SET password = ? WHERE username = ?', [hashedPassword, username]);
    } else {
      await db.query('UPDATE users SET name=?, username=?, place=? WHERE id=?', [name, username, place, userId]);
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// ── Admin Approval Routes ─────────────────────────────────────────────────────

router.get('/admin/alumni/pending', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [results] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution, approval_status, created_at
       FROM alumni WHERE approval_status = 'pending' ORDER BY created_at DESC`
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching pending alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.put('/admin/alumni/:id/approve', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { id } = req.params;
    const [[alumni]] = await db.query('SELECT name, email FROM alumni WHERE id = ?', [id]);
    await db.query("UPDATE alumni SET approval_status = 'approved' WHERE id = ?", [id]);

    if (alumni && alumni.email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          tls: { rejectUnauthorized: false }
        });
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

    res.json({ message: 'Alumni approved successfully' });
  } catch (err) {
    console.error('Error approving alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.put('/admin/alumni/:id/reject', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    await db.query("UPDATE alumni SET approval_status = 'rejected' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Alumni rejected successfully' });
  } catch (err) {
    console.error('Error rejecting alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// ── Broadcast Messages ────────────────────────────────────────────────────────

async function sendBroadcastEmails(db, subject, message) {
  const [alumniList] = await db.query(
    "SELECT name, email FROM alumni WHERE approval_status = 'approved' AND is_deleted = 0 AND email IS NOT NULL AND email != ''"
  );
  if (!alumniList || alumniList.length === 0) return { sent: 0, failed: 0, total: 0 };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });

  const htmlMessage = message.replace(/\n/g, '<br/>');
  let sent = 0, failed = 0;

  for (const alumni of alumniList) {
    try {
      await transporter.sendMail({
        from: `"Alumni Portal" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: alumni.email,
        subject,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fa;padding:32px 16px;">
            <div style="background:#197fe6;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Alumni Portal</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">Message from Admin</p>
            </div>
            <div style="background:#fff;border-radius:0 0 16px 16px;padding:36px 40px;">
              <p style="font-size:16px;color:#1a2744;font-weight:700;margin:0 0 8px;">Dear ${alumni.name},</p>
              <div style="font-size:15px;color:#374151;line-height:1.8;margin:16px 0 28px;">${htmlMessage}</div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
              <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
                This message was sent by the Alumni Portal administration team.
              </p>
            </div>
          </div>
        `
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${alumni.email}:`, err.message);
      failed++;
    }
  }
  return { sent, failed, total: alumniList.length };
}

// ── Admin Change Password for Any User ───────────────────────────────────────

router.put('/admin/change-password/:source/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { source, id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    if (source === 'admin') {
      // Update users table and sync to alumni table
      const [[user]] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      await db.query('UPDATE alumni SET password = ? WHERE username = ?', [hashedPassword, user.username]);
    } else {
      // Update alumni table and sync to users table
      const [[alumni]] = await db.query('SELECT username FROM alumni WHERE id = ?', [id]);
      if (!alumni) return res.status(404).json({ message: 'Alumni not found' });
      await db.query('UPDATE alumni SET password = ? WHERE id = ?', [hashedPassword, id]);
      await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, alumni.username]);
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to update password', message: err.message });
  }
});

// List all broadcasts
router.get('/admin/broadcasts', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [rows] = await db.query('SELECT * FROM broadcast_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching broadcasts:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Send new broadcast
router.post('/admin/broadcast', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: 'Email service is not configured' });
    }
    const { sent, failed, total } = await sendBroadcastEmails(db, subject, message);
    if (total === 0) return res.status(404).json({ message: 'No approved alumni found to send email' });
    const [result] = await db.query(
      'INSERT INTO broadcast_messages (subject, message, sent_count, failed_count) VALUES (?, ?, ?, ?)',
      [subject, message, sent, failed]
    );
    res.json({ message: `Email sent to ${sent} alumni${failed > 0 ? `, ${failed} failed` : ''}`, sent, failed, total, id: result.insertId });
  } catch (err) {
    console.error('Error sending broadcast email:', err);
    res.status(500).json({ error: 'Failed to send broadcast email', message: err.message });
  }
});

// Update broadcast (subject/message only — does not resend)
router.put('/admin/broadcasts/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });
    await db.query('UPDATE broadcast_messages SET subject = ?, message = ? WHERE id = ?', [subject, message, req.params.id]);
    res.json({ message: 'Broadcast updated successfully' });
  } catch (err) {
    console.error('Error updating broadcast:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Resend an existing broadcast
router.post('/admin/broadcasts/:id/resend', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: 'Email service is not configured' });
    }
    const [[broadcast]] = await db.query('SELECT * FROM broadcast_messages WHERE id = ?', [req.params.id]);
    if (!broadcast) return res.status(404).json({ message: 'Broadcast not found' });
    const { sent, failed, total } = await sendBroadcastEmails(db, broadcast.subject, broadcast.message);
    if (total === 0) return res.status(404).json({ message: 'No approved alumni found to send email' });
    await db.query('UPDATE broadcast_messages SET sent_count = ?, failed_count = ? WHERE id = ?', [sent, failed, req.params.id]);
    res.json({ message: `Resent to ${sent} alumni${failed > 0 ? `, ${failed} failed` : ''}`, sent, failed, total });
  } catch (err) {
    console.error('Error resending broadcast:', err);
    res.status(500).json({ error: 'Failed to resend broadcast', message: err.message });
  }
});

// Delete broadcast
router.delete('/admin/broadcasts/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    await db.query('DELETE FROM broadcast_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Broadcast deleted successfully' });
  } catch (err) {
    console.error('Error deleting broadcast:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.get('/admin/alumni/pending-count', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [result] = await db.query("SELECT COUNT(*) as count FROM alumni WHERE approval_status = 'pending'");
    res.json({ count: result[0].count });
  } catch (err) {
    console.error('Error fetching pending count:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

module.exports = router;
