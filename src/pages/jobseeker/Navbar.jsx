import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, Search, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", path: "/jobseeker" },
  { name: "Jobs", path: "/job" },
  { name: "Applications", path: "/application" },
  { name: "Saved Jobs", path: "/bookmark" },
];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/jobseeker" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-sm shadow-violet-200 group-hover:opacity-90 transition-opacity">
            <Rocket
              className="w-5 h-5 text-white -rotate-45"
              strokeWidth={2.25}
              fill="white"
              fillOpacity={0.15}
            />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap group-hover:text-violet-600 transition-colors">
            Intelligent Job Portal
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-9">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm ${
                  isActive
                    ? "text-violet-600"
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
              placeholder="Search opportunities..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>

          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden ring-1 ring-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label="Profile menu"
          >
            <User className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
