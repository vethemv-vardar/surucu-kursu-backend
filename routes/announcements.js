const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Mobil: duyurular (hedef rol = all veya kullanıcının rolü)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    const result = await pool.query(
      `SELECT * FROM announcements WHERE target_role IS NULL OR target_role = 'all' OR target_role = $1 ORDER BY created_at DESC LIMIT 50`,
      [role]
    );
    res.json({ announcements: result.rows });
  } catch (err) {
    console.error("ANNOUNCEMENTS:", err);
    res.status(500).json({ error: "Duyurular alınamadı ❌" });
  }
});

// Admin: tüm duyurular
router.get("/admin", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json({ announcements: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Liste alınamadı ❌" });
  }
});

// Admin: duyuru ekle (toplu bildirim hedefi: target_role = student, instructor, all)
router.post("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, body, targetRole } = req.body;
    if (!title) return res.status(400).json({ error: "Başlık zorunlu ❌" });
    const r = await pool.query(
      `INSERT INTO announcements (title, body, target_role) VALUES ($1, $2, $3) RETURNING *`,
      [title, body || null, targetRole || "all"]
    );
    res.status(201).json({ message: "Duyuru eklendi ✅", announcement: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Eklenemedi ❌" });
  }
});

// Admin: duyuru sil
router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM announcements WHERE id = $1 RETURNING id", [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Duyuru bulunamadı ❌" });
    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: "Silinemedi ❌" });
  }
});

module.exports = router;
