import React, { useState, useEffect } from "react";
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

const formatSavedLabel = (savedAt) => {
  if (!savedAt) return "Saved recently";
  const date = new Date(savedAt);
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    return "Saved today";
  }
  if (diffDays === 2) {
    return "Saved yesterday";
  }
  return `Saved ${diffDays} days ago`;
};

function SavedJobCard({ job, onRemove, applied, onApply }) {
  const { icon: Icon, bg: iconBg, color: iconColor } = getJobIconDetails(job.department);
  
  return (
    <div
      onClick={() => (window.location.href = `/jobdescription?id=${job.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all group"
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
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents navigating to /jobdescription
                  onRemove(job.id);
                }}
                aria-label="Remove from saved jobs"
                className="text-violet-500 hover:text-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded relative z-10"
              >
                <Bookmark
                  className="w-5 h-5"
                  fill="currentColor"
                  strokeWidth={1.75}
                />
              </button>
              <span className="text-[11px] text-gray-400 whitespace-nowrap font-sans">
                {formatSavedLabel(job.saved_at)}
              </span>
            </div>
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
                  e.stopPropagation(); // Prevents navigating to /jobdescription
                  if (!applied && onApply) {
                    onApply(job.id);
                  }
                }}
                disabled={applied}
                className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none whitespace-nowrap relative z-10 cursor-pointer ${
                  applied 
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const API = "http://localhost:5000";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("Recently Saved");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const removeJob = async (id) => {
    try {
      const res = await fetch(`${API}/api/bookmarks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId: id }),
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    }
  };

  const handleSort = (type) => {
    setShowSortDropdown(false);
    if (type === "recently-saved") {
      setSort("Recently Saved");
      setJobs(prevJobs => [...prevJobs].sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at)));
    } else if (type === "recently-posted") {
      setSort("Recently Posted");
      setJobs(prevJobs => [...prevJobs].sort((a, b) => new Date(b.posted_date || 0) - new Date(a.posted_date || 0)));
    } else if (type === "name-az") {
      setSort("Name A-Z");
      setJobs(prevJobs => [...prevJobs].sort((a, b) => a.title.localeCompare(b.title)));
    } else if (type === "name-za") {
      setSort("Name Z-A");
      setJobs(prevJobs => [...prevJobs].sort((a, b) => b.title.localeCompare(a.title)));
    }
  };

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [seekerRes, bookmarksRes, applicationsRes] = await Promise.all([
          fetch(`${API}/api/jobseekers/${userId}`),
          fetch(`${API}/api/bookmarks/details/${userId}`),
          fetch(`${API}/api/applications?seeker_id=${userId}`)
        ]);

        if (!seekerRes.ok || !bookmarksRes.ok) {
          throw new Error("Failed to fetch bookmarks data");
        }

        const seekerData = await seekerRes.json();
        const bookmarksData = await bookmarksRes.json();
        
        let appliedIds = new Set();
        if (applicationsRes.ok) {
          const appsData = await applicationsRes.json();
          appliedIds = new Set((appsData || []).map(app => app.job_id));
        }
        setAppliedJobIds(appliedIds);

        const seekerSkills = (seekerData.skills || []).map(s => s.toLowerCase());

        // Process bookmarked jobs
        const enrichedBookmarks = bookmarksData.map(job => {
          const jobSkills = (job.skills || []).map(s => s.toLowerCase());
          
          let matchPercent = 0;
          if (jobSkills.length > 0) {
            const matches = jobSkills.filter(skill => seekerSkills.includes(skill));
            matchPercent = Math.round((matches.length / jobSkills.length) * 100);
          } else {
            matchPercent = 75; // Default match
          }

          // Map list of skills to the matched boolean structure expected by badge
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

        // Apply default sort (Recently Saved)
        enrichedBookmarks.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));

        setJobs(enrichedBookmarks);
      } catch (err) {
        console.error("Failed to fetch saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [userId]);

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
      }
    } catch (err) {
      console.error("Apply job error:", err);
    }
  };

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
                        onClick={() => handleSort("recently-saved")}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Recently Saved" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                      >
                        Recently Saved
                      </button>
                      <button
                        onClick={() => handleSort("recently-posted")}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sort === "Recently Posted" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                      >
                        Recently Posted
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
            )}
          </header>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <p className="text-sm font-semibold">Loading bookmarked jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {jobs.map((job) => (
                <SavedJobCard 
                  key={job.id} 
                  job={job} 
                  onRemove={removeJob} 
                  applied={appliedJobIds.has(job.id)}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;