
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  const permittedRoles = allowedRoles.map((r) =>
    r.toLowerCase()
  );

  if (!permittedRoles.includes(role)) {
    // return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
