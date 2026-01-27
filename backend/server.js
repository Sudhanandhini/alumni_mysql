// server.js (reworked / improved)
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// =================== CONFIG ===================
const BASE_PATH = process.env.BASE_PATH || ''; // For serving under subdirectory like /alumni-backend
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const ALUMNI_JWT_SECRET = process.env.ALUMNI_JWT_SECRET || 'your-alumni-secret-key-here-change-in-production';

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// =================== MIDDLEWARE ===================
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Handle base path for uploads
const uploadsPath = BASE_PATH ? `${BASE_PATH}/uploads` : '/uploads';
app.use(uploadsPath, express.static(uploadDir));

// simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// =================== MULTER SETUP ===================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  },
});

// Helper to run multer middleware and convert errors to JSON responses
const runMulter = (singleUploadMiddleware) => (req, res, next) => {
  singleUploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      // Other errors (e.g., fileFilter)
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    next();
  });
};

// =================== DATABASE ===================
let db = null;
async function connectDatabase() {
  try {
    db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alumni_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    await db.query('SELECT 1'); // basic smoke test
    console.log('✅ Connected to MySQL database!');
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    db = null;
  }
}
connectDatabase();

function requireDb(res) {
  if (!db) {
    res.status(500).json({ error: 'Database not connected' });
    return false;
  }
  return true;
}

// small helper: normalize empty strings -> null (so SQL nullable columns get null)
function normalizeForDb(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

// =================== ROUTES ===================
// Create a router to handle all API routes
const apiRouter = express.Router();

// Test
apiRouter.get('/test', (req, res) => res.json({ message: 'Backend is working!' }));

// ----------------- Password reset -----------------
apiRouter.post('/alumni/forgot-password', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username, email } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [rows] = await db.query('SELECT id, name, email, username FROM alumni WHERE username = ? AND email = ?', [username, email]);
    if (!rows || rows.length === 0) return res.json({ message: 'If the username and email match, a reset link has been sent' });

    const user = rows[0];
    
    const token = jwt.sign({ id: user.id, username: user.username }, ALUMNI_JWT_SECRET, { expiresIn: '1h' });

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Configure SMTP transporter
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Please contact administrator.',
        message: 'SMTP credentials missing in environment variables'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });

    // Verify the connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (smtpError) {
      console.error('❌ SMTP verification failed:', smtpError);
      return res.status(500).json({ 
        error: 'Email service connection failed. Please contact administrator.',
        message: process.env.NODE_ENV === 'development' ? smtpError.message : 'Unable to connect to email service',
        details: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          errorCode: smtpError.code
        }
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to: user.email,
      subject: 'Password Reset Request for Your Alumni Account',
      text: `Hello ${user.name || user.username},\n\nUsername: ${user.username}\n\nYou requested to reset your password. Click the link below to reset (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Password Reset Request</h2>
          <p>Hello <strong>${user.name || user.username}</strong>,</p>
          <p><strong>Username:</strong> ${user.username}</p>
          <p>You requested to reset your password. Click the button below to reset your password (valid for 1 hour):</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', user.email);
    console.log('📧 Message ID:', info.messageId);

    res.json({ 
      message: 'Password reset link has been sent to your registered email address. Please check your inbox.',
      success: true
    });
  } catch (err) {
    console.error('❌ Error in forgot-password:', err);
    res.status(500).json({ error: 'Failed to send reset email', message: err.message });
  }
});

apiRouter.post('/alumni/reset-password', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { token, newPassword } = req.body;
    console.log('🔄 Reset password request received');
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and newPassword are required' });

    let payload;
    try {
      payload = jwt.verify(token, ALUMNI_JWT_SECRET);
      console.log('✅ Token verified for user ID:', payload.id);
    } catch (e) {
      console.log('❌ Token verification failed:', e.message);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = payload.id;
    const hashed = await bcrypt.hash(newPassword, 10);
    console.log('🔐 Password hashed successfully');
    
    // Update password in alumni table
    const [alumniResult] = await db.query('UPDATE alumni SET password = ? WHERE id = ?', [hashed, userId]);
    console.log(`📝 Alumni table updated: ${alumniResult.affectedRows} row(s) affected`);
    
    // Also update password in users table if the user exists there
    // Get the username from alumni table first
    const [alumniRows] = await db.query('SELECT username FROM alumni WHERE id = ?', [userId]);
    console.log('👤 Alumni username lookup result:', alumniRows);
    
    if (alumniRows && alumniRows.length > 0 && alumniRows[0].username) {
      const username = alumniRows[0].username;
      const [userResult] = await db.query('UPDATE users SET password = ? WHERE username = ?', [hashed, username]);
      console.log(`✅ Password updated for both tables (username: ${username}, users affected: ${userResult.affectedRows})`);
    } else {
      console.log('⚠️ Password updated for alumni table only (no username found)');
    }
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('❌ Error in reset-password:', err);
    res.status(500).json({ error: 'Failed to reset password', message: err.message });
  }
});

// ----------------- Alumni CRUD -----------------

apiRouter.get('/alumni', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [results] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution, created_at
       FROM alumni ORDER BY id DESC`
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

apiRouter.get('/alumni/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    const [results] = await db.query(
      `SELECT id, name, email, phone, gender, dob, batch, department, address, photo,
        linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution, created_at
       FROM alumni WHERE id = ?`,
      [id]
    );
    if (!results || results.length === 0) return res.status(404).json({ error: 'Alumni not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching single alumni:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

apiRouter.get('/alumni/check-username/:username', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username } = req.params;
    const [results] = await db.query('SELECT id FROM alumni WHERE username = ?', [username]);
    res.json({ available: !results || results.length === 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Registration (alumni)
apiRouter.post('/alumni/register', runMulter(upload.single('photo')), async (req, res) => {
  try {
    if (!requireDb(res)) return;

    // destructure and normalize
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));

    const {
      username, password, name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation, industry,
      work_location, experience_years, skills, achievements, higher_education, institution
    } = body;

    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    // basic email format check
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [existingUsername] = await db.query('SELECT id FROM alumni WHERE username = ?', [username]);
    if (existingUsername && existingUsername.length > 0) return res.status(400).json({ message: 'Username already exists' });

    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM alumni WHERE email = ?', [email]);
      if (existingEmail && existingEmail.length > 0) return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    // convert experience_years to number or null
    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    const query = `
      INSERT INTO alumni (
        username, password, name, email, phone, gender, dob, batch, department, address,
        photo, linkedin, bio, current_status, organization_name, designation, industry,
        work_location, experience_years, skills, achievements, higher_education, institution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      username, hashedPassword, name, email, phone, gender, dob, batch, department, address,
      photo, linkedin, bio, current_status, organization_name, designation, industry,
      work_location, expYearsVal, skills, achievements, higher_education, institution
    ];

    const [result] = await db.query(query, values);
    const alumniId = result.insertId;
    
    // Also create an entry in the users table for login purposes
    try {
      await db.query(
        'INSERT INTO users (name, username, password, place) VALUES (?, ?, ?, ?)',
        [name || username, username, hashedPassword, address || null]
      );
      console.log(`✅ Created user entry for alumni: ${username}`);
    } catch (userErr) {
      console.warn('⚠️ Failed to create user entry (alumni entry was created):', userErr.message);
      // Don't fail the registration if user table insert fails
    }
    
    res.status(201).json({ message: 'Registration successful!', id: alumniId });
  } catch (err) {
    console.error('Error registering alumni:', err);
    res.status(500).json({ error: 'Failed to register alumni', message: err.message });
  }
});

// Admin - add new alumni
apiRouter.post('/alumni', runMulter(upload.single('photo')), async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));

    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation,
      industry, work_location, experience_years, skills, achievements,
      higher_education, institution
    } = body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    const query = `
      INSERT INTO alumni (
        name, email, phone, gender, dob, batch, department, address, photo, linkedin,
        bio, current_status, organization_name, designation, industry, work_location,
        experience_years, skills, achievements, higher_education, institution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name, email, phone, gender, dob, batch, department, address, photo, linkedin,
      bio, current_status, organization_name, designation, industry, work_location,
      expYearsVal, skills, achievements, higher_education, institution
    ];

    const [result] = await db.query(query, values);
    res.status(201).json({ message: 'Alumni added!', id: result.insertId });
  } catch (err) {
    console.error('Error adding alumni:', err);
    res.status(500).json({ error: 'Failed to add alumni', message: err.message });
  }
});

// Update alumni
apiRouter.put('/alumni/:id', runMulter(upload.single('photo')), async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    const body = Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [k, normalizeForDb(v)]));

    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation,
      industry, work_location, experience_years, skills, achievements,
      higher_education, institution
    } = body;

    let photo = body.existing_photo || null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
      // delete old file safely only if it's within uploads folder
      if (body.existing_photo && typeof body.existing_photo === 'string' && body.existing_photo.startsWith('/uploads/')) {
        const oldPhotoPath = path.join(__dirname, body.existing_photo);
        try { if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath); } catch (e) { console.warn('Failed deleting old photo', e.message); }
      }
    }

    const expYearsVal = experience_years ? (isNaN(Number(experience_years)) ? null : Number(experience_years)) : null;

    const query = `
      UPDATE alumni SET name=?, email=?, phone=?, gender=?, dob=?, batch=?, department=?, address=?, photo=?, linkedin=?,
      bio=?, current_status=?, organization_name=?, designation=?, industry=?, work_location=?, experience_years=?,
      skills=?, achievements=?, higher_education=?, institution=? WHERE id=?
    `;
    const values = [
      name, email, phone, gender, dob, batch, department, address, photo, linkedin,
      bio, current_status, organization_name, designation, industry, work_location, expYearsVal,
      skills, achievements, higher_education, institution, id
    ];
    await db.query(query, values);
    res.json({ message: 'Alumni updated!' });
  } catch (err) {
    console.error('Error updating alumni:', err);
    res.status(500).json({ error: 'Failed to update alumni', message: err.message });
  }
});

// Delete alumni
apiRouter.delete('/alumni/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    const [results] = await db.query('SELECT photo FROM alumni WHERE id = ?', [id]);
    if (results && results.length > 0 && results[0].photo) {
      const photoPath = path.join(__dirname, results[0].photo);
      // ensure file is inside uploads directory before deleting
      if (photoPath.startsWith(uploadDir) && fs.existsSync(photoPath)) {
        try { fs.unlinkSync(photoPath); } catch (e) { console.warn('Failed to delete photo', e.message); }
      }
    }
    await db.query('DELETE FROM alumni WHERE id = ?', [id]);
    res.json({ message: 'Alumni deleted!' });
  } catch (err) {
    console.error('Error deleting alumni:', err);
    res.status(500).json({ error: 'Failed to delete alumni', message: err.message });
  }
});

// ----------------- Admin / users (kept as before, with minor normalization) -----------------

apiRouter.get('/users/check-username/:username', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username } = req.params;
    const [results] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ available: !results || results.length === 0 });
  } catch (err) {
    console.error('Error checking username (users):', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

apiRouter.get('/users', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

apiRouter.get('/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!users || users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

apiRouter.post('/users', async (req, res) => {
  try {
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

apiRouter.put('/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { name, username, password, place } = req.body;
    const userId = req.params.id;
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
    if (existing && existing.length > 0) return res.status(400).json({ message: 'Username already exists' });
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET name=?, username=?, password=?, place=? WHERE id=?', [name, username, hashedPassword, place, userId]);
      
      // Also update password in alumni table if a matching username exists
      await db.query('UPDATE alumni SET password = ? WHERE username = ?', [hashedPassword, username]);
      console.log(`✅ Password updated for users table and synced to alumni table (if exists) for username: ${username}`);
    } else {
      await db.query('UPDATE users SET name=?, username=?, place=? WHERE id=?', [name, username, place, userId]);
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

apiRouter.post('/user/login', async (req, res) => {
  try {
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

// Alumni login endpoint
apiRouter.post('/alumni/login', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    
    const [alumni] = await db.query('SELECT * FROM alumni WHERE username = ?', [username]);
    if (!alumni || alumni.length === 0) return res.status(401).json({ message: 'Invalid username or password' });
    
    const alumniUser = alumni[0];
    const isPasswordValid = await bcrypt.compare(password, alumniUser.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid username or password' });
    
    const token = jwt.sign({ id: alumniUser.id, username: alumniUser.username, type: 'alumni' }, ALUMNI_JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      message: 'Login successful', 
      token, 
      alumni: {
        id: alumniUser.id,
        name: alumniUser.name,
        email: alumniUser.email,
        username: alumniUser.username
      }
    });
  } catch (error) {
    console.error('Error during alumni login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Mount the API router - handle both direct /api and /alumni-backend/api paths
// When deployed under a subdirectory, mount at that base path
if (BASE_PATH) {
  app.use(`${BASE_PATH}/api`, apiRouter);
  console.log(`📍 API routes mounted at: ${BASE_PATH}/api`);
}
app.use('/api', apiRouter);

// catch-all 404
app.use((req, res) => res.status(404).json({ error: 'No matching route', path: req.originalUrl }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (BASE_PATH) {
    console.log(`📝 Test API: http://localhost:${PORT}${BASE_PATH}/api/test`);
  } else {
    console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
  }
  console.log(`📁 Uploads directory: ${uploadDir}`);
});




// ----------------- Statistics Routes -----------------

// Get total active alumni count
apiRouter.get('/stats/total-alumni', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [result] = await db.query('SELECT COUNT(*) as count FROM alumni');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching total alumni:', error);
    res.status(500).json({ error: 'Failed to fetch total alumni count', message: error.message });
  }
});

// Get total unique careers/designations count
apiRouter.get('/stats/careers', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [result] = await db.query(
      'SELECT COUNT(DISTINCT designation) as count FROM alumni WHERE designation IS NOT NULL AND designation != ""'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching careers count:', error);
    res.status(500).json({ error: 'Failed to fetch careers count', message: error.message });
  }
});

// Get total unique companies count
apiRouter.get('/stats/companies', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [result] = await db.query(
      'SELECT COUNT(DISTINCT organization_name) as count FROM alumni WHERE organization_name IS NOT NULL AND organization_name != ""'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching companies count:', error);
    res.status(500).json({ error: 'Failed to fetch companies count', message: error.message });
  }
});

// Get total unique countries/locations count
apiRouter.get('/stats/countries', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [result] = await db.query(
      'SELECT COUNT(DISTINCT work_location) as count FROM alumni WHERE work_location IS NOT NULL AND work_location != ""'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching countries count:', error);
    res.status(500).json({ error: 'Failed to fetch countries count', message: error.message });
  }
});