import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard mode="dashboard" />} />
        <Route path="/users" element={<Dashboard mode="users" />} />
        <Route path="/exams" element={<Dashboard mode="exams" />} />
        <Route path="/documents" element={<Dashboard mode="documents" />} />
        <Route path="/payments" element={<Dashboard mode="payments" />} />
        <Route path="/announcements" element={<Dashboard mode="announcements" />} />
        <Route path="/settings" element={<Dashboard mode="settings" />} />
        <Route path="/vehicles" element={<Dashboard mode="vehicles" />} />
        <Route path="/attendance" element={<Dashboard mode="attendance" />} />
      </Routes>
    </Router>
  );
}

export default App;
