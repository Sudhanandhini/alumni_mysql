const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { requireDb, normalizeForDb, getDb } = require('../config/db');
const { upload, runMulter } = require('../middleware/upload');
const { verifyAlumniToken } = require('../middleware/auth');

const ALUMNI_JWT_SECRET = process.env.ALUMNI_JWT_SECRET || 'your-alumni-secret-key-here-change-in-production';

// ── OTP Store (in-memory, 10-min expiry) ──────────────────────────────────────
const otpStore = new Map(); // email -> { otp, expiresAt }

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });
}

// Send OTP
router.post('/alumni/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: 'Email service not configured' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Alumni Portal" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP for Alumni Portal Registration',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#f4f6fa;padding:32px 16px;">
          <div style="background:#197fe6;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0;">Email Verification</h2>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;">Alumni Portal Registration</p>
          </div>
          <div style="background:#fff;border-radius:0 0 16px 16px;padding:32px 36px;text-align:center;">
            <p style="font-size:14px;color:#374151;margin:0 0 20px;">Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#f0f7ff;border:2px dashed #93c5fd;border-radius:12px;padding:24px;margin-bottom:24px;">
              <span style="font-size:38px;font-weight:900;letter-spacing:12px;color:#1d4ed8;">${otp}</span>
            </div>
            <p style="font-size:12px;color:#9ca3af;margin:0;">Do not share this OTP with anyone. If you did not request this, please ignore.</p>
          </div>
        </div>
      `
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
});

// Verify OTP
router.post('/alumni/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== String(otp)) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

  otpStore.delete(email);
  res.json({ message: 'Email verified successfully' });
});

// ── Password Reset ────────────────────────────────────────────────────────────

router.post('/alumni/forgot-password', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [rows] = await db.query('SELECT id, name, email, username FROM alumni WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.json({ message: 'If the email is registered, a reset link has been sent', success: true });

    const user = rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, ALUMNI_JWT_SECRET, { expiresIn: '1h' });
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured');
      return res.status(500).json({ error: 'Email service not configured. Please contact administrator.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false }
    });

    try {
      await transporter.verify();
    } catch (smtpError) {
      console.error('❌ SMTP verification failed:', smtpError);
      return res.status(500).json({ error: 'Email service connection failed. Please contact administrator.' });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to: user.email,
      subject: 'Password Reset Request for Your Alumni Account',
      text: `Hello ${user.name || user.username},\n\nUsername: ${user.username}\n\nReset link (valid 1 hour):\n\n${resetLink}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#197fe6;">Password Reset Request</h2>
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p><strong>Username:</strong> ${user.username}</p>
          <p>Click the button below to reset your password (valid for 1 hour):</p>
          <div style="margin:30px 0;">
            <a href="${resetLink}" style="background-color:#197fe6;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste: <span style="word-break:break-all;color:#666;">${resetLink}</span></p>
          <p style="color:#666;font-size:14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'Password reset link has been sent to your registered email address.', success: true });
  } catch (err) {
    console.error('❌ Error in forgot-password:', err);
    res.status(500).json({ error: 'Failed to send reset email', message: err.message });
  }
});

router.post('/alumni/reset-password', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and newPassword are required' });

    let payload;
    try {
      payload = jwt.verify(token, ALUMNI_JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE alumni SET password = ? WHERE id = ?', [hashed, payload.id]);

    const [alumniRows] = await db.query('SELECT username FROM alumni WHERE id = ?', [payload.id]);
    if (alumniRows && alumniRows.length > 0 && alumniRows[0].username) {
      await db.query('UPDATE users SET password = ? WHERE username = ?', [hashed, alumniRows[0].username]);
    }

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('❌ Error in reset-password:', err);
    res.status(500).json({ error: 'Failed to reset password', message: err.message });
  }
});

// ── Featured Alumni (public, open CORS) ──────────────────────────────────────

router.options('/featured-alumni', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

router.get('/featured-alumni', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const [rows] = await db.query(
      `SELECT id, name, photo, current_status, institution, batch,
              work_location, designation, organization_name, department, industry
       FROM alumni
       WHERE approval_status = 'approved' AND is_deleted = 0 AND is_featured = 1
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
    const apiBase = `${req.protocol}://${req.get('host')}`;
    res.json(rows.map(a => ({
      ...a,
      photo: a.photo ? (a.photo.startsWith('http') ? a.photo : `${apiBase}${a.photo}`) : null
    })));
  } catch (err) {
    console.error('Error fetching featured alumni:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Alumni CRUD ───────────────────────────────────────────────────────────────

router.get('/alumni', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const showAll = req.query.all === 'true';
    const showDeleted = req.query.show_deleted === 'true';

    let whereClause;
    if (showDeleted) {
      whereClause = 'WHERE is_deleted = 1';
    } else if (showAll) {
      whereClause = 'WHERE is_deleted = 0';
    } else {
      whereClause = "WHERE approval_status = 'approved' AND is_deleted = 0";
    }

    const [results] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution,
        approval_status, is_deleted, attended_program, program_type, facebook, enrollment_number,
        completion_year, functional_area, employment_type, seniority_level,
        country, city, education_level, work_city, created_at,
        parent_name, ug_college, pg_college, doctorate_name, social_links, username, show_contact
       FROM alumni ${whereClause} ORDER BY id DESC`
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.get('/alumni/me', verifyAlumniToken, async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [rows] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution,
        approval_status, attended_program, program_type, facebook, enrollment_number,
        completion_year, functional_area, employment_type, seniority_level,
        country, city, education_level, work_city, created_at, username,
        parent_name, ug_college, pg_college, doctorate_name, social_links
       FROM alumni WHERE id = ?`,
      [req.alumniId]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Alumni not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching own profile:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.put('/alumni/me', verifyAlumniToken, runMulter(upload.single('photo')), async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));
    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation,
      industry, work_location, experience_years, skills, achievements,
      higher_education, institution,
      attended_program, program_type, facebook, enrollment_number, completion_year,
      functional_area, employment_type, seniority_level, country, city, education_level, work_city,
      parent_name, ug_college, pg_college, doctorate_name, social_links
    } = body;

    let photo = body.existing_photo || null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
      if (body.existing_photo && typeof body.existing_photo === 'string' && body.existing_photo.startsWith('/uploads/')) {
        const oldPhotoPath = path.join(__dirname, '..', body.existing_photo);
        try { if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath); } catch (e) { console.warn('Failed deleting old photo', e.message); }
      }
    }

    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    await db.query(
      `UPDATE alumni SET name=?, email=?, phone=?, gender=?, dob=?, batch=?, department=?, address=?, photo=?, linkedin=?,
       bio=?, current_status=?, organization_name=?, designation=?, industry=?, work_location=?, experience_years=?,
       skills=?, achievements=?, higher_education=?, institution=?,
       attended_program=?, program_type=?, facebook=?, enrollment_number=?, completion_year=?,
       functional_area=?, employment_type=?, seniority_level=?, country=?, city=?, education_level=?, work_city=?,
       parent_name=?, ug_college=?, pg_college=?, doctorate_name=?, social_links=?
       WHERE id=?`,
      [name, email, phone, gender, dob, batch, department, address, photo, linkedin,
       bio, current_status, organization_name, designation, industry, work_location, expYearsVal,
       skills, achievements, higher_education, institution,
       attended_program, program_type, facebook, enrollment_number, completion_year,
       functional_area, employment_type, seniority_level, country, city, education_level, work_city,
       parent_name || null, ug_college || null, pg_college || null, doctorate_name || null, social_links || null,
       req.alumniId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating own profile:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.put('/alumni/me/privacy', verifyAlumniToken, async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { show_contact } = req.body;
    await db.query('UPDATE alumni SET show_contact = ? WHERE id = ?', [show_contact ? 1 : 0, req.alumniId]);
    res.json({ success: true, show_contact: show_contact ? 1 : 0 });
  } catch (err) {
    console.error('Error updating privacy:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.get('/alumni/check-username/:username', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [results] = await db.query('SELECT id FROM alumni WHERE username = ?', [req.params.username]);
    res.json({ available: !results || results.length === 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.get('/alumni/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [results] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution,
        attended_program, program_type, facebook, enrollment_number, completion_year,
        functional_area, employment_type, seniority_level, country, city, education_level, work_city,
        parent_name, ug_college, pg_college, doctorate_name, social_links, username,
        approval_status, created_at
       FROM alumni WHERE id = ?`,
      [req.params.id]
    );
    if (!results || results.length === 0) return res.status(404).json({ error: 'Alumni not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching single alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

router.post('/alumni/register', runMulter(upload.single('photo')), async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));
    const {
      username, password, name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation, industry,
      work_location, experience_years, skills, achievements, higher_education, institution,
      attended_program, program_type, facebook, enrollment_number, completion_year,
      functional_area, employment_type, seniority_level, country, city, education_level, work_city,
      parent_name, ug_college, pg_college, doctorate_name, social_links
    } = body;

    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    const [existingUsername] = await db.query('SELECT id FROM alumni WHERE username = ?', [username]);
    if (existingUsername && existingUsername.length > 0) return res.status(400).json({ message: 'Username already exists' });

    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM alumni WHERE email = ?', [email]);
      if (existingEmail && existingEmail.length > 0) return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    const [result] = await db.query(
      `INSERT INTO alumni (
        username, password, name, email, phone, gender, dob, batch, department, address,
        photo, linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution,
        attended_program, program_type, facebook, enrollment_number, completion_year,
        functional_area, employment_type, seniority_level, country, city, education_level, work_city,
        parent_name, ug_college, pg_college, doctorate_name, social_links,
        approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [username, hashedPassword, name, email, phone, gender, dob, batch, department, address,
       photo, linkedin, bio, current_status, organization_name, designation, industry,
       work_location, expYearsVal, skills, achievements, higher_education, institution,
       attended_program, program_type, facebook, enrollment_number, completion_year,
       functional_area, employment_type, seniority_level, country, city, education_level, work_city,
       parent_name || null, ug_college || null, pg_college || null, doctorate_name || null, social_links || null]
    );

    try {
      await db.query('INSERT INTO users (name, username, password, place) VALUES (?, ?, ?, ?)', [name || username, username, hashedPassword, address || null]);
    } catch (userErr) {
      console.warn('⚠️ Failed to create user entry:', userErr.message);
    }

    res.status(201).json({ message: 'Registration successful!', id: result.insertId });
  } catch (err) {
    console.error('Error registering alumni:', err);
    res.status(500).json({ error: 'Failed to register alumni', message: err.message || err.code || String(err) });
  }
});

router.post('/alumni', runMulter(upload.single('photo')), async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));
    const {
      username, password, name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation, industry,
      work_location, experience_years, skills, achievements, higher_education, institution,
      attended_program, program_type, facebook, enrollment_number, completion_year,
      functional_area, employment_type, seniority_level, country, city, education_level, work_city,
      parent_name, ug_college, pg_college, doctorate_name, social_links
    } = body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Auto-generate username if not provided
    const finalUsername = username || (name ? name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000) : null);

    const [result] = await db.query(
      `INSERT INTO alumni (
        username, password, name, email, phone, gender, dob, batch, department, address, photo, linkedin,
        bio, current_status, organization_name, designation, industry, work_location,
        experience_years, skills, achievements, higher_education, institution,
        attended_program, program_type, facebook, enrollment_number, completion_year,
        functional_area, employment_type, seniority_level, country, city, education_level, work_city,
        parent_name, ug_college, pg_college, doctorate_name, social_links,
        approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [finalUsername, hashedPassword, name, email, phone, gender, dob, batch, department, address, photo, linkedin,
       bio, current_status, organization_name, designation, industry, work_location,
       expYearsVal, skills, achievements, higher_education, institution,
       attended_program, program_type, facebook, enrollment_number, completion_year,
       functional_area, employment_type, seniority_level, country, city, education_level, work_city,
       parent_name || null, ug_college || null, pg_college || null, doctorate_name || null, social_links || null]
    );
    res.status(201).json({ message: 'Alumni added!', id: result.insertId });
  } catch (err) {
    console.error('Error adding alumni:', err);
    res.status(500).json({ error: 'Failed to add alumni', message: err.message });
  }
});

router.put('/alumni/:id', runMulter(upload.single('photo')), async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { id } = req.params;
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));
    const { name, email, phone, gender, dob, batch, department, address, linkedin, bio,
      current_status, organization_name, designation, industry, work_location,
      experience_years, skills, achievements, higher_education, institution,
      attended_program, program_type, facebook, enrollment_number, completion_year,
      functional_area, employment_type, seniority_level, country, city, education_level, work_city,
      parent_name, ug_college, pg_college, doctorate_name, social_links, password } = body;

    let photo = body.existing_photo || null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
      if (body.existing_photo && typeof body.existing_photo === 'string' && body.existing_photo.startsWith('/uploads/')) {
        const oldPhotoPath = path.join(__dirname, '..', body.existing_photo);
        try { if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath); } catch (e) { console.warn('Failed deleting old photo', e.message); }
      }
    }

    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    // Only update password if a new one is provided
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(`UPDATE alumni SET password=? WHERE id=?`, [hashedPassword, id]);
    }

    await db.query(
      `UPDATE alumni SET name=?, email=?, phone=?, gender=?, dob=?, batch=?, department=?, address=?, photo=?, linkedin=?,
      bio=?, current_status=?, organization_name=?, designation=?, industry=?, work_location=?, experience_years=?,
      skills=?, achievements=?, higher_education=?, institution=?,
      attended_program=?, program_type=?, facebook=?, enrollment_number=?, completion_year=?,
      functional_area=?, employment_type=?, seniority_level=?, country=?, city=?, education_level=?, work_city=?,
      parent_name=?, ug_college=?, pg_college=?, doctorate_name=?, social_links=? WHERE id=?`,
      [name, email, phone, gender, dob, batch, department, address, photo, linkedin,
       bio, current_status, organization_name, designation, industry, work_location, expYearsVal,
       skills, achievements, higher_education, institution,
       attended_program, program_type, facebook, enrollment_number, completion_year,
       functional_area, employment_type, seniority_level, country, city, education_level, work_city,
       parent_name || null, ug_college || null, pg_college || null, doctorate_name || null, social_links || null, id]
    );
    res.json({ message: 'Alumni updated!' });
  } catch (err) {
    console.error('Error updating alumni:', err);
    res.status(500).json({ error: 'Failed to update alumni', message: err.message });
  }
});

router.delete('/alumni/:id', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    await db.query('UPDATE alumni SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alumni moved to trash.' });
  } catch (err) {
    console.error('Error soft-deleting alumni:', err);
    res.status(500).json({ error: 'Failed to delete alumni', message: err.message });
  }
});

router.put('/alumni/:id/restore', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    await db.query('UPDATE alumni SET is_deleted = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alumni restored successfully.' });
  } catch (err) {
    console.error('Error restoring alumni:', err);
    res.status(500).json({ error: 'Failed to restore alumni', message: err.message });
  }
});

router.delete('/alumni/:id/permanent', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { uploadDir } = require('../middleware/upload');
    const [results] = await db.query('SELECT photo FROM alumni WHERE id = ?', [req.params.id]);
    if (results && results.length > 0 && results[0].photo) {
      const photoPath = path.join(__dirname, '..', results[0].photo);
      if (photoPath.startsWith(uploadDir) && fs.existsSync(photoPath)) {
        try { fs.unlinkSync(photoPath); } catch (e) { console.warn('Failed to delete photo', e.message); }
      }
    }
    await db.query('DELETE FROM alumni WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alumni permanently deleted.' });
  } catch (err) {
    console.error('Error permanently deleting alumni:', err);
    res.status(500).json({ error: 'Failed to permanently delete alumni', message: err.message });
  }
});

// ── Alumni Login ──────────────────────────────────────────────────────────────

router.post('/alumni/login', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const [alumni] = await db.query('SELECT * FROM alumni WHERE email = ?', [email]);
    if (!alumni || alumni.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const alumniUser = alumni[0];
    if (alumniUser.approval_status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval.' });
    if (alumniUser.approval_status === 'rejected') return res.status(403).json({ message: 'Your account has been rejected. Contact admin.' });

    const isPasswordValid = await bcrypt.compare(password, alumniUser.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: alumniUser.id, username: alumniUser.username, type: 'alumni' }, ALUMNI_JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      alumni: { id: alumniUser.id, name: alumniUser.name, email: alumniUser.email, username: alumniUser.username }
    });
  } catch (error) {
    console.error('Error during alumni login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
