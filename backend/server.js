// server.js
require('dotenv').config(); // optional .env
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// =================== CONFIG ===================
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const ALUMNI_JWT_SECRET = process.env.ALUMNI_JWT_SECRET || 'your-alumni-secret-key-here-change-in-production';

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// =================== MIDDLEWARE ===================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl}`);
  next();
});

// =================== MULTER SETUP ===================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (mimetype && ext) cb(null, true);
    else cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  },
});

// =================== DATABASE ===================
let db; // pool
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
    // quick test query
    await db.query('SELECT 1');
    console.log('✅ Connected to MySQL database!');
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.warn('⚠️ Starting server without database connection — DB queries will fail until connection is fixed.');
    db = null; // keep server running for debugging routes like /api/test
  }
}
connectDatabase();

// Helper to ensure DB exists when used in routes
function requireDb(res) {
  if (!db) {
    res.status(500).json({ error: 'Database not connected' });
    return false;
  }
  return true;
}

// =================== TEST ENDPOINT ===================
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ====================================================
// ================ ALUMNI ROUTES =====================
// ====================================================

// GET all alumni
app.get('/api/alumni', async (req, res) => {
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
    console.error('Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// GET single alumni
app.get('/api/alumni/:id', async (req, res) => {
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
    if (results.length === 0) return res.status(404).json({ error: 'Alumni not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Check alumni username availability
app.get('/api/alumni/check-username/:username', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username } = req.params;
    const [results] = await db.query('SELECT id FROM alumni WHERE username = ?', [username]);
    res.json({ available: results.length === 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Alumni registration
app.post('/api/alumni/register', upload.single('photo'), async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const {
      username, password, name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation, industry,
      work_location, experience_years, skills, achievements, higher_education, institution
    } = req.body;

    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    const [existingUsername] = await db.query('SELECT id FROM alumni WHERE username = ?', [username]);
    if (existingUsername.length > 0) return res.status(400).json({ message: 'Username already exists' });

    const [existingEmail] = await db.query('SELECT id FROM alumni WHERE email = ?', [email]);
    if (existingEmail.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

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
      work_location, experience_years, skills, achievements, higher_education, institution
    ];
    const [result] = await db.query(query, values);
    res.status(201).json({ message: 'Registration successful!', id: result.insertId });
  } catch (err) {
    console.error('Error registering alumni:', err);
    res.status(500).json({ error: 'Failed to register alumni', message: err.message });
  }
});

// Alumni login
app.post('/api/alumni/login', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username, password } = req.body;
    const [alumni] = await db.query('SELECT * FROM alumni WHERE username = ?', [username]);
    if (alumni.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

    const alumniData = alumni[0];
    const isPasswordValid = await bcrypt.compare(password, alumniData.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign({ id: alumniData.id, username: alumniData.username, type: 'alumni' }, ALUMNI_JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      alumni: { id: alumniData.id, name: alumniData.name, username: alumniData.username, email: alumniData.email, photo: alumniData.photo }
    });
  } catch (error) {
    console.error('Error during alumni login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Add new alumni (admin)
app.post('/api/alumni', upload.single('photo'), async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation,
      industry, work_location, experience_years, skills, achievements,
      higher_education, institution
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

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
      experience_years, skills, achievements, higher_education, institution
    ];
    const [result] = await db.query(query, values);
    res.status(201).json({ message: 'Alumni added!', id: result.insertId });
  } catch (err) {
    console.error('Error adding alumni:', err);
    res.status(500).json({ error: 'Failed to add alumni', message: err.message });
  }
});

// Update alumni
app.put('/api/alumni/:id', upload.single('photo'), async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name, designation,
      industry, work_location, experience_years, skills, achievements,
      higher_education, institution
    } = req.body;

    let photo = req.body.existing_photo || null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
      if (req.body.existing_photo) {
        const oldPhotoPath = path.join(__dirname, req.body.existing_photo);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
    }

    const query = `
      UPDATE alumni SET name=?, email=?, phone=?, gender=?, dob=?, batch=?, department=?, address=?, photo=?, linkedin=?,
      bio=?, current_status=?, organization_name=?, designation=?, industry=?, work_location=?, experience_years=?,
      skills=?, achievements=?, higher_education=?, institution=? WHERE id=?
    `;
    const values = [
      name, email, phone, gender, dob, batch, department, address, photo, linkedin,
      bio, current_status, organization_name, designation, industry, work_location,
      experience_years, skills, achievements, higher_education, institution, id
    ];
    await db.query(query, values);
    res.json({ message: 'Alumni updated!' });
  } catch (err) {
    console.error('Error updating alumni:', err);
    res.status(500).json({ error: 'Failed to update alumni', message: err.message });
  }
});

// Delete alumni
app.delete('/api/alumni/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    const [results] = await db.query('SELECT photo FROM alumni WHERE id = ?', [id]);
    if (results.length > 0 && results[0].photo) {
      const photoPath = path.join(__dirname, results[0].photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }
    await db.query('DELETE FROM alumni WHERE id = ?', [id]);
    res.json({ message: 'Alumni deleted!' });
  } catch (err) {
    console.error('Error deleting alumni:', err);
    res.status(500).json({ error: 'Failed to delete alumni', message: err.message });
  }
});

// ====================================================
// ================ ADMIN USER ROUTES =================
// ====================================================

// Check username availability
app.get('/api/users/check-username/:username', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username } = req.params;
    const [results] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ available: results.length === 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const [users] = await db.query('SELECT id, name, username, place, created_at FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { name, username, password, place } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, username, password, place) VALUES (?, ?, ?, ?)', [name, username, hashedPassword, place]);
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { name, username, password, place } = req.body;
    const userId = req.params.id;
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username already exists' });
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET name=?, username=?, password=?, place=? WHERE id=?', [name, username, hashedPassword, place, userId]);
    } else {
      await db.query('UPDATE users SET name=?, username=?, place=? WHERE id=?', [name, username, place, userId]);
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// User login (admin)
app.post('/api/user/login', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { username, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid username or password' });
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

// ====================================================
// ================ CATCH-ALL 404 =====================
// ====================================================
app.use((req, res) => {
  res.status(404).json({ error: 'No matching route', path: req.originalUrl });
});

// ====================================================
// ================ START SERVER ======================
// ====================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📁 Uploads directory: ${uploadDir}`);

  // Optionally list endpoints for dev (install express-list-endpoints first)
  try {
    const listEndpoints = require('express-list-endpoints');
    console.log('📌 Registered endpoints:', listEndpoints(app));
  } catch (e) {
    // ignore if not installed
  }
});
