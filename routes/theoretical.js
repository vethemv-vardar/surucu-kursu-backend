const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all theoretical lessons
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM theoretical_lessons ORDER BY lesson_name');
    res.json({ theoreticalLessons: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Teorik dersler alınamadı' });
  }
});

// Add new theoretical lesson (Admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { lessonName, description, totalHours } = req.body;
    
    if (!lessonName || !totalHours) {
      return res.status(400).json({ error: 'Ders Adı (lessonName) ve Toplam Saat (totalHours) gerekli' });
    }

    const result = await pool.query(
      `INSERT INTO theoretical_lessons (lesson_name, description, total_hours) 
       VALUES ($1, $2, $3) RETURNING *`,
      [lessonName, description, totalHours]
    );

    res.status(201).json({ message: 'Teorik ders eklendi', lesson: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ders eklenemedi' });
  }
});

// Get student attendance for a given user
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    
    if (req.user.role !== 'admin' && userId != req.user.id) {
       return res.status(403).json({ error: 'Başkasına ait yoklamayı göremezsiniz' });
    }

    // Join with theoretical_lessons to get lesson names
    const result = await pool.query(
      `SELECT a.*, t.lesson_name, t.total_hours
       FROM attendance a
       JOIN theoretical_lessons t ON a.theoretical_lesson_id = t.id
       WHERE a.user_id = $1
       ORDER BY a.attended_date DESC`,
      [userId]
    );
    
    res.json({ attendance: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Yoklama kayıtları alınamadı' });
  }
});

// Record new attendance (Admin/Instructor can mark attendance)
router.post('/attendance', authenticateToken, async (req, res) => {
  try {
    // Both admin and instructor should be able to mark attendance. Let's assume instructor role exists.
    if (req.user.role === 'student') {
        return res.status(403).json({ error: 'Öğrenciler yoklama giremez' });
    }

    const { userId, theoreticalLessonId, attendedDate, attendedHours } = req.body;
    
    if (!userId || !theoreticalLessonId || !attendedDate) {
      return res.status(400).json({ error: 'Öğrenci, Ders ve Tarih zorunludur' });
    }

    const result = await pool.query(
      `INSERT INTO attendance (user_id, theoretical_lesson_id, attended_date, attended_hours) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, theoreticalLessonId, attendedDate, attendedHours || 1]
    );

    res.status(201).json({ message: 'Yoklama kaydedildi', attendanceRecord: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Yoklama kaydedilemedi' });
  }
});

module.exports = router;
