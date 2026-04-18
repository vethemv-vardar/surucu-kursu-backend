-- Öğrenci ek alanları (adres, kayıt tarihi, kurs durumu)
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS kurs_durumu TEXT DEFAULT 'aktif'; -- aktif, mezun, donduruldu, iptal

-- Derslere araç bilgisi (opsiyonel)
ALTER TABLE driving_lessons ADD COLUMN IF NOT EXISTS vehicle_info TEXT;

-- Sınav takip tablosu (yazılı + direksiyon)
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'yazili', 'direksiyon'
  exam_date DATE,
  exam_time TIME,
  location TEXT,
  result TEXT, -- 'gecti', 'kaldi', null (henüz yapılmadı)
  score INTEGER,
  notes TEXT,
  entry_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Öğrenci belgeleri (sağlık, sabıka, öğrenim, fotoğraf)
CREATE TABLE IF NOT EXISTS student_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'saglik_raporu', 'sabika_kaydi', 'ogrenim_belgesi', 'fotograf'
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, document_type)
);

-- Ödeme / muhasebe: öğrenci kurs ücreti ve taksit
CREATE TABLE IF NOT EXISTS student_fees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  installment_count INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Duyurular (toplu bildirim / genel duyuru)
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  target_role TEXT, -- 'student', 'instructor', 'all', null = all
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kurs iletişim bilgileri (tek satır ayarlar)
CREATE TABLE IF NOT EXISTS course_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO course_settings (key, value) VALUES
  ('phone', NULL),
  ('address', NULL),
  ('map_url', NULL),
  ('whatsapp', NULL)
ON CONFLICT (key) DO NOTHING;
