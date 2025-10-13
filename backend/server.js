const express = require('express');
const mysql = require('mysql2/promise'); // Changed to promise version
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Secret key for JWT
const JWT_SECRET = 'your-secret-key-here-change-in-production';

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// Database Connection Pool (Promise-based)
let db;

async function connectDatabase() {
  try {
    db = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '', // UPDATE THIS if you have a password
      database: 'alumni_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    await db.query('SELECT 1');
    console.log('✅ Connected to MySQL database!');
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
}

// Initialize database connection
connectDatabase();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ==================== ALUMNI ROUTES ====================

// GET all alumni
app.get('/api/alumni', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM alumni ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET single alumni
app.get('/api/alumni/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query('SELECT * FROM alumni WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST - Add new alumni with image upload
app.post('/api/alumni', upload.single('photo'), async (req, res) => {
  try {
    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name,
      designation, industry, work_location, experience_years,
      skills, achievements, higher_education, institution
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO alumni (
        name, email, phone, gender, dob, batch, department, address,
        photo, linkedin, bio, current_status, organization_name,
        designation, industry, work_location, experience_years,
        skills, achievements, higher_education, institution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, email, phone, gender, dob, batch, department, address,
      photo, linkedin, bio, current_status, organization_name,
      designation, industry, work_location, experience_years,
      skills, achievements, higher_education, institution
    ];

    const [result] = await db.query(query, values);
    res.status(201).json({ message: 'Alumni added!', id: result.insertId });
  } catch (err) {
    console.error('Error adding alumni:', err);
    res.status(500).json({ error: 'Failed to add alumni' });
  }
});

// PUT - Update alumni with image upload
app.put('/api/alumni/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, gender, dob, batch, department, address,
      linkedin, bio, current_status, organization_name,
      designation, industry, work_location, experience_years,
      skills, achievements, higher_education, institution
    } = req.body;

    let photo = req.body.existing_photo;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
      
      if (req.body.existing_photo) {
        const oldPhotoPath = path.join(__dirname, req.body.existing_photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    const query = `
      UPDATE alumni SET
        name = ?, email = ?, phone = ?, gender = ?, dob = ?,
        batch = ?, department = ?, address = ?, photo = ?, linkedin = ?,
        bio = ?, current_status = ?, organization_name = ?, designation = ?,
        industry = ?, work_location = ?, experience_years = ?, skills = ?,
        achievements = ?, higher_education = ?, institution = ?
      WHERE id = ?
    `;

    const values = [
      name, email, phone, gender, dob, batch, department, address,
      photo, linkedin, bio, current_status, organization_name,
      designation, industry, work_location, experience_years,
      skills, achievements, higher_education, institution, id
    ];

    await db.query(query, values);
    res.json({ message: 'Alumni updated!' });
  } catch (err) {
    console.error('Error updating alumni:', err);
    res.status(500).json({ error: 'Failed to update alumni' });
  }
});

// DELETE alumni
app.delete('/api/alumni/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [results] = await db.query('SELECT photo FROM alumni WHERE id = ?', [id]);
    
    if (results.length > 0 && results[0].photo) {
      const photoPath = path.join(__dirname, results[0].photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await db.query('DELETE FROM alumni WHERE id = ?', [id]);
    res.json({ message: 'Alumni deleted!' });
  } catch (err) {
    console.error('Error deleting alumni:', err);
    res.status(500).json({ error: 'Failed to delete alumni' });
  }
});

// ==================== USER ROUTES ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, username, place, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, username, place, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, username, password, place } = req.body;
    
    // Check if username already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (name, username, password, place) VALUES (?, ?, ?, ?)',
      [name, username, hashedPassword, place]
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, username, password, place } = req.body;
    const userId = req.params.id;
    
    // Check if username is taken by another user
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // If password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET name = ?, username = ?, password = ?, place = ? WHERE id = ?',
        [name, username, hashedPassword, place, userId]
      );
    } else {
      // Update without changing password
      await db.query(
        'UPDATE users SET name = ?, username = ?, place = ? WHERE id = ?',
        [name, username, place, userId]
      );
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// User Login
app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      name: user.name
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test: http://localhost:${PORT}/api/test`);
  console.log(`📁 Uploads folder: ${uploadDir}`);
});