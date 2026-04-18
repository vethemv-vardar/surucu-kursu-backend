const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Rastgele 20 soruluk bir deneme sınavı çek (Öğrenci)
router.get('/random', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `SELECT id, category, question_text, option_a, option_b, option_c, option_d 
       FROM exam_questions 
       ORDER BY RANDOM() LIMIT $1`,
      [limit]
    );
    res.json({ questions: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Sorular alınamadı' });
  }
});

// Öğrencinin test sonucunu kaydet
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { score, correctCount, wrongCount, blankCount } = req.body;
    
    // Güvenlik: Öğrenciler sadece kendi sonuçlarını kaydedebilir.
    const result = await pool.query(
      `INSERT INTO student_test_results (user_id, score, correct_count, wrong_count, blank_count) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, score, correctCount, wrongCount, blankCount]
    );
    res.status(201).json({ message: 'Sonuç kaydedildi', testResult: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Sonuç kaydedilemedi' });
  }
});

// Admin tarafı: Soru ekleme
router.post('/question', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { category, questionText, optionA, optionB, optionC, optionD, correctOption } = req.body;
    
    if (!category || !questionText || !correctOption) {
      return res.status(400).json({ error: 'Kategori, Soru ve Doğru Cevap alanları zorunludur' });
    }

    const result = await pool.query(
      `INSERT INTO exam_questions (category, question_text, option_a, option_b, option_c, option_d, correct_option) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, questionText, optionA, optionB, optionC, optionD, correctOption.toUpperCase()]
    );
    res.status(201).json({ message: 'Soru eklendi', question: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Soru eklenemedi' });
  }
});

module.exports = router;
