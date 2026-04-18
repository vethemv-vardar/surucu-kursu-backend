const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

let cachedContent = null;

function loadContent() {
  if (cachedContent) return cachedContent;
  const filePath = path.join(__dirname, "..", "content", "exam_prep_tr.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedContent = JSON.parse(raw);
  return cachedContent;
}

// Konu listesi
router.get("/topics", (req, res) => {
  try {
    const data = loadContent();
    res.json(
      data.topics.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        category: t.category,
      }))
    );
  } catch (err) {
    console.error("EXAM PREP TOPICS", err);
    res.status(500).json({ error: "Konular yüklenemedi ❌" });
  }
});

// Tek konu + sorular
router.get("/topics/:slug", (req, res) => {
  try {
    const data = loadContent();
    const topic = data.topics.find((t) => t.slug === req.params.slug);
    if (!topic) return res.status(404).json({ error: "Konu bulunamadı ❌" });
    res.json(topic);
  } catch (err) {
    console.error("EXAM PREP DETAIL", err);
    res.status(500).json({ error: "Konu yüklenemedi ❌" });
  }
});

module.exports = router;

