const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Herkes (mobil): iletişim bilgileri – token opsiyonel
router.get("/contact", async (req, res) => {
  try {
    const r = await pool.query("SELECT key, value FROM course_settings WHERE key IN ('phone', 'address', 'map_url', 'whatsapp')");
    const contact = {};
    r.rows.forEach((row) => { contact[row.key] = row.value; });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Ayarlar alınamadı ❌" });
  }
});

// Admin: tüm ayarları getir
router.get("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const r = await pool.query("SELECT key, value, updated_at FROM course_settings ORDER BY key");
    res.json({ settings: r.rows });
  } catch (err) {
    res.status(500).json({ error: "Ayarlar alınamadı ❌" });
  }
});

// Admin: ayar güncelle (telefon, adres, harita, whatsapp)
router.put("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { phone, address, mapUrl, whatsapp } = req.body;
    const updates = [
      ["phone", phone],
      ["address", address],
      ["map_url", mapUrl],
      ["whatsapp", whatsapp],
    ].filter(([, v]) => v !== undefined);
    for (const [key, value] of updates) {
      await pool.query(
        "UPDATE course_settings SET value = $2, updated_at = now() WHERE key = $1",
        [key, value]
      );
    }
    const r = await pool.query("SELECT key, value FROM course_settings ORDER BY key");
    res.json({ message: "Güncellendi ✅", settings: r.rows });
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi ❌" });
  }
});

module.exports = router;
