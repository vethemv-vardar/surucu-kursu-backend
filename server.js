const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const pointRoutes = require("./routes/points");
const scheduleRoutes = require("./routes/schedules");
const examRoutes = require("./routes/exams");
const documentRoutes = require("./routes/documents");
const paymentRoutes = require("./routes/payments");
const announcementRoutes = require("./routes/announcements");
const courseSettingsRoutes = require("./routes/courseSettings");
const vehicleRoutes = require("./routes/vehicles");
const theoreticalRoutes = require("./routes/theoretical");
const examPrepRoutes = require("./routes/examPrep");
const auditLogRoutes = require("./routes/auditLogs");
const instructorPaymentRoutes = require("./routes/instructorPayments");
const eExamRoutes = require("./routes/eExams");
const evaluationRoutes = require("./routes/evaluations");
const notificationRoutes = require("./routes/notifications");
const ratingsRoutes = require("./routes/ratings");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/course-settings", courseSettingsRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/theoretical", theoreticalRoutes);
app.use("/api/exam-prep", examPrepRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/instructor-payments", instructorPaymentRoutes);
app.use("/api/e-exams", eExamRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingsRoutes);

app.get('/', (req, res) => {
  res.send('Sürücü Kursu API Çalışıyor 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

