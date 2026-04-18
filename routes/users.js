const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { authenticateToken } = require("../middleware/auth");

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, full_name, phone, tc_kimlik_no } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password ve role zorunlu ❌' });
    }

    // Email zaten var mı?
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email zaten kayıtlı ❌' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, tc_kimlik_no)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, role`,
      [email, hashedPassword, role, full_name, phone, tc_kimlik_no]
    );

    res.status(201).json({
      message: 'Kullanıcı oluşturuldu ✅',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıt başarısız ❌' });
  }
});
const jwt = require('jsonwebtoken');

// LOGIN – Email veya TC kimlik numarası ile giriş
router.post('/login', async (req, res) => {
  try {
    const { email, login, password } = req.body;
    const loginValue = login || email;
    if (!loginValue || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı/TC ve şifre girin ❌' });
    }

    // Giriş değeri @ içeriyorsa email, yoksa TC kabul et
    const isEmail = String(loginValue).includes('@');
    const userResult = await pool.query(
      isEmail
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE tc_kimlik_no = $1',
      [loginValue.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı ❌' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Şifre yanlış ❌' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Giriş başarılı ✅',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        tc_kimlik_no: user.tc_kimlik_no
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Giriş başarısız ❌' });
  }
});

// AUTHENTICATED USER PEERS (for points)
// Student -> list instructors, Instructor -> list students
// GET /api/users/peers
router.get("/peers", authenticateToken, async (req, res) => {
  try {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Token gerekli ❌" });

    if (role === "admin") {
      return res.status(403).json({ error: "Admin için uygun değil ❌" });
    }

    const targetRole = role === "student" ? "instructor" : role === "instructor" ? "student" : null;
    if (!targetRole) {
      return res.status(400).json({ error: "Geçersiz rol ❌" });
    }

    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE role = $1 ORDER BY id DESC",
      [targetRole]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("PEERS ERROR:", err);
    res.status(500).json({ error: "Kullanıcı listesi hatası ❌" });
  }
});
module.exports = router;