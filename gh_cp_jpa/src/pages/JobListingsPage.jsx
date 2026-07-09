import React, { useMemo, useState } from "react";
import JobCard from "../components/JobCard";
import JobFilters from "../components/JobFilters";

export default function JobListingsPage({ jobs, savedJobIds, onSaveToggle, onApply }) {
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const locationMatches =
          !locationFilter.trim() || job.location.toLowerCase().includes(locationFilter.trim().toLowerCase());

        const skillMatches =
          !skillFilter.trim() ||
          job.skills.some((skill) => skill.toLowerCase().includes(skillFilter.trim().toLowerCase()));

        return locationMatches && skillMatches;
      }),
    [jobs, locationFilter, skillFilter]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Job Listings</h1>
      <p className="mt-1 text-sm text-slate-600">Browse jobs and filter by location or skill.</p>

      <div className="mt-6">
        <JobFilters
          locationFilter={locationFilter}
          skillFilter={skillFilter}
          onLocationChange={setLocationFilter}
          onSkillChange={setSkillFilter}
        />
      </div>

      <div className="mt-4 text-sm text-slate-600">{filteredJobs.length} jobs found</div>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.includes(job.id)}
            onSaveToggle={onSaveToggle}
            onApply={onApply}
          />
        ))}
      </section>
    </main>
  );
}
