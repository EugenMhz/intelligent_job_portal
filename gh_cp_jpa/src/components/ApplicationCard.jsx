import React from "react";

export default function ApplicationCard({ application, job }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{job?.title}</h3>
      <p className="text-sm text-slate-600">{job?.company}</p>
      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
        <p>
          <span className="font-medium">Status:</span> {application.status}
        </p>
        <p>
          <span className="font-medium">Applied:</span> {application.appliedOn}
        </p>
        <p>
          <span className="font-medium">Similarity:</span> {application.similarityScore}
        </p>
      </div>
    </article>
  );
}
