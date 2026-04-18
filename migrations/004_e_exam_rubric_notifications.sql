-- 1. E-Sınav (Test Çözme) Modülü
CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL, -- 'Trafik', 'Motor', 'İlkyardım', 'Trafik Adabı'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Örn: 100 üzerinden 80
  correct_count INT,
  wrong_count INT,
  blank_count INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Öğrenci Gelişim Formu (Eğitmen Rubriği)
CREATE TABLE IF NOT EXISTS lesson_evaluations (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES driving_lessons(id) ON DELETE CASCADE,
  instructor_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  steering_control INT CHECK (steering_control BETWEEN 1 AND 5), -- 1 ile 5 yıldız arası
  parallel_parking INT CHECK (parallel_parking BETWEEN 1 AND 5),
  slope_start INT CHECK (slope_start BETWEEN 1 AND 5),
  traffic_rules INT CHECK (traffic_rules BETWEEN 1 AND 5),
  general_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id) -- Bir ders için tek bir değerlendirme
);

-- 3. Kişiye Özel Bildirimler Merkezi
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT, -- 'ders_hatirlatici', 'odeme_vakti', 'belge_red', 'sistem' vb.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
