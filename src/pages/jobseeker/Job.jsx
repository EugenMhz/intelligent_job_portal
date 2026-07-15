import React, { useState, useEffect } from "react";
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
  Cloud,
  Terminal,
  CheckCircle,
} from "lucide-react";
import Navbar from "./Navbar";

const getJobIconDetails = (department) => {
  const dept = (department || "").toLowerCase();
  if (dept.includes("engineering") || dept.includes("backend") || dept.includes("infrastructure") || dept.includes("devops")) {
    return { icon: Code2, bg: "bg-violet-100", color: "text-violet-600" };
  }
  if (dept.includes("design") || dept.includes("ux") || dept.includes("ui")) {
    return { icon: Palette, bg: "bg-sky-100", color: "text-sky-600" };
  }
  if (dept.includes("cloud") || dept.includes("aws")) {
    return { icon: Cloud, bg: "bg-orange-100", color: "text-orange-500" };
  }
  if (dept.includes("data") || dept.includes("analytics")) {
    return { icon: Database, bg: "bg-violet-100", color: "text-violet-600" };
  }
  return { icon: Terminal, bg: "bg-indigo-100", color: "text-indigo-600" };
};

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

function JobCard({ job, bookmarked, onToggleBookmark, applied, onApply }) {
  const { icon: Icon, bg: iconBg, color: iconColor } = getJobIconDetails(job.department);

  return (
    <div
      onClick={() => window.location.href = `/jobdescription?id=${job.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
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
              className={`${bookmarked ? "text-violet-500" : "text-gray-300"} hover:text-violet-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded z-10 relative`}
            >
              <Bookmark
                className="w-5 h-5"
                fill={bookmarked ? "currentColor" : "none"}
                strokeWidth={1.75}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {(job.skills || []).map((s) => (
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
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the card click event
                  if (!applied && onApply) {
                    onApply(job.id);
                  }
                }}
                disabled={applied}
                className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none whitespace-nowrap z-10 relative cursor-pointer ${applied
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-100"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
              >
                {applied ? "Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const JobBoard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const API = "http://localhost:5000";

  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [minMatch, setMinMatch] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("Best Match");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const fetchJobsData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [seekerRes, jobsRes, bookmarksRes, applicationsRes] = await Promise.all([
        fetch(`${API}/api/jobseekers/${userId}`),
        fetch(`${API}/api/jobs?seekerId=${userId}`),
        fetch(`${API}/api/bookmarks/${userId}`),
        fetch(`${API}/api/applications?seeker_id=${userId}`)
      ]);

      if (!seekerRes.ok || !jobsRes.ok || !bookmarksRes.ok) {
        throw new Error("Failed to fetch jobs page data");
      }

      const seekerData = await seekerRes.json();
      const jobsData = await jobsRes.json();
      const bookmarkedIds = await bookmarksRes.json();

      setBookmarks(new Set(bookmarkedIds));

      let appliedIds = new Set();
      if (applicationsRes.ok) {
        const appsData = await applicationsRes.json();
        appliedIds = new Set((appsData || []).map(app => app.job_id));
      }
      setAppliedJobIds(appliedIds);

      const seekerSkills = (seekerData.skills || []).map(s => s.toLowerCase());

      // Process and enrich jobs
      const enriched = jobsData.map(job => {
        const matchPercent = job.match_score !== undefined ? job.match_score : 75;

        const skillsList = (job.skills || []).map(skillName => ({
          name: skillName,
          matched: seekerSkills.includes(skillName.toLowerCase())
        }));

        return {
          ...job,
          match: matchPercent,
          skills: skillsList,
          company: job.department || "Creative Flow",
          location: job.location || "Remote"
        };
      });

      setAllJobs(enriched);
    } catch (err) {
      console.error("Failed to fetch jobs page details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, [userId]);

  // Handle Search and Filter logic
  useEffect(() => {
    let result = [...allJobs];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        job =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          (job.description && job.description.toLowerCase().includes(q))
      );
    }

    // Filter by Min Match %
    if (minMatch > 0) {
      result = result.filter(job => job.match >= minMatch);
    }

    // Apply Sorting
    if (sort === "Latest Posted") {
      result.sort((a, b) => new Date(b.posted_date || 0) - new Date(a.posted_date || 0));
    } else if (sort === "Best Match") {
      result.sort((a, b) => b.match - a.match);
    } else if (sort === "Name A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "Name Z-A") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredJobs(result);
  }, [allJobs, searchQuery, minMatch, sort]);

  const handleSort = (type) => {
    setShowSortDropdown(false);
    if (type === "latest-posted") {
      setSort("Latest Posted");
    } else if (type === "best-match") {
      setSort("Best Match");
    } else if (type === "name-az") {
      setSort("Name A-Z");
    } else if (type === "name-za") {
      setSort("Name Z-A");
    }
  };

  const toggleBookmark = async (id) => {
    const isBookmarked = bookmarks.has(id);
    try {
      const endpoint = `${API}/api/bookmarks`;
      const method = isBookmarked ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId: id }),
      });

      if (res.ok) {
        setBookmarks(prev => {
          const next = new Set(prev);
          if (isBookmarked) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
        showToast(isBookmarked ? "Removed from Saved Jobs" : "Saved to Bookmarks!");
      } else {
        showToast("Failed to update bookmark");
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      showToast("Error updating bookmark");
    }
  };

  const handleApply = async (id) => {
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seeker_id: userId, job_id: id }),
      });
      if (res.ok) {
        setAppliedJobIds(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        showToast("Application Submitted Successfully!");
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Apply job error:", err);
      showToast("Network error. Please try again.");
    }
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="min-h-screen bg-[#F6F5FA] flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-5 py-2.5 mb-8">
            <div className="flex items-center gap-3 flex-1">
              <Search
                className="w-5 h-5 text-violet-500 shrink-0"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-colors focus:outline-none cursor-pointer whitespace-nowrap">
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setMinMatch(0)}
                    className="text-sm font-medium text-violet-600 hover:text-violet-700 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Minimum Match %
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minMatch}
                    onChange={(e) => setMinMatch(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="text-center mt-3 text-sm font-bold text-violet-600 bg-violet-50 py-1.5 rounded-lg font-sans">
                    {minMatch}% or higher
                  </div>
                </div>
              </div>
            </aside>

            {/* Job listings */}
            <main>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-lg font-bold text-gray-900 font-sans">
                  {filteredJobs.length} Job{filteredJobs.length === 1 ? "" : "s"} Found
                </h1>

                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 text-sm cursor-pointer"
                  >
                    <span className="text-gray-500">Sort by:</span>
                    <span className="font-semibold text-violet-600">{sort}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showSortDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20 text-left">
                        <button
                          onClick={() => handleSort("latest-posted")}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Latest Posted" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                        >
                          Latest Posted
                        </button>
                        <button
                          onClick={() => handleSort("best-match")}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Best Match" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                        >
                          Best Match
                        </button>
                        <button
                          onClick={() => handleSort("name-az")}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Name A-Z" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                        >
                          Name A-Z
                        </button>
                        <button
                          onClick={() => handleSort("name-za")}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Name Z-A" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                        >
                          Name Z-A
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                  <p className="text-sm font-semibold">Loading job listings...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-sm font-semibold">No opportunities found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      bookmarked={bookmarks.has(job.id)}
                      onToggleBookmark={toggleBookmark}
                      applied={appliedJobIds.has(job.id)}
                      onApply={handleApply}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        <footer className="bg-white border-t border-gray-100 mt-8">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
              <span>© 2026 Intelligent Job Portal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700 font-sans">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-700 font-sans">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-700 font-sans">
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