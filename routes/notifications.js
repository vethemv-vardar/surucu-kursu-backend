const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Kullanıcının kendi bildirimlerini çekmesi (Student, Instructor, Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const result = await pool.query(
      `SELECT * FROM user_notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );

    // Get unread count as well
    const unreadPrompt = await pool.query(
        `SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    const unreadCount = parseInt(unreadPrompt.rows[0].count);

    res.json({ notifications: result.rows, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Bildirimler alınamadı' });
  }
});

// Bir bildirimi "Okundu" olarak işaretleme
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Sadece bildirim sahibi durumu değiştirebilir
    const result = await pool.query(
      `UPDATE user_notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bildirim bulunamadı veya yetkiniz yok' });
    }

    res.json({ message: 'Bildirim okundu olarak işaretlendi', notification: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Bildirim güncellenemedi' });
  }
});

// Admin Paneli: Belirli bir kullanıcıya "Manuel" özel bildirim gönderme
router.post('/send', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, title, message, notificationType } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Öğrenci, Başlık ve Mesaj alanları zorunludur' });
    }

    const result = await pool.query(
      `INSERT INTO user_notifications (user_id, title, message, notification_type) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, notificationType || 'sistem']
    );

    res.status(201).json({ message: 'Özel bildirim başarıyla gönderildi', notification: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Bildirim gönderilemedi' });
  }
});

module.exports = router;
