import React, { useState } from "react";
import {
  Bookmark,
  ChevronDown,
  Check,
  Code2,
  Palette,
  Database,
  Cloud,
  Terminal,
  BookmarkX,
} from "lucide-react";
import Navbar from "./Navbar";

const INITIAL_SAVED = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "GlobalTech Solutions",
    location: "Remote",
    icon: Code2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    skills: [
      { name: "React", matched: true },
      { name: "TypeScript", matched: true },
      { name: "Tailwind CSS", matched: false },
    ],
    match: 98,
    fit: "Excellent Fit",
    salary: "40k - 60k",
    savedLabel: "Saved 2 days ago",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "CloudNine Inc",
    location: "Kalimati, Kathmandu",
    icon: Palette,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    skills: [
      { name: "Figma", matched: true },
      { name: "Prototyping", matched: false },
      { name: "UI/UX", matched: false },
    ],
    match: 82,
    fit: "Good Fit",
    salary: "20k - 45k",
    savedLabel: "Saved 4 days ago",
  },
  {
    id: 3,
    title: "Cloud Architect",
    company: "SkyNet Systems",
    location: "On-site",
    icon: Cloud,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    skills: [
      { name: "AWS", matched: true },
      { name: "Terraform", matched: true },
      { name: "Kubernetes", matched: false },
    ],
    match: 74,
    fit: "Good Fit",
    salary: "50k - 70k",
    savedLabel: "Saved 6 days ago",
  },
  {
    id: 4,
    title: "Backend Lead",
    company: "ScaleUp",
    location: "Remote",
    icon: Terminal,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    skills: [
      { name: "Node.js", matched: true },
      { name: "PostgreSQL", matched: false },
      { name: "Docker", matched: false },
    ],
    match: 88,
    fit: "Excellent Fit",
    salary: "60k - 90k",
    savedLabel: "Saved 1 week ago",
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "Insight Analytics",
    location: "Naxal, Kathmandu",
    icon: Database,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    skills: [
      { name: "Python", matched: true },
      { name: "SQL", matched: true },
      { name: "PyTorch", matched: false },
    ],
    match: 65,
    fit: "Needs Review",
    salary: "80k - 100k",
    savedLabel: "Saved 1 week ago",
  },
];

const fitStyles = {
  "Excellent Fit": "text-emerald-600",
  "Good Fit": "text-violet-600",
  "Needs Review": "text-amber-600",
};

function MatchBar({ percent, fit }) {
  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-violet-600">
          {percent}% Match
        </span>
        <span
          className={`text-[11px] font-semibold tracking-wide uppercase ${fitStyles[fit]}`}
        >
          {fit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SavedJobCard({ job, onRemove }) {
  const Icon = job.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${job.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-6 h-6 ${job.iconColor}`} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {job.company} • {job.location}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                onClick={() => onRemove(job.id)}
                aria-label="Remove from saved jobs"
                className="text-violet-500 hover:text-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
              >
                <Bookmark
                  className="w-5 h-5"
                  fill="currentColor"
                  strokeWidth={1.75}
                />
              </button>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                {job.savedLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {job.skills.map((s) => (
              <span
                key={s.name}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  s.matched
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.matched && <Check className="w-3 h-3" strokeWidth={2.5} />}
                {s.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-5">
            <MatchBar percent={job.match} fit={job.fit} />
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {job.salary}
              </span>
              <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 whitespace-nowrap">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
        <BookmarkX className="w-7 h-7 text-violet-400" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1.5">
        No saved jobs yet
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Bookmark opportunities you like and they'll show up here so you can come
        back to them anytime.
      </p>
      <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
        Browse Jobs
      </button>
    </div>
  );
}

const SavedJobs = () => {
  const [jobs, setJobs] = useState(INITIAL_SAVED);
  const [sort, setSort] = useState("Recently Saved");

  const removeJob = (id) => setJobs((prev) => prev.filter((j) => j.id !== id));

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F6F5FA] px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Saved Jobs
              </h1>
              <p className="text-gray-500 mt-1.5">
                {jobs.length} opportunit{jobs.length === 1 ? "y" : "ies"} you've
                bookmarked for later
              </p>
            </div>
            {jobs.length > 0 && (
              <button className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-500">Sort by:</span>
                <span className="font-semibold text-violet-600">{sort}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </header>

          {jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {jobs.map((job) => (
                <SavedJobCard key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
