import React from "react";
import ApplicationCard from "../components/ApplicationCard";

export default function ApplicationsPage({ applications, jobs }) {
  const appsWithJobs = applications
    .map((application) => ({
      application,
      job: jobs.find((job) => job.id === application.jobId),
    }))
    .filter((entry) => entry.job);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
      <p className="mt-1 text-sm text-slate-600">Track status and similarity score placeholders for your applied jobs.</p>

      <div className="mt-6 space-y-3">
        {appsWithJobs.map(({ application, job }) => (
          <ApplicationCard key={application.id} application={application} job={job} />
        ))}
      </div>
    </main>
  );
}
