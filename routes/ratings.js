// ratings.js — Aylık kod tabanlı eğitmen puanlama sistemi
const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

// Okunması kolay rastgele kod üretici (I, O, 0, 1 harfleri hariç)
function generateCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── PUBLIC ─────────────────────────────────────────────────────────────────

// Sınıf kodunu doğrula → { valid, class_type }
// POST /api/ratings/verify-code
router.post("/verify-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Kod gerekli ❌" });

    const result = await pool.query(
      `SELECT class_type FROM class_codes
       WHERE UPPER(code) = UPPER($1) AND is_active = true AND valid_until > now()`,
      [code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Geçersiz veya süresi dolmuş kod ❌" });
    }

    res.json({ valid: true, class_type: result.rows[0].class_type });
  } catch (err) {
    console.error("VERIFY CODE ERROR:", err);
    res.status(500).json({ error: "Kod doğrulama hatası ❌" });
  }
});

// Eğitmen kodu ile giriş yap → kendi sıralaması + yorumlar
// POST /api/ratings/instructor-login
router.post("/instructor-login", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Kod gerekli ❌" });

    const instructorRes = await pool.query(
      `SELECT ic.instructor_id, ic.class_type, u.full_name
       FROM instructor_codes ic
       JOIN users u ON u.id = ic.instructor_id
       WHERE UPPER(ic.code) = UPPER($1)`,
      [code.trim()]
    );

    if (instructorRes.rows.length === 0) {
      return res.status(404).json({ error: "Geçersiz eğitmen kodu ❌" });
    }

    const { instructor_id, class_type, full_name } = instructorRes.rows[0];

    // Sınıftaki tüm sıralama
    const rankingRes = await pool.query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(ir.rating),0) DESC, COUNT(ir.id) DESC) AS rank,
         u.id,
         ROUND(COALESCE(AVG(ir.rating),0)::numeric, 2)::float AS avg_rating,
         COUNT(ir.id)::int AS rating_count
       FROM users u
       JOIN instructor_codes ic ON ic.instructor_id = u.id AND ic.class_type = $1
       LEFT JOIN instructor_ratings ir ON ir.instructor_id = u.id
       WHERE u.role = 'instructor'
       GROUP BY u.id
       ORDER BY avg_rating DESC, rating_count DESC`,
      [class_type]
    );

    const myRow = rankingRes.rows.find((r) => r.id === instructor_id);
    const totalInstructors = rankingRes.rows.length;

    // Yorumlar
    const commentsRes = await pool.query(
      `SELECT rating, comment, created_at
       FROM instructor_ratings
       WHERE instructor_id = $1 AND comment IS NOT NULL AND TRIM(comment) != ''
       ORDER BY created_at DESC`,
      [instructor_id]
    );

    res.json({
      instructor_name: full_name,
      class_type,
      rank: myRow ? Number(myRow.rank) : null,
      total_instructors: totalInstructors,
      avg_rating: myRow ? myRow.avg_rating : 0,
      rating_count: myRow ? myRow.rating_count : 0,
      comments: commentsRes.rows,
    });
  } catch (err) {
    console.error("INSTRUCTOR LOGIN ERROR:", err);
    res.status(500).json({ error: "Eğitmen giriş hatası ❌" });
  }
});

// Sınıf koduna göre eğitmen listesi (puan ortalamasıyla)
// GET /api/ratings/instructors?class_type=araba&code=ABCD12
router.get("/instructors", async (req, res) => {
  try {
    const { class_type, code } = req.query;
    if (!code || !class_type) {
      return res.status(400).json({ error: "Kod ve sınıf tipi gerekli ❌" });
    }

    const codeCheck = await pool.query(
      `SELECT id FROM class_codes
       WHERE UPPER(code) = UPPER($1) AND class_type = $2
       AND is_active = true AND valid_until > now()`,
      [code.trim(), class_type]
    );
    if (codeCheck.rows.length === 0) {
      return res.status(403).json({ error: "Geçersiz kod ❌" });
    }

    const instructors = await pool.query(
      `SELECT
         u.id, u.full_name,
         ROUND(COALESCE(AVG(ir.rating),0)::numeric, 2)::float AS avg_rating,
         COUNT(ir.id)::int AS rating_count
       FROM users u
       JOIN instructor_codes ic ON ic.instructor_id = u.id AND ic.class_type = $1
       LEFT JOIN instructor_ratings ir ON ir.instructor_id = u.id
       WHERE u.role = 'instructor'
       GROUP BY u.id, u.full_name
       ORDER BY avg_rating DESC, rating_count DESC`,
      [class_type]
    );

    res.json({ instructors: instructors.rows, class_type });
  } catch (err) {
    console.error("GET INSTRUCTORS ERROR:", err);
    res.status(500).json({ error: "Eğitmen listesi hatası ❌" });
  }
});

// Puan ver (her cihazdan eğitmen başına 1 kez)
// POST /api/ratings/rate
// Body: { code, class_type, instructor_id, rating, comment, device_id }
router.post("/rate", async (req, res) => {
  try {
    const { code, class_type, instructor_id, rating, comment, device_id } = req.body;

    if (!code || !class_type || !instructor_id || !rating || !device_id) {
      return res.status(400).json({ error: "Eksik bilgi ❌" });
    }

    // Kod geçerli mi?
    const codeCheck = await pool.query(
      `SELECT id FROM class_codes
       WHERE UPPER(code) = UPPER($1) AND class_type = $2
       AND is_active = true AND valid_until > now()`,
      [code.trim(), class_type]
    );
    if (codeCheck.rows.length === 0) {
      return res.status(403).json({ error: "Geçersiz veya süresi dolmuş kod ❌" });
    }

    // Eğitmen bu sınıfta mı?
    const instructorCheck = await pool.query(
      `SELECT u.id FROM users u
       JOIN instructor_codes ic ON ic.instructor_id = u.id
       WHERE u.id = $1 AND ic.class_type = $2 AND u.role = 'instructor'`,
      [instructor_id, class_type]
    );
    if (instructorCheck.rows.length === 0) {
      return res.status(404).json({ error: "Bu sınıfta eğitmen bulunamadı ❌" });
    }

    const r = Number(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ error: "Puan 1-5 arası olmalı ❌" });
    }

    // Bu cihaz bu eğitmene zaten oy verdi mi?
    const existing = await pool.query(
      `SELECT id FROM instructor_ratings WHERE device_id = $1 AND instructor_id = $2`,
      [device_id, instructor_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Bu cihazdan bu eğitmene zaten puan verildi ❌" });
    }

    await pool.query(
      `INSERT INTO instructor_ratings (device_id, instructor_id, class_type, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [device_id, instructor_id, class_type, r, comment?.trim() || null]
    );

    res.json({ message: "Puanınız kaydedildi ✅" });
  } catch (err) {
    console.error("RATE ERROR:", err);
    res.status(500).json({ error: "Puan kaydetme hatası ❌" });
  }
});

// Sıralama tablosu
// GET /api/ratings/ranking?class_type=araba&code=ABCD12
router.get("/ranking", async (req, res) => {
  try {
    const { class_type, code } = req.query;
    if (!code || !class_type) {
      return res.status(400).json({ error: "Kod ve sınıf tipi gerekli ❌" });
    }

    const codeCheck = await pool.query(
      `SELECT id FROM class_codes
       WHERE UPPER(code) = UPPER($1) AND class_type = $2
       AND is_active = true AND valid_until > now()`,
      [code.trim(), class_type]
    );
    if (codeCheck.rows.length === 0) {
      return res.status(403).json({ error: "Geçersiz kod ❌" });
    }

    const ranking = await pool.query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(ir.rating),0) DESC, COUNT(ir.id) DESC) AS rank,
         u.id, u.full_name,
         ROUND(COALESCE(AVG(ir.rating),0)::numeric, 2)::float AS avg_rating,
         COUNT(ir.id)::int AS rating_count
       FROM users u
       JOIN instructor_codes ic ON ic.instructor_id = u.id AND ic.class_type = $1
       LEFT JOIN instructor_ratings ir ON ir.instructor_id = u.id
       WHERE u.role = 'instructor'
       GROUP BY u.id, u.full_name
       ORDER BY avg_rating DESC, rating_count DESC`,
      [class_type]
    );

    res.json({ ranking: ranking.rows, class_type });
  } catch (err) {
    console.error("RANKING ERROR:", err);
    res.status(500).json({ error: "Sıralama hatası ❌" });
  }
});

// ─── ADMIN ──────────────────────────────────────────────────────────────────

// Tüm sınıf kodlarını listele
router.get("/admin/class-codes", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, code, class_type, valid_from, valid_until, is_active, created_at
       FROM class_codes ORDER BY created_at DESC`
    );
    res.json({ codes: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Kodlar listelenemedi ❌" });
  }
});

// Yeni aylık kodlar üret (eski aktif kodları iptal eder)
// POST /api/ratings/admin/class-codes/generate
router.post("/admin/class-codes/generate", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await pool.query(`UPDATE class_codes SET is_active = false WHERE is_active = true`);

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    let arabaCode, motoCode;
    // Çakışma ihtimaline karşı tekrar dene
    for (let i = 0; i < 10; i++) {
      arabaCode = generateCode();
      motoCode = generateCode();
      if (arabaCode !== motoCode) break;
    }

    await pool.query(
      `INSERT INTO class_codes (code, class_type, valid_from, valid_until, is_active)
       VALUES ($1, 'araba', $2, $3, true), ($4, 'motorsiklet', $2, $3, true)`,
      [arabaCode, validFrom, validUntil, motoCode]
    );

    res.json({
      message: "Yeni aylık kodlar oluşturuldu ✅",
      araba_code: arabaCode,
      motorsiklet_code: motoCode,
      valid_from: validFrom,
      valid_until: validUntil,
    });
  } catch (err) {
    console.error("GENERATE CODES ERROR:", err);
    res.status(500).json({ error: "Kod oluşturma hatası ❌" });
  }
});

// Tüm eğitmen kodlarını listele
router.get("/admin/instructor-codes", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ic.id, ic.code, ic.class_type, ic.created_at, u.full_name, u.email
       FROM instructor_codes ic
       JOIN users u ON u.id = ic.instructor_id
       ORDER BY u.full_name ASC`
    );
    res.json({ codes: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Eğitmen kodları listelenemedi ❌" });
  }
});

// Eğitmene kod ata / güncelle
// POST /api/ratings/admin/instructor-codes
// Body: { instructor_id, class_type }
router.post("/admin/instructor-codes", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { instructor_id, class_type } = req.body;
    if (!instructor_id || !class_type) {
      return res.status(400).json({ error: "Eğitmen ID ve sınıf tipi gerekli ❌" });
    }
    if (!["araba", "motorsiklet"].includes(class_type)) {
      return res.status(400).json({ error: "Geçersiz sınıf tipi ❌" });
    }

    const instructorCheck = await pool.query(
      `SELECT id, full_name FROM users WHERE id = $1 AND role = 'instructor'`,
      [instructor_id]
    );
    if (instructorCheck.rows.length === 0) {
      return res.status(404).json({ error: "Eğitmen bulunamadı ❌" });
    }

    const code = generateCode();

    const result = await pool.query(
      `INSERT INTO instructor_codes (instructor_id, code, class_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (instructor_id)
       DO UPDATE SET code = EXCLUDED.code, class_type = EXCLUDED.class_type
       RETURNING code, class_type`,
      [instructor_id, code, class_type]
    );

    res.json({
      message: "Eğitmen kodu oluşturuldu ✅",
      instructor_name: instructorCheck.rows[0].full_name,
      code: result.rows[0].code,
      class_type: result.rows[0].class_type,
    });
  } catch (err) {
    console.error("INSTRUCTOR CODE ERROR:", err);
    res.status(500).json({ error: "Eğitmen kodu hatası ❌" });
  }
});

// Admin genel bakış (tüm eğitmenlerin puanları + sıralaması)
router.get("/admin/overview", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.full_name, ic.class_type,
         ROUND(COALESCE(AVG(ir.rating),0)::numeric, 2)::float AS avg_rating,
         COUNT(ir.id)::int AS rating_count,
         ROW_NUMBER() OVER (PARTITION BY ic.class_type ORDER BY COALESCE(AVG(ir.rating),0) DESC) AS rank_in_class
       FROM users u
       JOIN instructor_codes ic ON ic.instructor_id = u.id
       LEFT JOIN instructor_ratings ir ON ir.instructor_id = u.id
       WHERE u.role = 'instructor'
       GROUP BY u.id, u.full_name, ic.class_type
       ORDER BY ic.class_type, avg_rating DESC`
    );
    res.json({ instructors: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Genel bakış hatası ❌" });
  }
});

module.exports = router;
