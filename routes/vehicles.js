const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all vehicles (Admin & Instructors can view)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY plate_number');
    res.json({ vehicles: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Araçlar alınamadı' });
  }
});

// Add new vehicle (Admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { plateNumber, vehicleType, brandModel, inspectionEndDate, insuranceEndDate } = req.body;
    
    if (!plateNumber) {
      return res.status(400).json({ error: 'Plaka (plateNumber) gerekli' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, vehicle_type, brand_model, inspection_end_date, insurance_end_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plateNumber, vehicleType, brandModel, inspectionEndDate, insuranceEndDate]
    );

    res.status(201).json({ message: 'Araç eklendi', vehicle: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Bu plakaya sahip araç zaten var' });
    }
    res.status(500).json({ error: 'Araç eklenemedi' });
  }
});

// Update vehicle (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { plateNumber, vehicleType, brandModel, inspectionEndDate, insuranceEndDate } = req.body;
    
    const result = await pool.query(
      `UPDATE vehicles 
       SET plate_number = $1, vehicle_type = $2, brand_model = $3, inspection_end_date = $4, insurance_end_date = $5
       WHERE id = $6 RETURNING *`,
      [plateNumber, vehicleType, brandModel, inspectionEndDate, insuranceEndDate, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    res.json({ message: 'Araç güncellendi', vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Araç güncellenemedi' });
  }
});

// Delete vehicle (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    res.json({ message: 'Araç silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Araç silinemedi' });
  }
});

module.exports = router;
