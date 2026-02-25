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
