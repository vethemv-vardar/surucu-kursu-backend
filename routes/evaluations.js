const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get evaluations for a student (Students can view their own, Admin/Instructors can view any)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Authorization check
    if (req.user.role === 'student' && parseInt(studentId) !== req.user.id) {
        return res.status(403).json({ error: 'Sadece kendi değerlendirmelerinizi görebilirsiniz' });
    }

    const result = await pool.query(
      `SELECT e.*, l.lesson_date, l.start_time, i.full_name as instructor_name
       FROM lesson_evaluations e
       JOIN driving_lessons l ON e.lesson_id = l.id
       JOIN users i ON e.instructor_id = i.id
       WHERE e.student_id = $1
       ORDER BY e.created_at DESC`,
      [studentId]
    );
    res.json({ evaluations: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Değerlendirmeler alınamadı' });
  }
});

// Instructor submits a new evaluation (rubric) for a lesson
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can submit rubrics
    if (req.user.role === 'student') {
        return res.status(403).json({ error: 'Öğrenciler değerlendirme formu (rubrik) dolduramaz' });
    }

    const { lessonId, studentId, steeringControl, parallelParking, slopeStart, trafficRules, generalNotes } = req.body;
    
    if (!lessonId || !studentId) {
      return res.status(400).json({ error: 'Ders ve Öğrenci bilgisi zorunludur' });
    }

    const instructorId = req.user.role === 'instructor' ? req.user.id : req.body.instructorId;

    const result = await pool.query(
      `INSERT INTO lesson_evaluations (lesson_id, instructor_id, student_id, steering_control, parallel_parking, slope_start, traffic_rules, general_notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (lesson_id) DO UPDATE 
       SET steering_control = $4, parallel_parking = $5, slope_start = $6, traffic_rules = $7, general_notes = $8
       RETURNING *`,
      [lessonId, instructorId, studentId, steeringControl, parallelParking, slopeStart, trafficRules, generalNotes]
    );

    res.status(201).json({ message: 'Değerlendirme başarıyla kaydedildi', evaluation: result.rows[0] });

    // Bonus: Otomatik olarak öğrenciye bildirim at (Trigger an internal notification)
    await pool.query(
      `INSERT INTO user_notifications (user_id, title, message, notification_type) 
       VALUES ($1, $2, $3, $4)`,
      [studentId, 'Yeni Değerlendirme', 'Eğitmeniniz son direksiyon dersiniz için bir değerlendirme formu (rubrik) doldurdu. Hemen inceleyin!', 'rubric_added']
    );

  } catch (err) {
    res.status(500).json({ error: 'Değerlendirme (Rubrik) kaydedilemedi' });
  }
});

module.exports = router;
