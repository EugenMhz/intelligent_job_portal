import React from "react";
import JobCard from "../components/JobCard";

const DASHBOARD_THEMES = {
  overview: {
    eyebrow: "Career control center",
    title: "Momentum Dashboard",
    subtitle: "A quick snapshot of your saved jobs, applications, and active opportunities.",
    cardClass: "bg-gradient-to-br from-teal-600 to-cyan-500",
    badgeClass: "bg-white/15 text-white",
  },
  insights: {
    eyebrow: "Opportunity radar",
    title: "Insight Dashboard",
    subtitle: "Focus on interview-ready jobs, high-signal matches, and fast application decisions.",
    cardClass: "bg-gradient-to-br from-slate-900 to-slate-700",
    badgeClass: "bg-teal-400/15 text-teal-100",
  },
};

export default function DashboardPage({ jobs, applications, savedJobIds, onSaveToggle, onApply, dashboardVariant, user }) {
  const recommendedJobs = jobs.slice(0, 3);
  const stats = {
    totalApplications: applications.length,
    interviews: applications.filter((app) => app.status.toLowerCase().includes("interview")).length,
    savedJobs: savedJobIds.length,
  };
  const theme = DASHBOARD_THEMES[dashboardVariant] || DASHBOARD_THEMES.overview;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className={`rounded-3xl px-6 py-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)] ${theme.cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">{theme.eyebrow}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{theme.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">{theme.subtitle}</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 ${theme.badgeClass}`}>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Signed in as</p>
            <p className="mt-1 text-sm font-semibold">{user?.name || user?.email || "Job Portal user"}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Applications</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Interviews</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.interviews}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Saved Jobs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.savedJobs}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Recommended Jobs</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedJobs.map((job) => (
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
