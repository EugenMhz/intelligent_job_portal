import React from "react";
import { useParams } from "react-router-dom";

export default function JobDetailsPage({ jobs, savedJobIds, onSaveToggle, onApply }) {
  const { jobId } = useParams();
  const job = jobs.find((entry) => entry.id === jobId);

  if (!job) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
          Job not found. Please return to the listings page.
        </div>
      </main>
    );
  }

  const isSaved = savedJobIds.includes(job.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">{job.company}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{job.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {job.location} · {job.type}
        </p>

        <section className="mt-5">
          <h2 className="text-lg font-semibold text-slate-900">Job Description</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{job.description}</p>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-semibold text-slate-900">Required Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApply(job.id)}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => onSaveToggle(job.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              isSaved
                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isSaved ? "Saved" : "Save Job"}
          </button>
        </div>
      </article>
    </main>
  );
}
