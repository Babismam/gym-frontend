import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserRole } from "../services/authService";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token } = useContext(AuthContext);
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}