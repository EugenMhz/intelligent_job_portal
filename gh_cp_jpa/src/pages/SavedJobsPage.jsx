import React from "react";
import JobCard from "../components/JobCard";

export default function SavedJobsPage({ jobs, savedJobIds, onSaveToggle, onApply }) {
  const savedJobs = jobs.filter((job) => savedJobIds.includes(job.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
      <p className="mt-1 text-sm text-slate-600">Bookmark jobs to revisit and apply later.</p>

      {savedJobs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No saved jobs yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.includes(job.id)}
              onSaveToggle={onSaveToggle}
              onApply={onApply}
            />
          ))}
        </div>
      )}
    </main>
  );
}
