import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./auth/Login";
import Signup from "./auth/signup";
import CVUpload from "./pages/jobseeker/CVUpload";
import JobSeekerDashboard from "./pages/jobseeker/Jobseeker Dashboard";
import Job from "./pages/jobseeker/Job";
import Application from "./pages/jobseeker/Application";
import Bookmark from "./pages/jobseeker/Bookmark";
import JobDescription from "./pages/jobseeker/JobDescription";
import Profile from "./pages/jobseeker/Profile";
import ChangePassword from "./pages/jobseeker/ChangePassword";
import RecruiterShell from "./pages/recruiter/RecruiterShell";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import ProtectedRoute from "./auth/ProtectedRoute";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/cv-upload",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <CVUpload />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobseeker",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <JobSeekerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/job",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <Job />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <Application />
      </ProtectedRoute>
    ),
  },
  {
    path: "/bookmark",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <Bookmark />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobdescription",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <JobDescription />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={["seeker"]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/changepassword",
    element: (
      <ProtectedRoute allowedRoles={["seeker", "recruiter"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/recruiter/*",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <RecruiterShell />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
