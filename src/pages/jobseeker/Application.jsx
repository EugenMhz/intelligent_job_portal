import React, { useState } from "react";
import {
  Code,
  Palette,
  BarChart3,
  Cloud,
  Terminal,
  MoreVertical,
} from "lucide-react";
import Navbar from "./Navbar";

const APPLICATIONS = [
  {
    id: 1,
    title: "Senior React Engineer",
    company: "TechCorp Solutions",
    location: "Remote",
    date: "Oct 24, 2023",
    method: "Manual",
    status: "Applied",
    icon: Code,
    iconColor: "text-gray-700",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Creatively Studio",
    location: "Hybrid",
    date: "Oct 22, 2023",
    method: "Auto-Applied",
    status: "Shortlisted",
    icon: Palette,
    iconColor: "text-violet-600",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "DataWise Insights",
    location: "Remote",
    date: "Oct 20, 2023",
    method: "Manual",
    status: "Pending",
    icon: BarChart3,
    iconColor: "text-blue-600",
  },
  {
    id: 4,
    title: "Cloud Architect",
    company: "SkyNet Systems",
    location: "On-site",
    date: "Oct 18, 2023",
    method: "Manual",
    status: "Rejected",
    icon: Cloud,
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    title: "Backend Lead",
    company: "ScaleUp",
    location: "Remote",
    date: "Oct 15, 2023",
    method: "Auto-Applied",
    status: "Applied",
    icon: Terminal,
    iconColor: "text-indigo-600",
  },
];

const STATUS_STYLES = {
  Applied: "bg-emerald-50 text-emerald-700",
  Shortlisted: "bg-amber-50 text-amber-700",
  Pending: "bg-blue-50 text-blue-700",
  Rejected: "bg-red-50 text-red-600",
};

const STATUS_DOT = {
  Applied: "bg-emerald-500",
  Shortlisted: "bg-amber-500",
  Pending: "bg-blue-500",
  Rejected: "bg-red-500",
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
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

function ActionsMenu({ open, onToggle }) {
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
        <div className="absolute right-0 top-9 z-10 w-40 bg-white rounded-lg border border-gray-100 shadow-lg py-1.5 text-sm">
          <button className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-50">
            View details
          </button>
          <button className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-50">
            Withdraw
          </button>
          <button className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

const Application = () => {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F6F5FA] px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Applications
            </h1>
            <p className="text-gray-500 mt-1.5">
              Track and manage your recent job search activity
            </p>
          </header>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4">
                    COMPANY &amp; ROLE
                  </th>
                  <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4">
                    DATE APPLIED
                  </th>
                  <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4">
                    METHOD
                  </th>
                  <th className="text-left text-xs font-bold text-gray-500 tracking-wide px-6 py-4">
                    STATUS
                  </th>
                  <th className="text-right text-xs font-bold text-gray-500 tracking-wide px-6 py-4">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {APPLICATIONS.map((app, i) => {
                  const Icon = app.icon;
                  return (
                    <tr
                      key={app.id}
                      className={
                        i !== APPLICATIONS.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Icon
                              className={`w-5 h-5 ${app.iconColor}`}
                              strokeWidth={2}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-[15px]">
                              {app.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {app.company} • {app.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {app.date}
                      </td>
                      <td className="px-6 py-4">
                        <MethodBadge method={app.method} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4">
                        <ActionsMenu
                          open={openMenuId === app.id}
                          onToggle={() =>
                            setOpenMenuId(openMenuId === app.id ? null : app.id)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing 5 of 42 applications
              </p>
              <div className="flex items-center gap-2">
                <button className="text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button className="text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Application;
