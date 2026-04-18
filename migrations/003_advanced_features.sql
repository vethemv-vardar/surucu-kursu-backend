-- Araç filosu tablosu
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT, -- 'manuel', 'otomatik'
  brand_model TEXT,
  inspection_end_date DATE,
  insurance_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teorik dersler tanımı (örn. Trafik, Motor, İlkyardım)
CREATE TABLE IF NOT EXISTS theoretical_lessons (
  id SERIAL PRIMARY KEY,
  lesson_name TEXT NOT NULL,
  description TEXT,
  total_hours INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Yoklama tablosu (Hangi öğrenci, hangi teorik derse ne kadar katıldı)
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theoretical_lesson_id INTEGER NOT NULL REFERENCES theoretical_lessons(id) ON DELETE CASCADE,
  attended_date DATE NOT NULL,
  attended_hours INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Denetim (Audit) logları
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- Örn: 'PAYMENT_ADDED', 'DOCUMENT_APPROVED'
  entity_type TEXT NOT NULL, -- 'student_documents', 'payment_records' vb.
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Eğitmen hakediş/maaş ödemeleri
CREATE TABLE IF NOT EXISTS instructor_payments (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Belgeler için Onay/Ret (status) durumu ve Red Nedeni alanlarının eklenmesi
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'beklemede'; -- beklemede, onaylandi, reddedildi
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
