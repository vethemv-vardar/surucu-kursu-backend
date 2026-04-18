//Dashboard.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Türkiye ehliyet sınıfları (resmi liste)
const EHLIYET_SINIFLARI = [
  { value: "", label: "Seçiniz" },
  { value: "M", label: "M - Moped (45 km/s altı)" },
  { value: "A1", label: "A1 - Motosiklet (125 cc)" },
  { value: "A2", label: "A2 - Motosiklet (35 kW)" },
  { value: "A", label: "A - Motosiklet" },
  { value: "B1", label: "B1 - Dört tekerlekli hafif" },
  { value: "B", label: "B - Otomobil" },
  { value: "BE", label: "BE - Otomobil + römork" },
  { value: "C1", label: "C1 - Kamyonet (3.5-7.5 t)" },
  { value: "C1E", label: "C1E - C1 + römork" },
  { value: "C", label: "C - Kamyon" },
  { value: "CE", label: "CE - Kamyon + römork" },
  { value: "D1", label: "D1 - Minibüs (16 yolcu)" },
  { value: "D1E", label: "D1E - D1 + römork" },
  { value: "D", label: "D - Otobüs" },
  { value: "DE", label: "DE - Otobüs + römork" },
  { value: "F", label: "F - Traktör" },
  { value: "G", label: "G - İş makinesi" },
];

export default function Dashboard({ mode = "dashboard" }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [userRoleTab, setUserRoleTab] = useState("all"); // all | student | instructor | admin
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false); // sol bar: Kullanıcılar tıklanınca açılan rol filtresi (sadece /users sayfasında)

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTc, setNewTc] = useState("");
  const [newEhliyet, setNewEhliyet] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newKursDurumu, setNewKursDurumu] = useState("aktif");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTc, setEditTc] = useState("");
  const [editEhliyet, setEditEhliyet] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editKursDurumu, setEditKursDurumu] = useState("aktif");
  const [editPassword, setEditPassword] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editRole, setEditRole] = useState("student");

  const [slots, setSlots] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonTotalPages, setLessonTotalPages] = useState(1);
  const [newLessonStudentId, setNewLessonStudentId] = useState("");
  const [newLessonInstructorId, setNewLessonInstructorId] = useState("");
  const [newLessonDate, setNewLessonDate] = useState("");
  const [newLessonSlotId, setNewLessonSlotId] = useState("");
  const [newLessonLocation, setNewLessonLocation] = useState("");
  const [newLessonNotes, setNewLessonNotes] = useState("");

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [editLessonStudentId, setEditLessonStudentId] = useState("");
  const [editLessonInstructorId, setEditLessonInstructorId] = useState("");
  const [editLessonDate, setEditLessonDate] = useState("");
  const [editLessonSlotId, setEditLessonSlotId] = useState("");
  const [editLessonLocation, setEditLessonLocation] = useState("");
  const [editLessonNotes, setEditLessonNotes] = useState("");
  const [editLessonStatus, setEditLessonStatus] = useState("scheduled");

  const [exams, setExams] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courseSettings, setCourseSettings] = useState({});
  const [fees, setFees] = useState([]);
  const [paymentUserId, setPaymentUserId] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [docUserId, setDocUserId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [newExamUserId, setNewExamUserId] = useState("");
  const [newExamType, setNewExamType] = useState("yazili");
  const [newExamDate, setNewExamDate] = useState("");
  const [newExamTime, setNewExamTime] = useState("");
  const [newExamLocation, setNewExamLocation] = useState("");
  const [newExamResult, setNewExamResult] = useState("");
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementBody, setNewAnnouncementBody] = useState("");
  const [newAnnouncementTarget, setNewAnnouncementTarget] = useState("all");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsMapUrl, setSettingsMapUrl] = useState("");
  const [settingsWhatsapp, setSettingsWhatsapp] = useState("");
  const [newPaymentUserId, setNewPaymentUserId] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [newPaymentDesc, setNewPaymentDesc] = useState("");
  const [newFeeUserId, setNewFeeUserId] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeInstallments, setNewFeeInstallments] = useState("1");

  useEffect(() => {
    if (!token) navigate("/");
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [userRoleTab, userPage]);
  useEffect(() => {
    fetchLessons();
  }, [lessonPage]);

  const fetchExams = async () => {
    try {
      const res = await api.get("/api/exams");
      setExams(res.data.exams || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/api/announcements/admin");
      setAnnouncements(res.data.announcements || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchCourseSettings = async () => {
    try {
      const res = await api.get("/api/course-settings");
      const list = res.data.settings || [];
      const obj = {};
      list.forEach((s) => { obj[s.key] = s.value; });
      setCourseSettings(obj);
      setSettingsPhone(obj.phone || "");
      setSettingsAddress(obj.address || "");
      setSettingsMapUrl(obj.map_url || "");
      setSettingsWhatsapp(obj.whatsapp || "");
    } catch (e) {
      console.error(e);
    }
  };
  const fetchFees = async () => {
    try {
      const res = await api.get("/api/payments");
      setFees(res.data.fees || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchPaymentsForUser = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/payments?userId=${userId}`);
      setSelectedFee(res.data.fee || null);
      setSelectedPayments(res.data.payments || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchDocumentsForUser = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/documents?userId=${userId}`);
      setDocuments(res.data.documents || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (mode === "exams") fetchExams();
  }, [mode]);
  useEffect(() => {
    if (mode === "announcements") fetchAnnouncements();
  }, [mode]);
  useEffect(() => {
    if (mode === "settings") fetchCourseSettings();
  }, [mode]);
  useEffect(() => {
    if (mode === "payments") fetchFees();
  }, [mode]);
  useEffect(() => {
    if (paymentUserId) fetchPaymentsForUser(paymentUserId);
    else { setSelectedFee(null); setSelectedPayments([]); }
  }, [paymentUserId]);
  useEffect(() => {
    if (docUserId) fetchDocumentsForUser(docUserId);
    else setDocuments([]);
  }, [docUserId]);

  useEffect(() => {
    const f = async () => {
      try {
        const res = await api.get("/api/admin/schedules/slots");
        setSlots(res.data.slots || []);
      } catch (e) {
        console.error(e);
      }
    };
    f();
  }, []);

  const fetchUsers = async () => {
    try {
      const isAll = userRoleTab === "all";
      const url = isAll
        ? `/api/admin/users?page=${userPage}&limit=10`
        : `/api/admin/users?role=${userRoleTab}&limit=500`;
      const res = await api.get(url);
      setUsers(res.data.users || []);
      setUserTotalPages(res.data.totalPages ?? 1);
      if (isAll && userPage > (res.data.totalPages || 1)) setUserPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/api/admin/schedules?page=${lessonPage}&limit=10`);
      setLessons(res.data.lessons);
      setLessonTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================== USER ADD ================== */
  const handleAddUser = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      alert("Geçerli email gir ❌");
      return;
    }

    if (!newName || !newName.trim()) {
      alert("İsim soyisim zorunludur ❌");
      return;
    }

    const phoneDigits = (newPhone || "").replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      alert("Telefon 10 rakam olmalı (baştaki 0 otomatik eklenir) ❌");
      return;
    }
    const tcDigits = (newTc || "").replace(/\D/g, "");
    if (tcDigits.length > 0 && tcDigits.length !== 11) {
      alert("TC Kimlik No 11 rakam olmalı ❌");
      return;
    }

    if (newPassword.length < 8) {
      alert("Şifre en az 8 karakter ❌");
      return;
    }

    const phoneToSend = phoneDigits.length === 10 ? "0" + phoneDigits : (newPhone.trim() || undefined);
    const tcToSend = tcDigits.length === 11 ? tcDigits : (newTc.trim() || undefined);

    try {
      await api.post("/api/admin/users", {
        email: newEmail,
        password: newPassword,
        role: newRole,
        full_name: newName.trim(),
        phone: phoneToSend,
        tc_kimlik_no: tcToSend,
        ehliyet_sinifi: newEhliyet || undefined,
        address: newAddress.trim() || undefined,
        kurs_durumu: newKursDurumu || undefined,
      });

      alert("Kullanıcı eklendi ✅");

      setNewEmail("");
      setNewName("");
      setNewPhone("");
      setNewTc("");
      setNewEhliyet("");
      setNewAddress("");
      setNewKursDurumu("aktif");
      setNewPassword("");
      setNewRole("student");
      setShowAddUserModal(false);

      fetchUsers();
      fetchStats();
    } catch {
      alert("Ekleme hatası ❌");
    }
  };

  /* ================== ROLE CHANGE ================== */
  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { role });
      fetchUsers();
      fetchStats();
    } catch {
      alert("Rol güncellenemedi ❌");
    }
  };

  /* ================== UPDATE USER ================== */
  const handleUpdateUser = async () => {
    const phoneDigits = (editPhone || "").replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      alert("Telefon 10 rakam olmalı (baştaki 0 otomatik eklenir) ❌");
      return;
    }
    const tcDigits = (editTc || "").replace(/\D/g, "");
    if (tcDigits.length > 0 && tcDigits.length !== 11) {
      alert("TC Kimlik No 11 rakam olmalı ❌");
      return;
    }
    const phoneToSend = phoneDigits.length === 10 ? "0" + phoneDigits : (editPhone?.trim() || undefined);
    const tcToSend = tcDigits.length === 11 ? tcDigits : (editTc?.trim() || undefined);

    try {
      const res = await api.put(`/api/admin/users/${editUser.id}`, {
        email: editEmail,
        full_name: editName || undefined,
        phone: phoneToSend,
        tc_kimlik_no: tcToSend,
        ehliyet_sinifi: (editEhliyet && editEhliyet.trim()) ? editEhliyet.trim() : null,
        address: editAddress?.trim() || null,
        kurs_durumu: editKursDurumu || null,
        password: editPassword || undefined,
        oldPassword: editOldPassword || undefined,
        role: editRole,
      });

      setIsModalOpen(false);
      setEditPassword("");
      setEditOldPassword("");
      if (res.data && res.data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editUser.id ? { ...u, ...res.data.user } : u))
        );
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Güncelleme hatası ❌");
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonStudentId || !newLessonInstructorId) {
      alert("Öğrenci ve eğitmen seç ❌");
      return;
    }
    if (!newLessonDate || !newLessonSlotId) {
      alert("Tarih ve saat slotu seç ❌");
      return;
    }
    try {
      await api.post("/api/admin/schedules", {
        studentId: Number(newLessonStudentId),
        instructorId: Number(newLessonInstructorId),
        date: newLessonDate,
        slotId: Number(newLessonSlotId),
        location: newLessonLocation,
        notes: newLessonNotes,
      });

      setNewLessonStudentId("");
      setNewLessonInstructorId("");
      setNewLessonDate("");
      setNewLessonSlotId("");
      setNewLessonLocation("");
      setNewLessonNotes("");
      fetchLessons();
    } catch (e) {
      alert(e?.response?.data?.error || "Program eklenemedi ❌");
    }
  };

  const handleDeleteLesson = async (id) => {
    try {
      await api.delete(`/api/admin/schedules/${id}`);
      fetchLessons();
    } catch {
      alert("Program silinemedi ❌");
    }
  };

  const openEditLesson = (l, slotsList) => {
    setEditLesson(l);
    setEditLessonStudentId(String(l.student_id));
    setEditLessonInstructorId(String(l.instructor_id));
    const startStr = (l.start_at || "").toString();
    const datePart = startStr.slice(0, 10);
    const timePart = startStr.slice(11, 16);
    setEditLessonDate(datePart);
    const matched = (slotsList || slots).find((s) => {
      const t = String(s.start_time).slice(0, 5);
      return t === timePart;
    });
    setEditLessonSlotId(matched ? String(matched.id) : "");
    setEditLessonLocation(l.location || "");
    setEditLessonNotes(l.notes || "");
    setEditLessonStatus(l.status || "scheduled");
    setIsLessonModalOpen(true);
  };

  const handleUpdateLesson = async () => {
    if (!editLesson) return;
    if (!editLessonStudentId || !editLessonInstructorId) {
      alert("Öğrenci ve eğitmen seç ❌");
      return;
    }
    if (!editLessonDate || !editLessonSlotId) {
      alert("Tarih ve saat slotu zorunlu ❌");
      return;
    }
    try {
      await api.put(`/api/admin/schedules/${editLesson.id}`, {
        studentId: Number(editLessonStudentId),
        instructorId: Number(editLessonInstructorId),
        date: editLessonDate,
        slotId: Number(editLessonSlotId),
        location: editLessonLocation,
        notes: editLessonNotes,
        status: editLessonStatus,
      });
      setIsLessonModalOpen(false);
      setEditLesson(null);
      fetchLessons();
      alert("Program güncellendi ✅");
    } catch (e) {
      alert(e?.response?.data?.error || "Program güncellenemedi ❌");
    }
  };

  /* ================== DELETE ================== */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
      fetchStats();
    } catch {
      alert("Silme hatası ❌");
    }
  };

  /* ================== INSTRUCTOR POINT ================== */
  // Admin puan vermez; sadece puanları görüntüler.

  /* ================== FILTER (arama + alfabetik sıralama; rol API'de sekmeyle geliyor) ================== */
  const filteredUsers = users
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const email = (u.email || "").toLowerCase();
      const name = (u.full_name || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      const tc = (u.tc_kimlik_no || "").toLowerCase();
      return email.includes(q) || name.includes(q) || phone.includes(q) || tc.includes(q);
    })
    .slice()
    .sort((a, b) => {
      const aName = (a.full_name || "").toLowerCase();
      const bName = (b.full_name || "").toLowerCase();
      if (aName !== bName) return aName.localeCompare(bName);
      return (a.email || "").toLowerCase().localeCompare((b.email || "").toLowerCase());
    });

  const chartData = stats
    ? [
        { name: "Admin", value: stats.adminCount },
        { name: "Instructor", value: stats.instructorCount || 0 },
        { name: "Student", value: stats.studentCount },
      ]
    : [];

  // Sıra: Admin, Instructor, Student — sayaçlarla aynı (kırmızı, cyan, yeşil)
  const COLORS = ["#ef4444", "#06b6d4", "#10b981"];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100">
      {/* SIDEBAR - giriş ile uyumlu koyu tema */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-xl">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xl font-bold shadow-lg mb-6">
            S
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sürücü Kursu</h2>
          <p className="text-slate-400 text-sm mb-8">Admin Panel</p>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  mode === "dashboard"
                    ? "bg-blue-500/20 text-cyan-200"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                Dashboard
              </button>
            </li>
            <li className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (mode === "users") {
                    setUsersMenuOpen((prev) => !prev);
                  } else {
                    navigate("/users");
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                  mode === "users"
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                Kullanıcılar
                {mode === "users" && (
                  <span className="text-slate-400 text-xs">
                    {usersMenuOpen ? "▼" : "▶"}
                  </span>
                )}
              </button>
              {mode === "users" && usersMenuOpen && (
                <div className="mt-1 flex flex-col gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => { setUserRoleTab("all"); setUserPage(1); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${userRoleTab === "all" ? "bg-slate-700 text-white" : "hover:bg-slate-800 text-slate-300"}`}
                  >
                    Tümü
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleTab("student")}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${userRoleTab === "student" ? "bg-emerald-600/80 text-white" : "hover:bg-slate-800 text-slate-300"}`}
                  >
                    Öğrenci
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleTab("instructor")}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${userRoleTab === "instructor" ? "bg-cyan-600/80 text-white" : "hover:bg-slate-800 text-slate-300"}`}
                  >
                    Eğitmen
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleTab("admin")}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${userRoleTab === "admin" ? "bg-red-600/80 text-white" : "hover:bg-slate-800 text-slate-300"}`}
                  >
                    Admin
                  </button>
                </div>
              )}
            </li>
            <li>
              <button type="button" onClick={() => navigate("/exams")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${mode === "exams" ? "bg-blue-500/20 text-cyan-200" : "hover:bg-slate-800 text-slate-300"}`}>
                Sınavlar
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate("/documents")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${mode === "documents" ? "bg-blue-500/20 text-cyan-200" : "hover:bg-slate-800 text-slate-300"}`}>
                Belgeler
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate("/payments")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${mode === "payments" ? "bg-blue-500/20 text-cyan-200" : "hover:bg-slate-800 text-slate-300"}`}>
                Ödemeler
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate("/announcements")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${mode === "announcements" ? "bg-blue-500/20 text-cyan-200" : "hover:bg-slate-800 text-slate-300"}`}>
                Duyurular
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate("/settings")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${mode === "settings" ? "bg-blue-500/20 text-cyan-200" : "hover:bg-slate-800 text-slate-300"}`}>
                İletişim Ayarları
              </button>
            </li>
            <li className="my-2 border-t border-slate-700/50"></li>
            <li>
              <button type="button" onClick={() => navigate("/vehicles")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${mode === "vehicles" ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-slate-800 text-slate-300"}`}>
                🚗 Araç Filosu
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate("/attendance")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${mode === "attendance" ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-slate-800 text-slate-300"}`}>
                📝 Teorik Yoklama
              </button>
            </li>
          </ul>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg transition"
        >
          Çıkış Yap
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* STATS - sadece ana dashboard modunda */}
        {mode === "dashboard" && stats && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard title="Toplam" value={stats.totalUsers} accent="blue" />
            <StatCard title="Admin" value={stats.adminCount} accent="red" />
            <StatCard title="Instructor" value={stats.instructorCount || 0} accent="cyan" />
            <StatCard title="Student" value={stats.studentCount} accent="green" />
          </div>
        )}

        {/* CHART - sadece ana dashboard modunda */}
        {mode === "dashboard" && stats && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        )}

        {mode === "users" && (
        <>
        {/* Kullanıcı listesi üstünde sadece "Yeni Kullanıcı" butonu */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md transition"
          >
            + Yeni Kullanıcı Ekle
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6 overflow-hidden">
          {/* Üst filtre barı: rol sekmeleri + arama */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
              {[
                { key: "all", label: "Tümü" },
                { key: "student", label: "Kursiyerler" },
                { key: "instructor", label: "Eğitmenler" },
                { key: "admin", label: "Admin" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setUserRoleTab(tab.key);
                    if (tab.key === "all") setUserPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition ${
                    userRoleTab === tab.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[420px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">ID</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Ehliyet</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">İsim</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Telefon</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">TC</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Email</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Adres</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Kurs</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Kayıt</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Rol</th>
                  <th className="sticky top-0 z-10 px-4 py-3 text-slate-700 font-semibold bg-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-600">{u.id}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{u.ehliyet_sinifi || "—"}</td>
                    <td className="px-4 py-3 text-slate-800">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{u.tc_kimlik_no || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-800">{u.email}</span>
                      {u.role === "instructor" && (
                        <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-lg">
                          ⭐ {(u.points_avg ?? 0).toFixed(2)} ({u.points_count ?? 0})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate" title={u.address}>{u.address || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{u.kurs_durumu || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{u.registered_at ? new Date(u.registered_at).toLocaleDateString("tr-TR") : "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value)
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm bg-white"
                      >
                        <option value="admin">Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setEditEmail(u.email ?? "");
                          setEditName(u.full_name ?? "");
                          setEditPhone(u.phone?.startsWith("0") && u.phone.length === 11 ? u.phone.slice(1) : (u.phone ?? ""));
                          setEditTc((u.tc_kimlik_no || "").replace(/\D/g, "").slice(0, 11));
                          setEditEhliyet(u.ehliyet_sinifi ?? "");
                          setEditAddress(u.address ?? "");
                          setEditKursDurumu(u.kurs_durumu ?? "aktif");
                          setEditPassword("");
                          setEditOldPassword("");
                          setEditRole(u.role ?? "student");
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userRoleTab === "all" && userTotalPages > 1 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[...Array(userTotalPages)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUserPage(i + 1)}
                  className={`min-w-[2.25rem] px-3 py-2 rounded-xl text-sm font-medium transition ${
                    userPage === i + 1
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

        </div>
        </>
        )}

        {/* LESSON SCHEDULES - sadece ana dashboard modunda */}
        {mode === "dashboard" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6 mt-8">
          <h3 className="mb-1 font-semibold text-slate-800">Direksiyon Programı</h3>
          <p className="text-sm text-slate-500 mb-4">Her ders 40 dakika. Öğrenci başına en fazla 8 ders. Tablodan tarih ve saat slotu seçin.</p>

          <div className="grid grid-cols-6 gap-3 mb-6">
            <select
              value={newLessonStudentId}
              onChange={(e) => setNewLessonStudentId(e.target.value)}
              className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Öğrenci seç</option>
              {users
                .filter((u) => u.role === "student")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email}{u.phone ? ` (${u.phone})` : ""}
                  </option>
                ))}
            </select>

            <select
              value={newLessonInstructorId}
              onChange={(e) => setNewLessonInstructorId(e.target.value)}
              className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Eğitmen seç</option>
              {users
                .filter((u) => u.role === "instructor")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email}{u.phone ? ` (${u.phone})` : ""}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={newLessonDate}
              onChange={(e) => setNewLessonDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <select
              value={newLessonSlotId}
              onChange={(e) => setNewLessonSlotId(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Saat (40 dk)</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {String(s.start_time).slice(0, 5)} (40 dk)
                </option>
              ))}
            </select>
            <input
              placeholder="Konum"
              value={newLessonLocation}
              onChange={(e) => setNewLessonLocation(e.target.value)}
              className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <input
              placeholder="Not"
              value={newLessonNotes}
              onChange={(e) => setNewLessonNotes(e.target.value)}
              className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <button
              onClick={handleAddLesson}
              className="col-span-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 shadow-lg transition"
            >
              Ders Ekle
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100">Öğrenci</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100">Eğitmen</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100">Başlangıç</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100">Bitiş (saat)</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100">Durum</th>
                  <th className="px-4 py-3 text-slate-700 font-semibold bg-slate-100 rounded-tr-lg">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-600 font-medium">#{l.id}</td>
                    <td className="px-4 py-3 text-slate-800">{l.student_email}</td>
                    <td className="px-4 py-3 text-slate-800 flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">E</span>
                       {l.instructor_email}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{String(l.start_at).replace("T", " ").slice(0, 16)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                        {String(l.end_at).slice(11, 16)} (40 dk)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === 'done' ? (
                        <span className="bg-emerald-100 text-emerald-700 font-medium px-2 py-1 rounded-full text-xs">Tamamlandı</span>
                      ) : l.status === 'cancelled' ? (
                        <span className="bg-red-100 text-red-700 font-medium px-2 py-1 rounded-full text-xs">İptal</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-full text-xs">Planlandı</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => openEditLesson(l, slots)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(l.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {[...Array(lessonTotalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setLessonPage(i + 1)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  lessonPage === i + 1
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Sınavlar */}
        {mode === "exams" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="mb-1 font-semibold text-slate-800">Sınav Takip</h3>
          <p className="text-sm text-slate-500 mb-4">Yazılı ve direksiyon sınav tarihleri, yer ve sonuçlarını kaydedin. Bu veriler mobil uygulamada öğrencinin &quot;Sınavlarım&quot; ekranında görünür.</p>
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-slate-700">
            <strong>Nerede görünür?</strong> Mobil uygulama → Öğrenci girişi → Sınavlarım ekranı (tarih, saat, yer, sonuç).
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Yeni sınav ekle</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Öğrenci</label>
              <select value={newExamUserId} onChange={(e) => setNewExamUserId(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white">
              <option value="">Öğrenci seç</option>
              {users.filter((u) => u.role === "student").map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Tip</label>
              <select value={newExamType} onChange={(e) => setNewExamType(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white">
              <option value="yazili">Yazılı</option>
              <option value="direksiyon">Direksiyon</option>
            </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Tarih</label>
              <input type="date" value={newExamDate} onChange={(e) => setNewExamDate(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Saat</label>
              <input type="time" value={newExamTime} onChange={(e) => setNewExamTime(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Yer (adres/salon)</label>
              <input placeholder="Örn. MEB sınav merkezi" value={newExamLocation} onChange={(e) => setNewExamLocation(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Sonuç (sınav sonrası)</label>
              <select value={newExamResult} onChange={(e) => setNewExamResult(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white">
              <option value="">—</option>
              <option value="gecti">Geçti</option>
              <option value="kaldi">Kaldı</option>
            </select>
            </div>
            <div className="flex items-end">
            <button onClick={async () => {
              if (!newExamUserId) { alert("Öğrenci seçin"); return; }
              try {
                await api.post("/api/exams", { userId: Number(newExamUserId), examType: newExamType, examDate: newExamDate || null, examTime: newExamTime || null, location: newExamLocation || null, result: newExamResult || null });
                setNewExamUserId(""); setNewExamDate(""); setNewExamTime(""); setNewExamLocation(""); setNewExamResult("");
                fetchExams();
              } catch (e) { alert(e?.response?.data?.error || "Eklenemedi"); }
            }} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium">Sınav Ekle</button>
            </div>
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-2 mt-4">Tüm sınavlar</h4>
          <div className="rounded-xl border border-slate-200 overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-100"><th className="px-4 py-2">Öğrenci</th><th className="px-4 py-2">Tip</th><th className="px-4 py-2">Tarih / Saat</th><th className="px-4 py-2">Yer</th><th className="px-4 py-2">Sonuç</th><th className="px-4 py-2">İşlem</th></tr></thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-4 py-2">{e.full_name || e.email}</td>
                    <td className="px-4 py-2">{e.exam_type}</td>
                    <td className="px-4 py-2">{e.exam_date ? new Date(e.exam_date).toLocaleDateString("tr-TR") : "—"} {e.exam_time ? String(e.exam_time).slice(0, 5) : ""}</td>
                    <td className="px-4 py-2">{e.location || "—"}</td>
                    <td className="px-4 py-2">
                      {e.result === "gecti" ? (
                        <span className="bg-emerald-100 text-emerald-700 font-medium px-2 py-1 rounded-full text-xs">Geçti</span>
                      ) : e.result === "kaldi" ? (
                        <span className="bg-red-100 text-red-700 font-medium px-2 py-1 rounded-full text-xs">Kaldı</span>
                      ) : e.result ? (
                         <span className="bg-orange-100 text-orange-700 font-medium px-2 py-1 rounded-full text-xs">{e.result}</span>
                      ) : (
                         "—"
                      )}
                    </td>
                    <td className="px-4 py-2"><button onClick={async () => { if (window.confirm("Silinsin mi?")) { await api.delete(`/api/exams/${e.id}`); fetchExams(); } }} className="text-red-600 text-sm">Sil</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Belgeler - öğrenci seçip belgelerini gör */}
        {mode === "documents" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="mb-1 font-semibold text-slate-800">Belge Takip</h3>
          <p className="text-sm text-slate-500 mb-4">Öğrencilerin yüklediği evrakları (kimlik, sağlık raporu vb.) görüntüleyin. Eksik belgeleri takip edebilirsiniz.</p>
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-slate-700">
            <strong>Nerede görünür?</strong> Mobil uygulama → Öğrenci girişi → Belgelerim / Evraklarım ekranı. Öğrenci kendi belgelerini ve eksik listesini görür.
          </div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Öğrenci seçin (belgelerini listelemek için)</label>
          <div className="mb-4">
            <select value={docUserId} onChange={(e) => setDocUserId(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white min-w-[200px]">
              <option value="">Öğrenci seç</option>
              {users.filter((u) => u.role === "student").map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
          </div>
          {docUserId && (
          <div className="rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-100"><th className="px-4 py-2">Belge tipi</th><th className="px-4 py-2">Yükleme</th><th className="px-4 py-2">Link</th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}><td className="px-4 py-2">{d.document_type}</td><td className="px-4 py-2">{d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString("tr-TR") : ""}</td><td className="px-4 py-2"><a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-600">Aç</a></td></tr>
                ))}
                {documents.length === 0 && <tr><td colSpan={3} className="px-4 py-4 text-slate-500">Henüz belge yok.</td></tr>}
              </tbody>
            </table>
          </div>
          )}
        </div>
        )}

        {/* Ödemeler */}
        {mode === "payments" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              💰
            </div>
            <h3 className="font-semibold text-xl text-slate-800">Ödeme & Muhasebe Merkezi</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6 ml-13">Öğrencilerin kurs ücretlerini, taksitlerini ve yaptıkları ödemeleri yönetin.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Sütun: Veri Girişi */}
            <div className="space-y-6">
              
              {/* Ücret Tanımlama Kartı */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-xs">📝</span>
                  Kur Ücreti Tanımla
                </h4>
                <div className="space-y-3">
                  <select value={newFeeUserId} onChange={(e) => setNewFeeUserId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white transition">
                    <option value="">Öğrenci Seçin</option>
                    {users.filter((u) => u.role === "student").map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                     <div className="flex-1">
                        <input type="number" placeholder="Toplam Ücret (TL)" value={newFeeAmount} onChange={(e) => setNewFeeAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                     </div>
                     <div className="w-32">
                        <input type="number" placeholder="Taksit" value={newFeeInstallments} onChange={(e) => setNewFeeInstallments(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                     </div>
                  </div>
                  <button onClick={async () => {
                    if (!newFeeUserId || !newFeeAmount) { alert("Öğrenci ve tutar girin"); return; }
                    try { await api.post("/api/payments/fee", { userId: Number(newFeeUserId), totalAmount: Number(newFeeAmount), installmentCount: Number(newFeeInstallments) || 1 }); setNewFeeUserId(""); setNewFeeAmount(""); setNewFeeInstallments("1"); fetchFees(); alert("Ücret kaydedildi"); } catch (e) { alert(e?.response?.data?.error || "Hata"); }
                  }} className="w-full px-4 py-3 shadow-lg shadow-blue-500/30 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold text-white transition-all transform active:scale-[0.98]">
                    Ücreti Kaydet
                  </button>
                </div>
              </div>

              {/* Ödeme Alma Kartı */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                 <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-xs">💸</span>
                  Tahsilat Yap (Ödeme Al)
                </h4>
                <div className="space-y-3">
                  <select value={newPaymentUserId} onChange={(e) => setNewPaymentUserId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white transition">
                    <option value="">Öğrenci Seçin</option>
                    {users.filter((u) => u.role === "student").map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                     <input type="number" placeholder="Tutar (TL)" value={newPaymentAmount} onChange={(e) => setNewPaymentAmount(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
                     <input type="date" value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
                  </div>
                  <input placeholder="Not/Açıklama (örn: Elden Peşinat)" value={newPaymentDesc} onChange={(e) => setNewPaymentDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
                  
                  <button onClick={async () => {
                    if (!newPaymentUserId || newPaymentAmount === "") { alert("Öğrenci ve tutar girin"); return; }
                    try { await api.post("/api/payments/record", { userId: Number(newPaymentUserId), amount: Number(newPaymentAmount), paymentDate: newPaymentDate, description: newPaymentDesc }); setNewPaymentUserId(""); setNewPaymentAmount(""); setNewPaymentDesc(""); setPaymentUserId(""); fetchFees(); if (paymentUserId) fetchPaymentsForUser(paymentUserId); alert("Ödeme kaydedildi"); } catch (e) { alert(e?.response?.data?.error || "Hata"); }
                  }} className="w-full px-4 py-3 shadow-lg shadow-emerald-500/30 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 font-semibold text-white transition-all transform active:scale-[0.98]">
                    Ödemeyi Tahsil Et
                  </button>
                </div>
              </div>

            </div>

            {/* Sağ Sütun: Öğrenci Borç Özeti */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
               {/* Decorative background circle */}
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
               
              <h4 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                 Öğrenci Hesap Özeti
              </h4>
              <select value={paymentUserId} onChange={(e) => setPaymentUserId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-6">
                <option value="">Öğrenciyi İncele...</option>
                {users.filter((u) => u.role === "student").map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                ))}
              </select>
              {selectedFee && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Toplam Kurs Ücreti</p>
                        <p className="text-2xl font-bold">{Number(selectedFee.total_amount).toLocaleString('tr-TR')} <span className="text-sm font-normal text-slate-400">TL</span></p>
                     </div>
                     <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                        <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Ödenen Tutar</p>
                        <p className="text-2xl font-bold text-emerald-400">{selectedPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString('tr-TR')} <span className="text-sm font-normal">TL</span></p>
                     </div>
                  </div>
                  
                  <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20 mt-2">
                     <div className="flex justify-between items-center">
                        <p className="text-red-400 font-medium">Kalan Borç Tutarı</p>
                        <p className="text-3xl font-black text-red-500">
                           {(Number(selectedFee.total_amount) - selectedPayments.reduce((s, p) => s + Number(p.amount), 0)).toLocaleString('tr-TR')} 
                           <span className="text-base font-normal"> TL</span>
                        </p>
                     </div>
                  </div>
                </>
              )}
              {paymentUserId && selectedPayments.length > 0 && (
                <div className="mt-8">
                  <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Ödeme Geçmişi</h5>
                  <div className="space-y-3">
                    {selectedPayments.map((p) => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                               <span className="text-emerald-500 text-xs">✓</span>
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-200">{new Date(p.payment_date).toLocaleDateString("tr-TR")}</p>
                               <p className="text-xs text-slate-400">{p.description || "Nakit Tahsilat"}</p>
                            </div>
                         </div>
                         <p className="text-emerald-400 font-semibold">+{Number(p.amount).toLocaleString('tr-TR')} TL</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
             <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-xs">📋</span>
               Tüm Kayıtlı Kurs Ücretleri
             </h4>
             <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                       <th className="px-4 py-3 font-semibold text-slate-600 text-sm">Öğrenci Adı</th>
                       <th className="px-4 py-3 font-semibold text-slate-600 text-sm text-right">Toplam Ücret</th>
                       <th className="px-4 py-3 font-semibold text-slate-600 text-sm text-center">Taksit Sayısı</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {fees.map((f) => (
                     <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-medium">{f.full_name || f.email}</td>
                        <td className="px-4 py-3 text-slate-700 font-bold text-right">{Number(f.total_amount).toLocaleString('tr-TR')} TL</td>
                        <td className="px-4 py-3 text-slate-500 text-center">
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">{f.installment_count} Taksit</span>
                        </td>
                     </tr>
                   ))}
                   {fees.length === 0 && (
                      <tr>
                         <td colSpan={3} className="px-4 py-8 text-center text-slate-500">Henüz ücret tanımı yapılmamış.</td>
                      </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
        )}

        {/* Duyurular */}
        {mode === "announcements" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="mb-1 font-semibold text-slate-800">Duyurular</h3>
          <p className="text-sm text-slate-500 mb-4">Kursiyer ve eğitmenlere duyuru yayınlayın. Hedef kitle seçerek sadece öğrencilere veya sadece eğitmenlere de gönderebilirsiniz.</p>
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-slate-700">
            <strong>Nerede yayınlanır?</strong> Mobil uygulama → Duyurular / Bildirimler ekranı. Giriş yapan kullanıcının rolüne göre filtrelenir: &quot;Tümü&quot; = herkes, &quot;Öğrenciler&quot; = sadece kursiyerler, &quot;Eğitmenler&quot; = sadece eğitmenler görür.
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Yeni duyuru ekle</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500">Başlık (zorunlu)</label>
              <input placeholder="Örn. Sınav tarihi duyurusu" value={newAnnouncementTitle} onChange={(e) => setNewAnnouncementTitle(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 flex-1 min-w-0" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500">İçerik</label>
              <textarea placeholder="Duyuru metni" value={newAnnouncementBody} onChange={(e) => setNewAnnouncementBody(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 flex-1 min-w-0" rows={2} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Hedef kitle (kimler görsün)</label>
              <select value={newAnnouncementTarget} onChange={(e) => setNewAnnouncementTarget(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white">
              <option value="all">Tümü (öğrenci + eğitmen)</option>
              <option value="student">Sadece öğrenciler</option>
              <option value="instructor">Sadece eğitmenler</option>
            </select>
            </div>
            <button onClick={async () => {
              if (!newAnnouncementTitle.trim()) { alert("Başlık girin"); return; }
              try { await api.post("/api/announcements", { title: newAnnouncementTitle.trim(), body: newAnnouncementBody.trim(), targetRole: newAnnouncementTarget }); setNewAnnouncementTitle(""); setNewAnnouncementBody(""); fetchAnnouncements(); alert("Duyuru eklendi"); } catch (e) { alert(e?.response?.data?.error || "Hata"); }
            }} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium">Duyuru Ekle</button>
          </div>
          <h4 className="text-sm font-medium text-slate-600 mb-2 mt-4">Yayındaki duyurular</h4>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="text-sm text-slate-600">{a.body || "—"}</p>
                  <p className="text-xs text-slate-400 mt-1">Hedef: {a.target_role || "all"} — {new Date(a.created_at).toLocaleString("tr-TR")}</p>
                </div>
                <button onClick={async () => { if (window.confirm("Silinsin mi?")) { await api.delete(`/api/announcements/${a.id}`); fetchAnnouncements(); } }} className="text-red-600 text-sm">Sil</button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* İletişim ayarları */}
        {mode === "settings" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="mb-1 font-semibold text-slate-800">İletişim Ayarları</h3>
          <p className="text-sm text-slate-500 mb-4">Kurs iletişim bilgilerini girin. Bu bilgiler mobil uygulamada ve (varsa) web sitesinde &quot;Bize Ulaşın&quot; / &quot;İletişim&quot; ekranında kullanılır.</p>
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-slate-700">
            <strong>Nerede kullanılır?</strong> Mobil uygulama → İletişim / Bize Ulaşın ekranı (telefon tıklanınca arama, WhatsApp tıklanınca mesaj, harita linki konum açar). Web sitesi iletişim sayfasında da gösterilebilir.
          </div>
          <div className="space-y-3 max-w-md">
            <label className="block text-sm font-medium text-slate-600">Telefon (kurs iletişim numarası)</label>
            <input value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Örn. 0xxx xxx xx xx" />
            <label className="block text-sm font-medium text-slate-600">Adres (kurs fiziksel adresi)</label>
            <input value={settingsAddress} onChange={(e) => setSettingsAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Tam adres" />
            <label className="block text-sm font-medium text-slate-600">Harita URL (Google Maps veya benzeri link)</label>
            <input value={settingsMapUrl} onChange={(e) => setSettingsMapUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="https://maps.google.com/..." />
            <label className="block text-sm font-medium text-slate-600">WhatsApp (numara veya wa.me linki)</label>
            <input value={settingsWhatsapp} onChange={(e) => setSettingsWhatsapp(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Örn. 905xxxxxxxxx veya wa.me/90..." />
            <button onClick={async () => {
              try { await api.put("/api/course-settings", { phone: settingsPhone, address: settingsAddress, mapUrl: settingsMapUrl, whatsapp: settingsWhatsapp }); alert("Kaydedildi"); fetchCourseSettings(); } catch (e) { alert(e?.response?.data?.error || "Hata"); }
            }} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium">Kaydet</button>
          </div>
        </div>
        )}
      </div>

      {/* Yeni Kullanıcı Modal - butonla açılır, yer kaplamaz */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddUserModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-800 mb-4">Yeni Kullanıcı</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="İsim soyisim *" value={newName} onChange={(e) => setNewName(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input placeholder="Telefon (10 rakam)" value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input placeholder="TC Kimlik No (11 rakam)" value={newTc} onChange={(e) => setNewTc(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" maxLength={11} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input placeholder="Email *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input type="password" placeholder="Şifre (min 8) *" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <select value={newEhliyet} onChange={(e) => setNewEhliyet(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
                {EHLIYET_SINIFLARI.map((s) => (
                  <option key={s.value || "empty"} value={s.value}>{s.label}</option>
                ))}
              </select>
              <input placeholder="Adres" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none sm:col-span-2" />
              <select value={newKursDurumu} onChange={(e) => setNewKursDurumu(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
                <option value="aktif">Aktif</option>
                <option value="mezun">Mezun</option>
                <option value="donduruldu">Donduruldu</option>
                <option value="iptal">İptal</option>
              </select>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                İptal
              </button>
              <button type="button" onClick={handleAddUser} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition">
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARAÇ FİLOSU (VEHICLES) */}
      {mode === "vehicles" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
            🚗 Araç Filosu Yönetimi
          </h3>
          <p className="text-slate-500 mb-6">
            Kursunuza ait araçların plaka, muayene ve sigorta tarihlerini buradan takip edebilirsiniz.
            <br/><span className="text-xs text-blue-500 font-bold">(Veritabanı bağlantısı kuruldu, Gelişmiş Filtreleme Modülü yakında aktifleşecek.)</span>
          </p>
          <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl mb-4">
            <h4 className="font-bold text-blue-800 mb-2">Örnek Kayıt Formu (Aktif)</h4>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Plaka (örn: 34 ABC 123)" className="px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
              <input placeholder="Vites Türü (Manuel/Otomatik)" className="px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
              <button className="bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700">Araç Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* TEORIK YOKLAMA (ATTENDANCE) */}
      {mode === "attendance" && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
            📝 Teorik Dersler ve Yoklama
          </h3>
          <p className="text-slate-500 mb-6">
            Öğrencilerin Trafik, İlkyardım ve Motor derslerindeki devamsızlık durumlarını buradan işleyebilirsiniz.
          </p>
          <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-emerald-800 font-medium">Bugünkü Teorik Derslere Ait Yoklama Girişi İçin Seçim Yapın:</span>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-emerald-200 rounded-lg outline-none bg-white min-w-[200px]">
                <option>1. Trafik ve Çevre Bilgisi</option>
                <option>2. İlkyardım</option>
                <option>3. Araç Tekniği (Motor)</option>
                <option>4. Trafik Adabı</option>
              </select>
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-700">Görüntüle</button>
            </div>
          </div>
        </div>
      )}

      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateUser}
        email={editEmail}
        setEmail={setEditEmail}
        name={editName}
        setName={setEditName}
        phone={editPhone}
        setPhone={setEditPhone}
        tc={editTc}
        setTc={setEditTc}
        ehliyet={editEhliyet}
        setEhliyet={setEditEhliyet}
        ehliyetSiniflari={EHLIYET_SINIFLARI}
        address={editAddress}
        setAddress={setEditAddress}
        kursDurumu={editKursDurumu}
        setKursDurumu={setEditKursDurumu}
        password={editPassword}
        setPassword={setEditPassword}
        oldPassword={editOldPassword}
        setOldPassword={setEditOldPassword}
        role={editRole}
        setRole={setEditRole}
      />

      <EditLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => { setIsLessonModalOpen(false); setEditLesson(null); }}
        onSave={handleUpdateLesson}
        users={users}
        slots={slots}
        studentId={editLessonStudentId}
        setStudentId={setEditLessonStudentId}
        instructorId={editLessonInstructorId}
        setInstructorId={setEditLessonInstructorId}
        date={editLessonDate}
        setDate={setEditLessonDate}
        slotId={editLessonSlotId}
        setSlotId={setEditLessonSlotId}
        location={editLessonLocation}
        setLocation={setEditLessonLocation}
        notes={editLessonNotes}
        setNotes={setEditLessonNotes}
        status={editLessonStatus}
        setStatus={setEditLessonStatus}
      />
    </div>
  );
}

{/* EDIT MODAL */}
function EditUserModal({
  isOpen,
  onClose,
  onSave,
  email,
  setEmail,
  name,
  setName,
  phone,
  setPhone,
  tc,
  setTc,
  ehliyet,
  setEhliyet,
  ehliyetSiniflari = [],
  address,
  setAddress,
  kursDurumu,
  setKursDurumu,
  password,
  setPassword,
  oldPassword,
  setOldPassword,
  role,
  setRole,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md">
        <h3 className="font-semibold text-slate-800 mb-4">Kullanıcı Düzenle</h3>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="İsim soyisim *"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="Telefon (0 otomatik, 10 rakam)"
            inputMode="numeric"
            maxLength={10}
          />
          <input
            value={tc}
            onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="TC Kimlik No (11 rakam)"
            inputMode="numeric"
            maxLength={11}
          />
          <label className="block text-sm font-medium text-slate-600">Ehliyet sınıfı</label>
          <select
            value={ehliyet}
            onChange={(e) => setEhliyet(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
          >
            {ehliyetSiniflari.map((s) => (
              <option key={s.value || "empty"} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition" placeholder="Adres" />
          <select value={kursDurumu} onChange={(e) => setKursDurumu(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
            <option value="aktif">Aktif</option>
            <option value="mezun">Mezun</option>
            <option value="donduruldu">Donduruldu</option>
            <option value="iptal">İptal</option>
          </select>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="Email"
          />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="Eski şifre (şifre değiştirirken zorunlu)"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="Yeni şifre (opsiyonel)"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition">
            İptal
          </button>
          <button onClick={onSave} className="px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg transition">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function EditLessonModal({
  isOpen,
  onClose,
  onSave,
  users,
  slots,
  studentId,
  setStudentId,
  instructorId,
  setInstructorId,
  date,
  setDate,
  slotId,
  setSlotId,
  location,
  setLocation,
  notes,
  setNotes,
  status,
  setStatus,
}) {
  if (!isOpen) return null;
  const students = users.filter((u) => u.role === "student");
  const instructors = users.filter((u) => u.role === "instructor");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-slate-800 text-lg mb-1">Program Düzenle</h3>
        <p className="text-sm text-slate-500 mb-4">Bitiş saati otomatik (başlangıç + 40 dk).</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Öğrenci</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Seçin</option>
              {students.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}{u.phone ? ` (${u.phone})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Eğitmen</label>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Seçin</option>
              {instructors.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}{u.phone ? ` (${u.phone})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Saat (40 dk)</label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="">Seçin</option>
              {(slots || []).map((s) => (
                <option key={s.id} value={s.id}>{String(s.start_time).slice(0, 5)} (40 dk)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Konum</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Konum"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Not</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Not"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              <option value="scheduled">Planlandı</option>
              <option value="done">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition">
            İptal
          </button>
          <button onClick={onSave} className="px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg transition">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

const ACCENT_BORDER = {
  blue: "border-l-blue-500",
  red: "border-l-red-500",
  cyan: "border-l-cyan-500",
  green: "border-l-emerald-500",
};

function StatCard({ title, value, accent = "blue" }) {
  return (
    <div className={`bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6 border-l-4 ${ACCENT_BORDER[accent] || ACCENT_BORDER.blue}`}>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h2 className="text-3xl font-bold text-slate-800 mt-1">{value}</h2>
    </div>
  );
}