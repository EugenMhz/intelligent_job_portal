import React from "react";

export default function JobFilters({ locationFilter, skillFilter, onLocationChange, onSkillChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Filters</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="location-filter" className="mb-1 block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location-filter"
            type="text"
            value={locationFilter}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="e.g., Remote"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="skill-filter" className="mb-1 block text-sm font-medium text-slate-700">
            Skill
          </label>
          <input
            id="skill-filter"
            type="text"
            value={skillFilter}
            onChange={(event) => onSkillChange(event.target.value)}
            placeholder="e.g., React"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          />
        </div>
      </div>
    </section>
  );
}
