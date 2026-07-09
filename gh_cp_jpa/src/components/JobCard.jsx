import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job, isSaved, onSaveToggle, onApply }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-600">
            {job.company} · {job.location} · {job.type}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSaveToggle(job.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            isSaved
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-700">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/jobs/${job.id}`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={() => onApply(job.id)}
          className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Apply
        </button>
      </div>
    </article>
  );
}
