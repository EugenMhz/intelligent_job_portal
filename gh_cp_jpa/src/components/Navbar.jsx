import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../data/mockData";

export default function Navbar({ isAuthenticated, user, onLogout }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-slate-900 transition hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          JobPortal
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to || (link.to === "/dashboard" && location.pathname.startsWith("/dashboard"));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive ? "bg-teal-100 text-teal-800" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user?.name ? `Hi, ${user.name}` : user?.email ? user.email : "Signed in"}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
