const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

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

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // UPDATE THIS
  database: 'alumni_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database!');
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// GET all alumni
app.get('/api/alumni', (req, res) => {
  db.query('SELECT * FROM alumni ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET single alumni
app.get('/api/alumni/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM alumni WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    res.json(results[0]);
  });
});

// POST - Add new alumni with image upload
app.post('/api/alumni', upload.single('photo'), (req, res) => {
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

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding alumni:', err);
      return res.status(500).json({ error: 'Failed to add alumni' });
    }
    res.status(201).json({ message: 'Alumni added!', id: result.insertId });
  });
});

// PUT - Update alumni with image upload
app.put('/api/alumni/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, gender, dob, batch, department, address,
    linkedin, bio, current_status, organization_name,
    designation, industry, work_location, experience_years,
    skills, achievements, higher_education, institution
  } = req.body;

  // If new photo uploaded, use it; otherwise keep the old one
  let photo = req.body.existing_photo;
  if (req.file) {
    photo = `/uploads/${req.file.filename}`;
    
    // Delete old photo if exists
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

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating alumni:', err);
      return res.status(500).json({ error: 'Failed to update alumni' });
    }
    res.json({ message: 'Alumni updated!' });
  });
});

// DELETE alumni
app.delete('/api/alumni/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the photo path to delete the file
  db.query('SELECT photo FROM alumni WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0 && results[0].photo) {
      const photoPath = path.join(__dirname, results[0].photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Delete from database
    db.query('DELETE FROM alumni WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting alumni:', err);
        return res.status(500).json({ error: 'Failed to delete alumni' });
      }
      res.json({ message: 'Alumni deleted!' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test: http://localhost:${PORT}/api/test`);
  console.log(`📁 Uploads folder: ${uploadDir}`);
});