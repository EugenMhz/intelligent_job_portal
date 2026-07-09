import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./auth/Login";
import JobSeekerDashboard from "./auth/Jobseeker Dashboard";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/jobseeker",
    element: <JobSeekerDashboard />,
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
