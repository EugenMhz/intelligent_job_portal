import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, Search } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/recruiter/dashboard" },
  { name: "Job Posting", path: "/recruiter/jobs" },
  { name: "Applicant Review", path: "/recruiter/applicants" },
];

const RecruiterNavbar = ({ user }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Function to check if a tab is active (supporting both /recruiter and /recruiter/dashboard as Dashboard)
  const isTabActive = (itemPath) => {
    if (itemPath === "/recruiter/dashboard") {
      return currentPath === "/recruiter" || currentPath === "/recruiter/dashboard";
    }
    return currentPath === itemPath;
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "JD";

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/recruiter/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-sm shadow-violet-200 group-hover:opacity-90 transition-opacity">
            <Rocket
              className="w-5 h-5 text-white -rotate-45"
              strokeWidth={2.25}
              fill="white"
              fillOpacity={0.15}
            />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap group-hover:text-violet-600 transition-colors">
            Intelligent Portal
          </span>
          <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Recruiter
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-9">
          {NAV_ITEMS.map((item) => {
            const isActive = isTabActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm ${
                  isActive
                    ? "text-violet-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Search + avatar */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-violet-50/70 rounded-xl px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-violet-300">
            <Search
              className="w-4 h-4 text-gray-400 shrink-0"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search candidates..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>

          <Link
            to="/recruiter/profile"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 border border-violet-200 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-1 ring-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Recruiter Profile"
            title="View Recruiter Profile"
          >
            {userInitials}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default RecruiterNavbar;
