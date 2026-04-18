/**
 * Tüm veritabanı migration'larını sırayla uygular.
 * Kullanım: node scripts/run-migration.js
 */
const path = require("path");
const fs = require("fs");
const pool = require("../config/database");

const migrations = ["001_users_extra_columns.sql", "002_student_exams_docs_payments_notifications.sql", "003_advanced_features.sql", "004_e_exam_rubric_notifications.sql"];

async function run() {
  for (const name of migrations) {
    const migrationPath = path.join(__dirname, "..", "migrations", name);
    const sql = fs.readFileSync(migrationPath, "utf8");
    await pool.query(sql);
    console.log("Migration uygulandı:", name);
  }
  console.log("Tüm migration'lar tamamlandı.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration hatası:", err.message);
  process.exit(1);
});
