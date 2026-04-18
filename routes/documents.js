const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

const DOC_TYPES = ["saglik_raporu", "sabika_kaydi", "ogrenim_belgesi", "fotograf"];

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM student_documents WHERE user_id = $1 ORDER BY document_type",
      [req.user.id]
    );
    res.json({ documents: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Belge listesi alınamadı" });
  }
});

router.get("/missing", authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    if (req.user.role !== "admin" && userId != req.user.id) return res.status(403).json({ error: "Yetkisiz" });
    const existing = await pool.query("SELECT document_type FROM student_documents WHERE user_id = $1", [userId]);
    const have = new Set(existing.rows.map((r) => r.document_type));
    const missing = DOC_TYPES.filter((t) => !have.has(t));
    res.json({ missing });
  } catch (err) {
    res.status(500).json({ error: "Alınamadı" });
  }
});

router.get("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId gerekli" });
    const result = await pool.query("SELECT * FROM student_documents WHERE user_id = $1 ORDER BY document_type", [userId]);
    res.json({ documents: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Liste alınamadı" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { documentType, fileUrl, userId: bodyUserId } = req.body;
    const userId = bodyUserId || req.user.id;
    if (req.user.role !== "admin" && userId != req.user.id) return res.status(403).json({ error: "Yetkisiz" });
    if (!DOC_TYPES.includes(documentType) || !fileUrl) return res.status(400).json({ error: "documentType ve fileUrl zorunlu" });
    const r = await pool.query(
      `INSERT INTO student_documents (user_id, document_type, file_url) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, document_type) DO UPDATE SET file_url = $3 RETURNING *`,
      [userId, documentType, fileUrl]
    );
    res.status(201).json({ message: "Belge kaydedildi", document: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Kaydedilemedi" });
  }
});

router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM student_documents WHERE id = $1 RETURNING id", [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Belge bulunamadı" });
    res.json({ message: "Silindi" });
  } catch (err) {
    res.status(500).json({ error: "Silinemedi" });
  }
});

// Update document status (Approve or Reject with reason)
router.put('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['onaylandi', 'reddedildi', 'beklemede'].includes(status)) {
       return res.status(400).json({ error: "Geçersiz durum (status). 'onaylandi', 'reddedildi', veya 'beklemede' olmalı." });
    }

    if (status === 'reddedildi' && !rejectionReason) {
       return res.status(400).json({ error: "Reddedilen belgeler için ret nedeni (rejectionReason) belirtilmelidir." });
    }

    const r = await pool.query(
      `UPDATE student_documents 
       SET status = $1, rejection_reason = $2 
       WHERE id = $3 RETURNING *`,
      [status, status === 'reddedildi' ? rejectionReason : null, req.params.id]
    );

    if (r.rows.length === 0) return res.status(404).json({ error: "Belge bulunamadı" });

    // TODO: Burada bir audit_logs tablosuna insert yapılabilir.
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'DOCUMENT_STATUS_CHANGED', 'student_documents', r.rows[0].id, JSON.stringify({ status, rejectionReason })]
    );

    res.json({ message: "Belge durumu güncellendi", document: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Durum güncellenemedi" });
  }
});

module.exports = router;
