require('dotenv').config();
const mysql = require('mysql2/promise');

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
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    await db.query('SELECT 1');
    console.log('✅ Connected to MySQL database!');
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    db = null;
  }
}

async function runMigrations() {
  if (!db) return;
  try {
    const [existingCols] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alumni'
    `);
    const colNames = new Set(existingCols.map(c => c.COLUMN_NAME));

    const addIfMissing = async (colName, colDef) => {
      if (!colNames.has(colName)) {
        await db.query(`ALTER TABLE alumni ADD COLUMN \`${colName}\` ${colDef}`);
        console.log(`✅ Migration: added column '${colName}'`);
        return true;
      }
      return false;
    };

    const approvalAdded = await addIfMissing('approval_status', "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    if (approvalAdded) {
      await db.query("UPDATE alumni SET approval_status = 'approved'");
      console.log('✅ Migration: existing alumni auto-approved');
    }

    await addIfMissing('is_deleted', 'TINYINT(1) NOT NULL DEFAULT 0');
    await addIfMissing('attended_program', 'VARCHAR(50) DEFAULT NULL');
    await addIfMissing('program_type', 'VARCHAR(20) DEFAULT NULL');
    await addIfMissing('facebook', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('enrollment_number', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('completion_year', 'VARCHAR(10) DEFAULT NULL');
    await addIfMissing('functional_area', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('employment_type', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('seniority_level', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('country', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('city', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('education_level', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('work_city', 'VARCHAR(100) DEFAULT NULL');
    await addIfMissing('parent_name', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('ug_college', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('pg_college', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('doctorate_name', 'VARCHAR(255) DEFAULT NULL');
    await addIfMissing('social_links', 'TEXT DEFAULT NULL');
    await addIfMissing('show_contact', 'TINYINT(1) NOT NULL DEFAULT 0');
    await addIfMissing('is_featured',  'TINYINT(1) NOT NULL DEFAULT 1');

    // Make previously NOT NULL columns nullable (no longer required in new form)
    const makeNullable = async (col, type) => {
      try { await db.query(`ALTER TABLE alumni MODIFY COLUMN \`${col}\` ${type} NULL DEFAULT NULL`); } catch (_) {}
    };
    await makeNullable('batch', 'VARCHAR(10)');
    await makeNullable('department', 'VARCHAR(255)');
    await makeNullable('institution', 'VARCHAR(255)');
    await makeNullable('phone', 'VARCHAR(30)');
    await makeNullable('gender', "ENUM('Male','Female','Other')");
    await makeNullable('dob', 'DATE');
    await makeNullable('current_status', "ENUM('Employed','Self-Employed','Studying','Not Working')");
    await makeNullable('password', 'VARCHAR(255)');

    // events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'other',
        description TEXT,
        image VARCHAR(500) DEFAULT NULL,
        event_date DATETIME DEFAULT NULL,
        location VARCHAR(255) DEFAULT NULL,
        is_published TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // broadcast_messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS broadcast_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        sent_count INT DEFAULT 0,
        failed_count INT DEFAULT 0,
        attachment VARCHAR(500) DEFAULT NULL,
        attachment_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Add attachment columns if table already existed without them
    const [bmCols] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'broadcast_messages'
    `);
    const bmColNames = new Set(bmCols.map(c => c.COLUMN_NAME));
    if (!bmColNames.has('attachment'))
      await db.query("ALTER TABLE broadcast_messages ADD COLUMN attachment VARCHAR(500) DEFAULT NULL");
    if (!bmColNames.has('attachment_name'))
      await db.query("ALTER TABLE broadcast_messages ADD COLUMN attachment_name VARCHAR(255) DEFAULT NULL");

    console.log('✅ All database migrations complete');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  }
}

function getDb() {
  return db;
}

function requireDb(res) {
  if (!db) {
    res.status(500).json({ error: 'Database not connected' });
    return false;
  }
  return true;
}

function normalizeForDb(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

module.exports = { connectDatabase, runMigrations, getDb, requireDb, normalizeForDb };
