import React from "react";
import {
  Send,
  Bookmark,
  MapPin,
  Clock,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Navbar from "./Navbar";

const skills = [
  "Figma",
  "UI Design",
  "Prototyping",
  "User Research",
  "Design Systems",
];

const responsibilities = [
  "Own end-to-end design process from wireframing to high-fidelity prototyping.",
  "Collaborate with cross-functional teams to identify user needs and business goals.",
  "Contribute to and evolve our design system to ensure consistency across the platform.",
  "Conduct user research and usability testing to validate design decisions.",
  "Mentor junior designers and advocate for design excellence within the organization.",
];

const requirements = [
  "5+ years of experience in product design, UI/UX, or related field.",
  "Strong portfolio showcasing your problem-solving skills and visual design craft.",
  "Expertise in Figma and other modern design tools.",
  "Experience working in an agile development environment.",
  "Excellent communication and presentation skills.",
];

const similarJobs = [
  {
    title: "UX Design Lead",
    company: "Cotiviti Nepal Pvt. Ltd.",
    location: "Hattisar, Kathmandu",
    match: 92,
    icon: Users,
  },
  {
    title: "Interaction Designer",
    company: "CloudNative Inc.",
    location: "Remote",
    match: 88,
    icon: BarChart3,
  },
  {
    title: "AI Interface Designer",
    company: "FutureMind",
    location: "Kupondole, Lalitpur",
    match: 74,
    icon: Sparkles,
  },
];

function matchColor(match) {
  if (match >= 85) return "text-emerald-600";
  if (match >= 75) return "text-amber-600";
  return "text-slate-500";
}

const JobDescription = () => {
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <span>Home</span>
            <span>/</span>
            <span>Technology</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              Senior Product Designer
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center mb-4 bg-white">
                  <div className="w-10 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    e
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    Senior Product Designer
                  </h1>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <p className="text-violet-600 font-medium mb-3">eSewa</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    Pulchowk, Lalitpur (Remote)
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Posted 2 days ago
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    45 applicants
                  </span>
                </div>
              </div>

              {/* Skills card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-violet-600" />
                    <h2 className="font-semibold text-slate-900">Skills</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full"
                        style={{ width: "85%" }}
                      />
                    </div>
                    <span className="text-sm font-medium text-violet-600">
                      85% Match
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job description card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                  Job Description
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  eSewa is looking for a Senior Product Designer to join our
                  core product team. You'll be responsible for creating
                  intuitive, delightful experiences for our millions of users.
                  You will work closely with product managers and engineers to
                  define and ship features from concept to launch.
                </p>

                <h3 className="font-semibold text-slate-900 mb-3">
                  What you'll do
                </h3>
                <ul className="space-y-2 mb-6">
                  {responsibilities.map((item) => (
                    <li
                      key={item}
                      className="text-slate-600 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold text-slate-900 mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {requirements.map((item) => (
                    <li
                      key={item}
                      className="text-slate-600 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 h-fit">
              <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 transition-colors">
                <Send size={16} />
                Apply now
              </button>
              <button className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl py-3 flex items-center justify-center gap-2 transition-colors">
                <Bookmark size={16} />
                Bookmark job
              </button>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-3">
                <dl className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-slate-500">Employment type</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      Full-time
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-slate-500">Salary range</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      Npr 50k - 85k
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-slate-500">Experience level</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      Senior level
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3 last:pb-0">
                    <dt className="text-sm text-slate-500">Industry</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      Software/SaaS
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
