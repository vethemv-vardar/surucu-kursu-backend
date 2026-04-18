-- Kullanıcı tablosuna ek alanlar (isim, telefon, TC, ehliyet sınıfı)
-- PostgreSQL 9.5+ için ADD COLUMN IF NOT EXISTS desteklenir.

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tc_kimlik_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ehliyet_sinifi TEXT;
