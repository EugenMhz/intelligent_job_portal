import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { MOCK_APPLICATIONS, MOCK_JOBS } from "./data/mockData";
import { api } from "./services/api";
import ApplicationsPage from "./pages/ApplicationsPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import JobDetailsPage from "./pages/JobDetailsPage";
import JobListingsPage from "./pages/JobListingsPage";
import LoginPage from "./pages/LoginPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import SignupPage from "./pages/SignupPage";
import UploadCVPage from "./pages/UploadCVPage";

const AUTH_STORAGE_KEYS = {
  token: "job_portal_auth_token",
  user: "job_portal_auth_user",
  dashboardVariant: "job_portal_dashboard_variant",
};

function readStoredJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadAuthSession() {
  if (typeof window === "undefined") {
    return { token: "", user: null, dashboardVariant: "" };
  }

  const token = window.localStorage.getItem(AUTH_STORAGE_KEYS.token) || "";
  const user = readStoredJson(window.localStorage.getItem(AUTH_STORAGE_KEYS.user));
  let dashboardVariant = window.localStorage.getItem(AUTH_STORAGE_KEYS.dashboardVariant) || "";

  if (token && !dashboardVariant) {
    dashboardVariant = Math.random() < 0.5 ? "overview" : "insights";
    window.localStorage.setItem(AUTH_STORAGE_KEYS.dashboardVariant, dashboardVariant);
  }

  return { token, user, dashboardVariant };
}

function persistAuthSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (session.token) {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, session.token);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user || null));
    window.localStorage.setItem(AUTH_STORAGE_KEYS.dashboardVariant, session.dashboardVariant || "overview");
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.dashboardVariant);
}

function RequireAuth({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [savedJobIds, setSavedJobIds] = useState(["job-2", "job-4"]);
  const [authSession, setAuthSession] = useState(loadAuthSession);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [jobsData, applicationsData, savedData] = await Promise.all([
          api.getJobs(),
          api.getApplications(),
          api.getSavedJobs(),
        ]);

        setJobs(jobsData.jobs || []);
        setApplications(applicationsData.applications || []);
        setSavedJobIds(savedData.savedJobIds || []);
      } catch (error) {
        console.error("Failed to connect to Flask API. Using local mock data.", error);
      }
    };

    loadInitialData();
  }, []);

  const handleLoginSuccess = (user, token) => {
    const dashboardVariant = Math.random() < 0.5 ? "overview" : "insights";
    const nextSession = { token, user, dashboardVariant };

    setAuthSession(nextSession);
    persistAuthSession(nextSession);
  };

  const handleSignupSuccess = () => {};

  const handleLogout = () => {
    const nextSession = { token: "", user: null, dashboardVariant: "" };

    setAuthSession(nextSession);
    persistAuthSession(nextSession);
  };

  const toggleSavedJob = async (jobId) => {
    try {
      if (savedJobIds.includes(jobId)) {
        const data = await api.unsaveJob(jobId);
        setSavedJobIds(data.savedJobIds || []);
      } else {
        const data = await api.saveJob(jobId);
        setSavedJobIds(data.savedJobIds || []);
      }
    } catch (error) {
      alert(error.message || "Failed to update saved jobs.");
    }
  };

  const handleApply = async (jobId) => {
    try {
      const data = await api.applyToJob(jobId);
      const application = data.application;
      if (application) {
        setApplications((prev) => [application, ...prev]);
      }
      alert(data.message || "Application submitted.");
    } catch (error) {
      alert(error.message || "Application failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar isAuthenticated={Boolean(authSession.token)} user={authSession.user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage jobs={jobs} savedJobIds={savedJobIds} onSaveToggle={toggleSavedJob} onApply={handleApply} />
          }
        />
        <Route
          path="/login"
          element={
            authSession.token ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/signup"
          element={authSession.token ? <Navigate to="/dashboard" replace /> : <SignupPage onSignupSuccess={handleSignupSuccess} />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth isAuthenticated={Boolean(authSession.token)}>
              <DashboardPage
                jobs={jobs}
                applications={applications}
                savedJobIds={savedJobIds}
                onSaveToggle={toggleSavedJob}
                onApply={handleApply}
                dashboardVariant={authSession.dashboardVariant || "overview"}
                user={authSession.user}
              />
            </RequireAuth>
          }
        />
        <Route path="/upload-cv" element={<UploadCVPage />} />
        <Route
          path="/jobs"
          element={
            <JobListingsPage
              jobs={jobs}
              savedJobIds={savedJobIds}
              onSaveToggle={toggleSavedJob}
              onApply={handleApply}
            />
          }
        />
        <Route
          path="/jobs/:jobId"
          element={
            <JobDetailsPage jobs={jobs} savedJobIds={savedJobIds} onSaveToggle={toggleSavedJob} onApply={handleApply} />
          }
        />
        <Route path="/applications" element={<ApplicationsPage applications={applications} jobs={jobs} />} />
        <Route
          path="/saved-jobs"
          element={
            <SavedJobsPage jobs={jobs} savedJobIds={savedJobIds} onSaveToggle={toggleSavedJob} onApply={handleApply} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
