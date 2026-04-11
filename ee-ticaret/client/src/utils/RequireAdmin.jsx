import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token || token === "null" || token === "undefined") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default RequireAdmin;