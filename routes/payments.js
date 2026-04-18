const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Öğrencinin kendi ücret ve ödeme bilgisi (mobil)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const feeRes = await pool.query(
      "SELECT * FROM student_fees WHERE user_id = $1",
      [req.user.id]
    );
    const paymentsRes = await pool.query(
      "SELECT * FROM payment_records WHERE user_id = $1 ORDER BY payment_date DESC",
      [req.user.id]
    );
    const fee = feeRes.rows[0];
    const totalPaid = paymentsRes.rows.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const totalAmount = fee ? parseFloat(fee.total_amount || 0) : 0;
    const remaining = totalAmount - totalPaid;
    res.json({
      fee: fee || null,
      payments: paymentsRes.rows,
      totalAmount,
      totalPaid,
      remaining,
    });
  } catch (err) {
    console.error("PAYMENTS ME:", err);
    res.status(500).json({ error: "Ödeme bilgisi alınamadı ❌" });
  }
});

// Admin: öğrenci ücret/ödeme listesi
router.get("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      const fees = await pool.query(
        `SELECT sf.*, u.full_name, u.email FROM student_fees sf JOIN users u ON u.id = sf.user_id`
      );
      return res.json({ fees: fees.rows });
    }
    const feeRes = await pool.query("SELECT * FROM student_fees WHERE user_id = $1", [userId]);
    const paymentsRes = await pool.query(
      "SELECT * FROM payment_records WHERE user_id = $1 ORDER BY payment_date DESC",
      [userId]
    );
    res.json({ fee: feeRes.rows[0] || null, payments: paymentsRes.rows });
  } catch (err) {
    res.status(500).json({ error: "Liste alınamadı ❌" });
  }
});

// Admin: ücret tanımla/güncelle
router.post("/fee", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, totalAmount, installmentCount, notes } = req.body;
    if (!userId) return res.status(400).json({ error: "userId zorunlu ❌" });
    const r = await pool.query(
      `INSERT INTO student_fees (user_id, total_amount, installment_count, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET total_amount = $2, installment_count = $3, notes = $4, updated_at = now()
       RETURNING *`,
      [userId, totalAmount || 0, installmentCount || 1, notes || null]
    );
    res.status(201).json({ message: "Ücret kaydedildi ✅", fee: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Kaydedilemedi ❌" });
  }
});

// Admin: ödeme kaydı ekle
router.post("/record", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, amount, paymentDate, description } = req.body;
    if (!userId || amount == null) return res.status(400).json({ error: "userId ve amount zorunlu ❌" });
    const r = await pool.query(
      `INSERT INTO payment_records (user_id, amount, payment_date, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, amount, paymentDate || new Date().toISOString().slice(0, 10), description || null]
    );
    res.status(201).json({ message: "Ödeme kaydedildi ✅", record: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Kaydedilemedi ❌" });
  }
});

module.exports = router;
