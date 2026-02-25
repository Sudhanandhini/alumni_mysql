const express = require('express');
const router = express.Router();
const { requireDb, getDb } = require('../config/db');

router.get('/total-alumni', async (req, res) => {
  try {
    const db = getDb();
    if (!requireDb(res)) return;
    const [result] = await db.query('SELECT COUNT(*) as count FROM alumni');
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching total alumni:', error);
    res.status(500).json({ error: 'Failed to fetch total alumni count', message: error.message });
  }
});

router.get('/careers', async (req, res) => {
  try {
    const db = getDb();
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

router.get('/companies', async (req, res) => {
  try {
    const db = getDb();
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

router.get('/countries', async (req, res) => {
  try {
    const db = getDb();
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

module.exports = router;
