import { useState, useEffect } from "react";
import Navbar from "./Navbar";

const CompanyIcon = ({ job }) => {
  const icons = {
    "Google Inc.": (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          fill="#e8eaed"
        />
        <path
          d="M17.6 12.2c0-.4-.03-.8-.1-1.2H12v2.3h3.1c-.1.8-.7 2-1.9 2.6l3 2.3c1.7-1.6 2.7-3.9 2.7-6.3z"
          fill="#7c3aed"
          opacity=".6"
        />
        <path
          d="M12 18c1.6 0 3-.5 4-1.4l-3-2.3c-.5.4-1.2.6-2 .6-1.5 0-2.8-1-3.3-2.4H5.6v2.4C6.8 16.8 9.2 18 12 18z"
          fill="#7c3aed"
          opacity=".4"
        />
      </svg>
    ),
    Airbnb: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path
          d="M12 2L7 7l5 5-5 5 5 5 5-5-5-5 5-5-5-5z"
          fill="#7c3aed"
          opacity=".5"
        />
      </svg>
    ),
    Amazon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#7c3aed" strokeWidth="1.5" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="#7c3aed"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    Microsoft: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <rect
          x="3"
          y="3"
          width="8"
          height="8"
          fill="#7c3aed"
          opacity=".5"
          rx="1"
        />
        <rect
          x="13"
          y="3"
          width="8"
          height="8"
          fill="#7c3aed"
          opacity=".5"
          rx="1"
        />
        <rect
          x="3"
          y="13"
          width="8"
          height="8"
          fill="#7c3aed"
          opacity=".5"
          rx="1"
        />
        <rect
          x="13"
          y="13"
          width="8"
          height="8"
          fill="#7c3aed"
          opacity=".5"
          rx="1"
        />
      </svg>
    ),
  };
  return (
    icons[job.company] || (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          stroke="#7c3aed"
          strokeWidth="1.5"
        />
      </svg>
    )
  );
};

const BookmarkIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill={filled ? "#7c3aed" : "none"}
    stroke={filled ? "#7c3aed" : "#9ca3af"}
    strokeWidth="1.8"
  >
    <path
      d="M5 3h14a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"
      strokeLinejoin="round"
    />
  </svg>
);

const JobCard = ({ job, onToggleBookmark, applied, onApply }) => {
  const [bookmarked, setBookmarked] = useState(job.bookmarked);

  useEffect(() => {
    setBookmarked(job.bookmarked);
  }, [job.bookmarked]);

  return (
    <div
      onClick={() => window.location.href = `/jobdescription?id=${job.id}`}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center font-bold text-purple-600 text-sm">
            {job.company ? job.company.slice(0, 2).toUpperCase() : "CF"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {job.title}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {job.company} • {job.location}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the card click event
            const next = !bookmarked;
            setBookmarked(next);
            if (onToggleBookmark) {
              onToggleBookmark(job.id, next);
            }
          }}
          className="mt-0.5 hover:scale-110 transition-transform relative z-10"
          aria-label="Bookmark job"
        >
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>

      {/* AI Match */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-purple-600 tracking-wide font-sans">
            AI MATCH
          </span>
          <span className="text-sm font-bold text-purple-600 font-sans">
            {job.match}%
          </span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-1.5">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${job.match}%` }}
          />
        </div>
      </div>

      {/* Apply Button only (No Salary) */}
      <div className="flex justify-end mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the card click event
            if (!applied && onApply) {
              onApply(job.id);
            }
          }}
          disabled={applied}
          className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200 relative z-10 cursor-pointer font-sans ${
            applied 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-100" 
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {applied ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
};

export default function JobSeekerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const API = "http://localhost:5000";

  const [allJobs, setAllJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("match-desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const handleSort = (type) => {
    setSortType(type);
    setShowSortDropdown(false);
    
    setAllJobs(prevJobs => {
      const sorted = [...prevJobs];
      if (type === "match-desc") {
        sorted.sort((a, b) => b.match - a.match);
      } else if (type === "match-asc") {
        sorted.sort((a, b) => a.match - b.match);
      } else if (type === "name-az") {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (type === "name-za") {
        sorted.sort((a, b) => b.title.localeCompare(a.title));
      }
      return sorted;
    });
  };

  const handleToggleBookmark = async (jobId, nextBookmarked) => {
    try {
      const endpoint = `${API}/api/bookmarks`;
      const method = nextBookmarked ? "POST" : "DELETE";
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update bookmark in database");
      }
      
      setAllJobs(prevJobs => 
        prevJobs.map(job => job.id === jobId ? { ...job, bookmarked: nextBookmarked } : job)
      );
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
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
          throw new Error("Failed to fetch jobs or bookmarks data");
        }

        const seekerData = await seekerRes.json();
        const jobsData = await jobsRes.json();
        const bookmarkedIds = await bookmarksRes.json();
        
        let appliedIds = new Set();
        if (applicationsRes.ok) {
          const appsData = await applicationsRes.json();
          appliedIds = new Set((appsData || []).map(app => app.job_id));
        }
        setAppliedJobIds(appliedIds);

        // Process jobs and use backend-calculated semantic match score
        const enrichedJobs = jobsData.map(job => {
          const matchPercent = job.match_score !== undefined ? job.match_score : 75;

          return {
            ...job,
            match: matchPercent,
            company: job.department || "Creative Flow",
            location: job.location || "Remote",
            bookmarked: bookmarkedIds.includes(job.id)
          };
        });

        // Apply initial sorting
        if (sortType === "match-desc") {
          enrichedJobs.sort((a, b) => b.match - a.match);
        } else if (sortType === "match-asc") {
          enrichedJobs.sort((a, b) => a.match - b.match);
        } else if (sortType === "name-az") {
          enrichedJobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortType === "name-za") {
          enrichedJobs.sort((a, b) => b.title.localeCompare(a.title));
        }

        setAllJobs(enrichedJobs);
      } catch (err) {
        console.error("Failed to fetch jobs or bookmarks data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, [userId]);

  const handleApply = async (jobId) => {
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seeker_id: userId, job_id: jobId }),
      });
      if (res.ok) {
        setAppliedJobIds(prev => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
      }
    } catch (err) {
      console.error("Application submission failed:", err);
    }
  };

  return (
    <div>
      {" "}
      <div>
        {" "}
        <Navbar />{" "}
      </div>
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Outer wrapper */}
        <div className="max-w-6xl mx-auto bg-gray-100 min-h-screen">
          {/* Small label */}
          <p className="text-xs text-gray-500 pt-4 px-6 mb-2">
            Job Seeker Dashboard
          </p>

          {/* Main card */}
          <div className="bg-white mx-0 rounded-2xl shadow-sm overflow-hidden">
            {/* Navbar */}

            {/* Main content */}
            <div className="px-8 py-8">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recommended Jobs
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Based on your skills and preference
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 6l9 6 9-6M3 12l9 6 9-6"
                          strokeLinecap="round"
                        />
                      </svg>
                      Sort: {
                        sortType === "match-desc" ? "Match % (High)" :
                        sortType === "match-asc" ? "Match % (Low)" :
                        sortType === "name-az" ? "Name A-Z" :
                        sortType === "name-za" ? "Name Z-A" : "Default"
                      }
                    </button>

                    {showSortDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20 text-left">
                          <button
                            onClick={() => handleSort("match-desc")}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sortType === "match-desc" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                          >
                            Match % (Highest First)
                          </button>
                          <button
                            onClick={() => handleSort("match-asc")}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sortType === "match-asc" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                          >
                            Match % (Lowest First)
                          </button>
                          <button
                            onClick={() => handleSort("name-az")}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sortType === "name-az" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                          >
                            Name A-Z
                          </button>
                          <button
                            onClick={() => handleSort("name-za")}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${sortType === "name-za" ? "text-violet-600 bg-violet-50/50" : "text-gray-700"}`}
                          >
                            Name Z-A
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Job grid */}
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3 w-full">
                  <div className="w-8 h-8 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                  <p className="text-sm font-semibold">Finding the best matches...</p>
                </div>
              ) : allJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium w-full">
                  No recommended jobs found. Try adding more skills to your profile!
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {allJobs.slice(0, visibleCount).map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onToggleBookmark={handleToggleBookmark} 
                        applied={appliedJobIds.has(job.id)}
                        onApply={handleApply}
                      />
                    ))}
                  </div>

                  {visibleCount < allJobs.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-full shadow-sm shadow-violet-100 hover:shadow transition-all duration-200 cursor-pointer"
                      >
                        Load More Jobs
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 px-8 py-5 mt-4">
              <div className="flex justify-end gap-6">
                {["Help Center", "Terms of Service", "Privacy Policy"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {link}
                    </a>
                  ),
                )}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}