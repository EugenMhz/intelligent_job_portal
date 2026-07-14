import React, { useState, useEffect } from "react";
import {
  Send,
  Bookmark,
  MapPin,
  Clock,
  Users,
  BarChart3,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Mail,
  User,
} from "lucide-react";
import Navbar from "./Navbar";

const JobDescription = () => {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const API = "http://localhost:5000";

  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(75);
  const [skills, setSkills] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId || !userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [seekerRes, jobRes, bookmarksRes, applicationsRes] = await Promise.all([
          fetch(`${API}/api/jobseekers/${userId}`),
          fetch(`${API}/api/jobs/${jobId}?seekerId=${userId}`),
          fetch(`${API}/api/bookmarks/${userId}`),
          fetch(`${API}/api/applications?seeker_id=${userId}`)
        ]);

        if (!seekerRes.ok || !jobRes.ok || !bookmarksRes.ok) {
          throw new Error("Failed to fetch job details data");
        }

        const seekerData = await seekerRes.json();
        const jobData = await jobRes.json();
        const bookmarkedIds = await bookmarksRes.json();

        // Check if bookmarked
        setBookmarked(bookmarkedIds.includes(Number(jobId)));

        // Check if applied
        if (applicationsRes.ok) {
          const apps = await applicationsRes.json();
          const hasApplied = apps.some(app => app.job_id === Number(jobId));
          setApplied(hasApplied);
        }

        // Calculate matching details
        const seekerSkills = (seekerData.skills || []).map(s => s.toLowerCase());

        const matchPercent = jobData.match_score !== undefined ? jobData.match_score : 75;

        const skillsList = (jobData.skills || []).map(skillName => ({
          name: skillName,
          matched: seekerSkills.includes(skillName.toLowerCase())
        }));

        setJob(jobData);
        setMatch(matchPercent);
        setSkills(skillsList);
      } catch (err) {
        console.error("Error fetching job details page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, userId]);

  const toggleBookmark = async () => {
    if (!jobId || !userId) return;
    try {
      const endpoint = `${API}/api/bookmarks`;
      const method = bookmarked ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId: Number(jobId) }),
      });

      if (res.ok) {
        setBookmarked(!bookmarked);
        showToast(bookmarked ? "🗑️ Removed from Saved Jobs" : "⭐ Saved to Bookmarks!");
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleApply = async () => {
    if (applied) return;
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seeker_id: userId, job_id: Number(jobId) }),
      });

      if (res.ok) {
        setApplied(true);
        showToast("Application Submitted Successfully!");
      } else {
        const errorData = await res.json();
        showToast(`${errorData.error || "Failed to submit application"}`);
      }
    } catch (err) {
      console.error("Application submission failed:", err);
      showToast("Network error. Please try again.");
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <p className="text-sm font-semibold">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm font-semibold">Opportunity details could not be found.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <span className="cursor-pointer hover:text-violet-600 font-sans" onClick={() => window.location.href = '/jobseeker'}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-violet-600 font-sans" onClick={() => window.location.href = '/job'}>Jobs</span>
            <span>/</span>
            <span className="text-slate-700 font-medium font-sans">
              {job.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 font-sans">
                    {job.title}
                  </h1>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-sans">
                    {job.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>
                <p className="text-violet-600 font-semibold mb-3 font-sans">{job.company || job.department || "Creative Flow"}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-sans">
                    <MapPin size={14} className="text-gray-400" />
                    {job.location || "Remote"}
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <Clock size={14} className="text-gray-400" />
                    {job.posted_date || "Recently posted"}
                  </span>
                </div>
              </div>

              {/* Skills card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-violet-600" />
                    <h2 className="font-semibold text-slate-900 font-sans">Required Skills</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full"
                        style={{ width: `${match}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-violet-600 font-sans">
                      {match}% Match
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <span className="text-sm text-gray-500 font-sans">No specific skills listed.</span>
                  ) : (
                    skills.map((s) => (
                      <span
                        key={s.name}
                        className={`text-sm font-semibold px-3.5 py-1.5 rounded-full font-sans ${s.matched
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                          : "text-gray-600 bg-gray-100 border border-gray-200"
                          }`}
                      >
                        {s.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Job description card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3 font-sans">
                  Job Description
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                  {job.description || "No description provided."}
                </p>
              </div>

              {/* Recruiter Details Card */}
              {job.recruiter_name && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-violet-600" />
                    <h2 className="text-lg font-bold text-slate-900 font-sans">
                      Posted By
                    </h2>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Recruiter Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 font-extrabold text-xl shrink-0 overflow-hidden shadow-inner">
                      {job.recruiter_profile_picture_url ? (
                        <img 
                          src={`${API}${job.recruiter_profile_picture_url}`} 
                          alt={job.recruiter_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        job.recruiter_name.split(' ').map(n => n[0]).join('').toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-sans">
                          {job.recruiter_name}
                        </h3>
                        <p className="text-sm font-medium text-violet-600 font-sans">
                          {job.recruiter_title || "Recruiter"} • {job.company || job.department || "Creative Flow"}
                        </p>
                      </div>
                      
                      {job.recruiter_bio && (
                        <p className="text-sm text-slate-500 leading-relaxed font-sans mt-2">
                          {job.recruiter_bio}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        {job.recruiter_email && (
                          <span className="flex items-center gap-1.5 font-sans">
                            <Mail size={14} className="text-slate-400" />
                            {job.recruiter_email}
                          </span>
                        )}
                        {job.recruiter_location && (
                          <span className="flex items-center gap-1.5 font-sans">
                            <MapPin size={14} className="text-slate-400" />
                            {job.recruiter_location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-3 h-fit">
              <button
                onClick={handleApply}
                disabled={applied}
                className={`w-full font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans ${applied
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
              >
                <Send size={16} />
                {applied ? "Applied" : "Apply now"}
              </button>
              <button
                onClick={toggleBookmark}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans"
              >
                <Bookmark size={16} className={bookmarked ? "text-violet-600 fill-violet-600" : ""} />
                {bookmarked ? "Bookmarked" : "Bookmark job"}
              </button>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-3">
                <dl className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-slate-500 font-sans">Employment type</dt>
                    <dd className="text-sm font-semibold text-slate-900 font-sans">
                      Full-time
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-slate-500 font-sans">Department</dt>
                    <dd className="text-sm font-semibold text-slate-900 font-sans">
                      {job.company || job.department || "Engineering"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3 last:pb-0">
                    <dt className="text-sm text-slate-500 font-sans">Experience level</dt>
                    <dd className="text-sm font-semibold text-slate-900 font-sans">
                      Mid-Senior level
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
