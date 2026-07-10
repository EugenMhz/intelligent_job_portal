import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./auth/Login";
import JobSeekerDashboard from "./pages/Jobseeker Dashboard";
import Job from "./pages/Job";
import Application from "./pages/Application";
import Bookmark from "./pages/Bookmark";
import JobDescription from "./pages/JobDescription";
import Profile from "./pages/Profile";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
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
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
