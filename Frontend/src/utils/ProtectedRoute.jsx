import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, allowedRoles }) {
  // if no role → not logged in → go to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // if role not allowed → redirect to home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
