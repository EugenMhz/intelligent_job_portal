import React, { useState, useEffect } from "react";
import {
  Code,
  Palette,
  BarChart3,
  Cloud,
  Terminal,
  MoreVertical,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import Navbar from "./Navbar";

const STATUS_STYLES = {
  Applied: "bg-emerald-50 text-emerald-700",
  Shortlisted: "bg-amber-50 text-amber-700",
  Pending: "bg-blue-50 text-blue-700",
  Rejected: "bg-red-50 text-red-600",
  Withdrawn: "bg-gray-100 text-gray-500",
};

const STATUS_DOT = {
  Applied: "bg-emerald-500",
  Shortlisted: "bg-amber-500",
  Pending: "bg-blue-500",
  Rejected: "bg-red-500",
  Withdrawn: "bg-gray-400",
};

const getJobIconDetails = (department) => {
  const dept = (department || "").toLowerCase();
  if (dept.includes("engineering") || dept.includes("backend") || dept.includes("infrastructure") || dept.includes("devops")) {
    return { icon: Code, bg: "bg-violet-100", color: "text-violet-600" };
  }
  if (dept.includes("design") || dept.includes("ux") || dept.includes("ui")) {
    return { icon: Palette, bg: "bg-sky-100", color: "text-sky-600" };
  }
  if (dept.includes("cloud") || dept.includes("aws")) {
    return { icon: Cloud, bg: "bg-orange-100", color: "text-orange-500" };
  }
  if (dept.includes("data") || dept.includes("analytics")) {
    return { icon: BarChart3, bg: "bg-violet-100", color: "text-violet-600" };
  }
  return { icon: Terminal, bg: "bg-indigo-100", color: "text-indigo-600" };
};

function MethodBadge({ method }) {
  if (method === "Auto-Applied") {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
        Auto-Applied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-gray-600 border border-gray-200">
      Manual
    </span>
  );
}

function StatusBadge({ status }) {
  const displayStatus = status || "Applied";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[displayStatus] || STATUS_STYLES.Applied}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[displayStatus] || STATUS_DOT.Applied}`} />
      {displayStatus}
    </span>
  );
}

function ActionsMenu({ open, onToggle, onWithdraw, status }) {
  return (
    <div className="relative flex justify-end">
      <button
        onClick={onToggle}
        aria-label="Row actions"
        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        <MoreVertical className="w-4.5 h-4.5" strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 w-40 bg-white rounded-lg border border-gray-100 shadow-lg py-1.5 text-sm text-left">
          <button
            disabled={status === "Withdrawn"}
            onClick={() => {
              onToggle();
              onWithdraw();
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 ${status === "Withdrawn" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}

const Application = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const API = "http://localhost:5000";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;
  const totalItems = applications.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentApplications = applications.slice(startIndex, endIndex);

  const fetchApplications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/applications?seeker_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const handleWithdraw = async (appId) => {
    try {
      const res = await fetch(`${API}/api/applicants/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Withdrawn" }),
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== appId));
        showToast("Application Withdrawn Successfully");
      }
    } catch (err) {
      console.error("Withdraw error:", err);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div>
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="min-h-screen bg-[#F6F5FA] px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
                My Applications
              </h1>
              <p className="text-gray-500 mt-1.5 font-sans">
                Track and manage your recent job search activity
              </p>
            </div>
            {!loading && totalItems > 0 && (
              <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 shrink-0">
                <span className="text-sm text-gray-500 font-sans">Total Applications:</span>
                <span className="text-base font-bold text-violet-600 font-sans">{totalItems}</span>
              </div>
            )}
          </header>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <p className="text-sm font-semibold">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center text-slate-400 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
                <Briefcase className="w-7 h-7 text-violet-400" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 font-sans">No applications yet</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6 font-sans">
                You haven't submitted any job applications. Browse jobs and start applying!
              </p>
              <button
                onClick={() => window.location.href = "/job"}
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer font-sans"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4 font-sans">
                        COMPANY &amp; ROLE
                      </th>
                      <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4 font-sans">
                        DATE APPLIED
                      </th>
                      <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4 font-sans">
                        METHOD
                      </th>
                      <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4 font-sans">
                        STATUS
                      </th>
                      <th className="text-right text-xs font-bold text-gray-500 tracking-wide px-6 py-4 font-sans">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApplications.map((app, i) => {
                      const { icon: Icon, bg: iconBg, color: iconColor } = getJobIconDetails(app.department);
                      return (
                        <tr
                          key={app.id}
                          className={
                            i !== currentApplications.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                                <Icon
                                  className={`w-5 h-5 ${iconColor}`}
                                  strokeWidth={2}
                                />
                              </div>
                              <div>
                                <p
                                  onClick={() => window.location.href = `/jobdescription?id=${app.job_id}`}
                                  className="font-bold text-gray-900 text-[15px] hover:text-violet-600 transition-colors cursor-pointer font-sans"
                                >
                                  {app.title}
                                </p>
                                <p className="text-sm text-gray-500 font-sans">
                                  {app.department} • {app.location || "Remote"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap font-sans">
                            {formatDate(app.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <MethodBadge method={app.method} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-6 py-4">
                            <ActionsMenu
                              status={app.status}
                              open={openMenuId === app.id}
                              onToggle={() =>
                                setOpenMenuId(openMenuId === app.id ? null : app.id)
                              }
                              onWithdraw={() => handleWithdraw(app.id)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-wrap gap-4">
                  <span className="text-sm text-gray-500 font-sans">
                    Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-900">{totalItems}</span> applications
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 transition-colors focus:outline-none font-sans cursor-pointer ${activePage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100"
                          : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors focus:outline-none font-sans cursor-pointer ${activePage === pageNum
                            ? "bg-violet-600 text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 transition-colors focus:outline-none font-sans cursor-pointer ${activePage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100"
                          : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Application;
