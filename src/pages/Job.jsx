import React, { useState } from "react";
import {
  Search,
  MapPin,
  Bookmark,
  ChevronDown,
  Sparkles,
  Check,
  Code2,
  Palette,
  Database,
} from "lucide-react";
import Navbar from "./Navbar";

const JOBS = [
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
    salary: "40k - 60k",
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
    salary: "20k - 45k",
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "Insight Analytics",
    location: "Austin, TX",
    icon: Database,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    skills: [
      { name: "Python", matched: true },
      { name: "SQL", matched: true },
      { name: "PyTorch", matched: false },
    ],
    match: 65,
    salary: "50k - 70k",
  },
];

const ROLE_TYPES = ["Engineering", "Design", "Marketing"];
const SKILL_OPTIONS = [
  { name: "React", active: true },
  { name: "TypeScript", active: true },
  { name: "Node.js", active: false },
  { name: "Python", active: false },
];

function MatchBar({ percent }) {
  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-violet-600">
          {percent}% Match
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

function JobCard({ job, bookmarked, onToggleBookmark }) {
  const Icon = job.icon;
  return (
    <div
      onClick={() => window.location.href = '/jobdescription'}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${job.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-6 h-6 ${job.iconColor}`} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {job.company} • {job.location}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevents the card click event
                onToggleBookmark(job.id);
              }}
              aria-label={bookmarked ? "Remove bookmark" : "Save job"}
              className="text-gray-300 hover:text-violet-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded z-10 relative"
            >
              <Bookmark
                className="w-5 h-5"
                fill={bookmarked ? "currentColor" : "none"}
                strokeWidth={1.75}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {job.skills.map((s) => (
              <span
                key={s.name}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.matched
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
            <MatchBar percent={job.match} />
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {job.salary}
              </span>
              <button
                onClick={(e) => e.stopPropagation()} // Prevents the card click event
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 whitespace-nowrap z-10 relative"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const JobBoard = () => {
  const [role, setRole] = useState("Engineering");
  const [minMatch, setMinMatch] = useState(50);
  const [skills, setSkills] = useState(SKILL_OPTIONS);
  const [bookmarks, setBookmarks] = useState(new Set());

  const toggleSkill = (name) =>
    setSkills((prev) =>
      prev.map((s) => (s.name === name ? { ...s, active: !s.active } : s)),
    );

  const toggleBookmark = (id) =>
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F6F5FA] flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-100 mb-8">
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <Search
                className="w-5 h-5 text-violet-500 shrink-0"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <MapPin
                className="w-5 h-5 text-violet-500 shrink-0"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="City, state, or remote"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="p-3 flex items-center">
              <button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2">
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => {
                      setRole("");
                      setMinMatch(0);
                      setSkills((prev) =>
                        prev.map((s) => ({ ...s, active: false })),
                      );
                    }}
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Role Type
                  </h3>
                  <div className="space-y-2.5">
                    {ROLE_TYPES.map((r) => (
                      <label
                        key={r}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <span
                          onClick={() => setRole(r)}
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${role === r
                              ? "bg-violet-600 border-violet-600"
                              : "border-gray-300"
                            }`}
                        >
                          {role === r && (
                            <Check
                              className="w-2.5 h-2.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {r}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Minimum Match %
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minMatch}
                    onChange={(e) => setMinMatch(Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => toggleSkill(s.name)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${s.active
                            ? "bg-violet-100 text-violet-700 border-violet-200"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Job listings */}
            <main>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-lg font-bold text-gray-900">
                  124 Jobs Found
                </h1>
                <button className="flex items-center gap-1.5 text-sm">
                  <span className="text-gray-500">Sort by:</span>
                  <span className="font-semibold text-violet-600">
                    Best Match
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-5">
                {JOBS.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    bookmarked={bookmarks.has(job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>

              <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-violet-200 text-violet-600 font-semibold text-sm hover:bg-violet-50/50 transition-colors">
                Load More Opportunities
              </button>
            </main>
          </div>
        </div>

        <footer className="bg-white border-t border-gray-100 mt-8">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
              <span>© 2024 Intelligent Job Portal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-700">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-700">
                Help Center
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JobBoard;