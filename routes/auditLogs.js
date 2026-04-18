const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all audit logs (Admin only)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name as admin_name 
       FROM audit_logs a 
       LEFT JOIN users u ON a.admin_id = u.id 
       ORDER BY a.created_at DESC LIMIT 100`
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Audit logları alınamadı' });
  }
});

module.exports = router;
