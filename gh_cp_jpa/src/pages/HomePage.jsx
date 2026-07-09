import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function HomePage({ jobs, savedJobIds, onSaveToggle, onApply }) {
  const [search, setSearch] = useState("");

  const featuredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query))
        );
      }),
    [jobs, search]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-md sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your next role with confidence</h1>
        <p className="mt-3 max-w-2xl text-sm text-teal-50 sm:text-base">
          Search jobs, upload your CV, and get role recommendations tailored to your skills.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, company, or skill"
            className="w-full rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          />
          <Link
            to="/jobs"
            className="rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Explore Jobs
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Featured Jobs</h2>
          <Link
            to="/jobs"
            className="text-sm font-medium text-teal-700 transition hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            View all jobs
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredJobs.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.includes(job.id)}
              onSaveToggle={onSaveToggle}
              onApply={onApply}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
