const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT e.* FROM exams e WHERE e.user_id = $1 ORDER BY e.exam_date DESC, e.exam_time DESC",
      [req.user.id]
    );
    res.json({ exams: result.rows });
  } catch (err) {
    console.error("EXAMS ME:", err);
    res.status(500).json({ error: "Sınav listesi alınamadı" });
  }
});

router.get("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.query.userId;
    const q = userId
      ? "SELECT e.*, u.full_name, u.email FROM exams e JOIN users u ON u.id = e.user_id WHERE e.user_id = $1 ORDER BY e.exam_date DESC"
      : "SELECT e.*, u.full_name, u.email FROM exams e JOIN users u ON u.id = e.user_id ORDER BY e.exam_date DESC LIMIT 200";
    const result = await pool.query(q, userId ? [userId] : []);
    res.json({ exams: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Sınav listesi alınamadı" });
  }
});

router.post("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, examType, examDate, examTime, location, result, score, notes, entryDocumentUrl } = req.body;
    if (!userId || !examType) return res.status(400).json({ error: "Öğrenci ve sınav tipi zorunlu" });
    const r = await pool.query(
      `INSERT INTO exams (user_id, exam_type, exam_date, exam_time, location, result, score, notes, entry_document_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, examType, examDate || null, examTime || null, location || null, result || null, score || null, notes || null, entryDocumentUrl || null]
    );
    res.status(201).json({ message: "Sınav eklendi", exam: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Sınav eklenemedi" });
  }
});

router.put("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { examDate, examTime, location, result, score, notes, entryDocumentUrl } = req.body;
    const r = await pool.query(
      `UPDATE exams SET exam_date = COALESCE($2, exam_date), exam_time = COALESCE($3, exam_time),
       location = COALESCE($4, location), result = COALESCE($5, result), score = COALESCE($6, score),
       notes = COALESCE($7, notes), entry_document_url = COALESCE($8, entry_document_url), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id, examDate, examTime, location, result, score, notes, entryDocumentUrl]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Sınav bulunamadı" });
    res.json({ message: "Güncellendi", exam: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi" });
  }
});

router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM exams WHERE id = $1 RETURNING id", [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Sınav bulunamadı" });
    res.json({ message: "Silindi" });
  } catch (err) {
    res.status(500).json({ error: "Silinemedi" });
  }
});

module.exports = router;
