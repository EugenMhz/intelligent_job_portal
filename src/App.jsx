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
    element: <CVUpload />,
  },
  {
    path: "/jobseeker",
    element: <JobSeekerDashboard />,
  },
  {
    path: "/job",
    element: <Job />,
  },
  {
    path: "/application",
    element: <Application />,
  },
  {
    path: "/bookmark",
    element: <Bookmark />,
  },
  {
    path: "/jobdescription",
    element: <JobDescription />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/changepassword",
    element: <ChangePassword />,
  },
  {
    path: "/recruiter/*",
    element: <RecruiterShell />,
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
