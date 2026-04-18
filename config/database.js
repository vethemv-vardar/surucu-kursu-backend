//database.js
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: "localhost",
        user: "postgres",
        password: "12345",
        database: "surucu_kursu",
        port: 5432,
      }
);

pool.connect((err) => {
  if (err) {
    console.error("Database bağlantı hatası:", err);
  } else {
    console.log("PostgreSQL bağlandı ✅");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TÜM TABLOLAR SIRAYLA — Her biri ayrı .query() çağrısıyla,
// önce bağımlısız tablolar, sonra FK'lı tablolar.
// ─────────────────────────────────────────────────────────────────────────────

// 1) USERS — tüm FK'ların bağımlı olduğu ana tablo
pool
  .query(`
    CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      email          TEXT UNIQUE NOT NULL,
      password_hash  TEXT NOT NULL,
      role           TEXT NOT NULL DEFAULT 'student',
      full_name      TEXT,
      phone          TEXT,
      tc_kimlik_no   TEXT,
      ehliyet_sinifi TEXT,
      address        TEXT,
      registered_at  TIMESTAMPTZ DEFAULT now(),
      kurs_durumu    TEXT DEFAULT 'aktif'
    );
  `)
  .then(() => console.log("users tablosu hazır ✅"))
  .catch((e) => console.error("users CREATE error:", e.message));

// 2) FK gerektirmeyen bağımsız tablolar
pool
  .query(`
    CREATE TABLE IF NOT EXISTS lesson_slots (
      id               SERIAL PRIMARY KEY,
      start_time       TIME NOT NULL UNIQUE,
      duration_minutes INT NOT NULL DEFAULT 40
    );

    CREATE TABLE IF NOT EXISTS course_settings (
      id         SERIAL PRIMARY KEY,
      key        TEXT NOT NULL UNIQUE,
      value      TEXT,
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS exam_questions (
      id             SERIAL PRIMARY KEY,
      category       TEXT NOT NULL,
      question_text  TEXT NOT NULL,
      option_a       TEXT NOT NULL,
      option_b       TEXT NOT NULL,
      option_c       TEXT NOT NULL,
      option_d       TEXT NOT NULL,
      correct_option CHAR(1) NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS theoretical_lessons (
      id          SERIAL PRIMARY KEY,
      lesson_name TEXT NOT NULL,
      description TEXT,
      total_hours INT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id                  SERIAL PRIMARY KEY,
      plate_number        TEXT NOT NULL UNIQUE,
      vehicle_type        TEXT,
      brand_model         TEXT,
      inspection_end_date DATE,
      insurance_end_date  DATE,
      created_at          TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      body        TEXT,
      target_role TEXT,
      created_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS class_codes (
      id         SERIAL PRIMARY KEY,
      code       VARCHAR(20) UNIQUE NOT NULL,
      class_type VARCHAR(20) NOT NULL CHECK (class_type IN ('araba', 'motorsiklet')),
      valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
      valid_until TIMESTAMPTZ NOT NULL,
      is_active  BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `)
  .then(() => console.log("Bağımsız tablolar hazır ✅"))
  .catch((e) => console.error("Bağımsız tablolar error:", e.message));

// 3) users'a bağımlı tablolar
pool
  .query(`
    CREATE TABLE IF NOT EXISTS driving_lessons (
      id            SERIAL PRIMARY KEY,
      student_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      start_at      TIMESTAMPTZ NOT NULL,
      end_at        TIMESTAMPTZ NOT NULL,
      location      TEXT,
      notes         TEXT,
      status        TEXT NOT NULL DEFAULT 'scheduled',
      vehicle_info  TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS user_points (
      id           SERIAL PRIMARY KEY,
      from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      value        INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (from_user_id, to_user_id)
    );

    CREATE TABLE IF NOT EXISTS exams (
      id                 SERIAL PRIMARY KEY,
      user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exam_type          TEXT NOT NULL,
      exam_date          DATE,
      exam_time          TIME,
      location           TEXT,
      result             TEXT,
      score              INTEGER,
      notes              TEXT,
      entry_document_url TEXT,
      created_at         TIMESTAMPTZ DEFAULT now(),
      updated_at         TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS student_documents (
      id               SERIAL PRIMARY KEY,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document_type    TEXT NOT NULL,
      file_url         TEXT NOT NULL,
      status           TEXT DEFAULT 'beklemede',
      rejection_reason TEXT,
      uploaded_at      TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, document_type)
    );

    CREATE TABLE IF NOT EXISTS student_fees (
      id                SERIAL PRIMARY KEY,
      user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
      installment_count INT DEFAULT 1,
      notes             TEXT,
      created_at        TIMESTAMPTZ DEFAULT now(),
      updated_at        TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS payment_records (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount       DECIMAL(12,2) NOT NULL,
      payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
      description  TEXT,
      created_at   TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id          SERIAL PRIMARY KEY,
      admin_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action      TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id   INTEGER,
      details     JSONB,
      created_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS instructor_payments (
      id            SERIAL PRIMARY KEY,
      instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount        DECIMAL(12,2) NOT NULL,
      payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
      period_start  DATE,
      period_end    DATE,
      description   TEXT,
      created_at    TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS student_test_results (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score         INTEGER NOT NULL,
      correct_count INT,
      wrong_count   INT,
      blank_count   INT,
      created_at    TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS user_notifications (
      id                SERIAL PRIMARY KEY,
      user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title             TEXT NOT NULL,
      message           TEXT NOT NULL,
      notification_type TEXT,
      is_read           BOOLEAN DEFAULT FALSE,
      created_at        TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS instructor_codes (
      id            SERIAL PRIMARY KEY,
      instructor_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      code          VARCHAR(20) UNIQUE NOT NULL,
      class_type    VARCHAR(20) NOT NULL CHECK (class_type IN ('araba', 'motorsiklet')),
      created_at    TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS instructor_ratings (
      id            SERIAL PRIMARY KEY,
      device_id     VARCHAR(255) NOT NULL,
      instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      class_type    VARCHAR(20) NOT NULL,
      rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment       TEXT,
      created_at    TIMESTAMPTZ DEFAULT now(),
      UNIQUE(device_id, instructor_id)
    );
  `)
  .then(() => console.log("users bağımlı tablolar hazır ✅"))
  .catch((e) => console.error("Bağımlı tablolar error:", e.message));

// 4) driving_lessons'a bağımlı tablolar
pool
  .query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id                    SERIAL PRIMARY KEY,
      user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      theoretical_lesson_id INTEGER NOT NULL REFERENCES theoretical_lessons(id) ON DELETE CASCADE,
      attended_date         DATE NOT NULL,
      attended_hours        INT DEFAULT 1,
      created_at            TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lesson_evaluations (
      id               SERIAL PRIMARY KEY,
      lesson_id        INTEGER NOT NULL REFERENCES driving_lessons(id) ON DELETE CASCADE,
      instructor_id    INTEGER NOT NULL REFERENCES users(id),
      student_id       INTEGER NOT NULL REFERENCES users(id),
      steering_control INT CHECK (steering_control BETWEEN 1 AND 5),
      parallel_parking INT CHECK (parallel_parking BETWEEN 1 AND 5),
      slope_start      INT CHECK (slope_start BETWEEN 1 AND 5),
      traffic_rules    INT CHECK (traffic_rules BETWEEN 1 AND 5),
      general_notes    TEXT,
      created_at       TIMESTAMPTZ DEFAULT now(),
      UNIQUE(lesson_id)
    );
  `)
  .then(() => console.log("İkincil bağımlı tablolar hazır ✅"))
  .catch((e) => console.error("İkincil tablolar error:", e.message));

// 5) Seed veriler
pool
  .query(`
    INSERT INTO lesson_slots (start_time, duration_minutes)
    SELECT t.start_time, t.duration_minutes FROM (VALUES
      ('08:00'::time, 40), ('08:40'::time, 40), ('09:20'::time, 40), ('10:00'::time, 40),
      ('10:40'::time, 40), ('11:20'::time, 40), ('12:00'::time, 40), ('12:40'::time, 40),
      ('13:20'::time, 40), ('14:00'::time, 40), ('14:40'::time, 40), ('15:20'::time, 40),
      ('16:00'::time, 40), ('16:40'::time, 40), ('17:20'::time, 40)
    ) AS t(start_time, duration_minutes)
    WHERE (SELECT COUNT(*) FROM lesson_slots) = 0;

    INSERT INTO course_settings (key, value) VALUES
      ('phone', NULL), ('address', NULL), ('map_url', NULL), ('whatsapp', NULL)
    ON CONFLICT (key) DO NOTHING;
  `)
  .catch((e) => {
    if (!e.message.includes("duplicate")) console.error("Seed error:", e.message);
  });

// 6) Seed admin
async function ensureSeedAdmin() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@surucu-kursu.local";
    const plainPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.log(`Seed admin zaten var → email=${email} id=${existing.rows[0].id}`);
      return;
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'admin', 'Seed Admin') RETURNING id`,
      [email, passwordHash]
    );
    console.log(`Seed admin oluşturuldu ✅ email=${email} şifre=${plainPassword} id=${insertRes.rows[0].id}`);
  } catch (e) {
    console.error("Seed admin hatası:", e.message);
  }
}

// users tablosu oluştuktan sonra admin seed'ini çalıştır
setTimeout(ensureSeedAdmin, 1500);

module.exports = pool;
