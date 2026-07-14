import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Route guard component to enforce authentication and role-based access.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    // If no user session exists, redirect to login page
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (!user || !user.id || !user.role) {
      // Invalid user data, clear and redirect to login
      localStorage.removeItem("user");
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Role is not authorized. Redirect to appropriate dashboard based on actual role
      if (user.role === "seeker") {
        return <Navigate to="/jobseeker" replace />;
      } else if (user.role === "recruiter") {
        return <Navigate to="/recruiter/dashboard" replace />;
      } else {
        localStorage.removeItem("user");
        return <Navigate to="/" replace />;
      }
    }
  } catch (err) {
    console.error("Error reading protected route credentials:", err);
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoute;
