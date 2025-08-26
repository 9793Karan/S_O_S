import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";
import ProtectedRoute from "./utils/ProtectedRoute";
import { useAuth } from "./utils/AuthContext";

// pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ResponderDashboard from "./pages/ResponderDashboard";
import EmergencyResponseHomepage from "./pages/EmergencyResponseHomepage";

export default function App() {
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("auth/check-auth", { withCredentials: true });

        if (res.data.isAuthenticated) {
          const userRole = res.data.user.role;
          setRole(userRole);

          // Redirect user to their dashboard if currently on login or root
          if (
            (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register")
          ) {
            if (userRole === "admin") navigate("/admin");
            else if (userRole === "responder") navigate("/responder");
            else if (userRole === "user") navigate("/user");
          }
        } 
      } catch (err) {
        console.log("Auth check failed", err.response?.data || err.message);

        // Redirect only if not on public pages
        if (!["/", "/login", "/register"].includes(location.pathname)) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, setRole, location.pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<EmergencyResponseHomepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role={role} allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute role={role} allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/responder"
        element={
          <ProtectedRoute role={role} allowedRoles={["responder"]}>
            <ResponderDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
