import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Rocket, LogOut, AlertTriangle } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/recruiter/dashboard" },
  { name: "Job Posting", path: "/recruiter/jobs" },
  { name: "Applicant Review", path: "/recruiter/applicants" },
];

const RecruiterNavbar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

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
    <>
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

          {/* Right side grouped items */}
          <div className="flex items-center gap-8 ml-auto">
            {/* Nav links */}
            <div className="hidden md:flex items-center gap-9">
              {NAV_ITEMS.map((item) => {
                const isActive = isTabActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm ${isActive
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

            {/* avatar */}
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to="/recruiter/profile"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 border border-violet-200 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-1 ring-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Recruiter Profile"
                title="View Recruiter Profile"
              >
                {userInitials}
              </Link>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center gap-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Log out?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to log out of your recruiter account?
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default RecruiterNavbar;
