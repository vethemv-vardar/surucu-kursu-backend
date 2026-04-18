const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get instructor hakediş (Admin views completed lessons and existing payments to calculate outstanding balance)
router.get('/hakedis/:instructorId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const instructorId = req.params.instructorId;
    
    // Count completed driving lessons for this instructor (Assuming 'completed' status exists)
    // In a real scenario, you'd multiply this by a rate per lesson. Let's assume 500 TL per lesson.
    const lessonsQuery = await pool.query(
      `SELECT COUNT(*) as completed_lessons FROM driving_lessons 
       WHERE instructor_id = $1 AND status = 'completed'`,
      [instructorId]
    );
    
    const count = parseInt(lessonsQuery.rows[0].completed_lessons || 0);
    const ratePerLesson = 500; // TL (Can be configurable from course_settings)
    const totalEarned = count * ratePerLesson;
    
    // Sum previous payments to this instructor
    const paymentsQuery = await pool.query(
      `SELECT SUM(amount) as total_paid FROM instructor_payments WHERE instructor_id = $1`,
      [instructorId]
    );
    
    const totalPaid = parseFloat(paymentsQuery.rows[0].total_paid || 0);
    
    res.json({ 
       instructorId, 
       completedLessons: count, 
       ratePerLesson, 
       totalEarned, 
       totalPaid, 
       balance: totalEarned - totalPaid 
    });
  } catch (err) {
    res.status(500).json({ error: 'Hakediş hesaplanamadı' });
  }
});

// Admin records a payment to instructor
router.post('/pay', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { instructorId, amount, paymentDate, description } = req.body;
    
    if (!instructorId || !amount) {
      return res.status(400).json({ error: 'Eğitmen ve Tutar gerekli' });
    }

    const result = await pool.query(
      `INSERT INTO instructor_payments (instructor_id, amount, payment_date, description) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [instructorId, amount, paymentDate || new Date(), description]
    );

    res.status(201).json({ message: 'Eğitmen ödemesi kaydedildi', payment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ödeme kaydedilemedi' });
  }
});

module.exports = router;
