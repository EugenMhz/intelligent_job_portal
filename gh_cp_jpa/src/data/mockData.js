export const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "PixelCraft Labs",
    location: "Bengaluru",
    skills: ["React", "Tailwind", "TypeScript"],
    type: "Full-time",
    description:
      "Build fast and accessible UIs for a modern hiring platform. Collaborate with product and backend teams.",
  },
  {
    id: "job-2",
    title: "Machine Learning Engineer",
    company: "DataNova AI",
    location: "Hyderabad",
    skills: ["Python", "NLP", "PyTorch"],
    type: "Full-time",
    description:
      "Design and deploy NLP models for resume parsing and semantic job matching.",
  },
  {
    id: "job-3",
    title: "Backend Engineer",
    company: "CloudDock",
    location: "Remote",
    skills: ["Node.js", "MongoDB", "REST"],
    type: "Remote",
    description:
      "Develop robust APIs, optimize query performance, and support recruiter workflows.",
  },
  {
    id: "job-4",
    title: "Data Analyst",
    company: "InsightGrid",
    location: "Pune",
    skills: ["SQL", "Power BI", "Excel"],
    type: "Contract",
    description:
      "Translate hiring funnel data into actionable dashboards and team insights.",
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "ScaleForge",
    location: "Chennai",
    skills: ["Docker", "Kubernetes", "AWS"],
    type: "Full-time",
    description:
      "Automate deployment pipelines and maintain scalable cloud infrastructure.",
  },
  {
    id: "job-6",
    title: "UI/UX Designer",
    company: "Northstar Studio",
    location: "Remote",
    skills: ["Figma", "UX Research", "Design Systems"],
    type: "Remote",
    description:
      "Create intuitive candidate and recruiter experiences with a strong visual language.",
  },
];

export const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    jobId: "job-1",
    status: "Under Review",
    appliedOn: "2026-03-20",
    similarityScore: "89%",
  },
  {
    id: "app-2",
    jobId: "job-3",
    status: "Interview Scheduled",
    appliedOn: "2026-03-18",
    similarityScore: "82%",
  },
  {
    id: "app-3",
    jobId: "job-2",
    status: "Submitted",
    appliedOn: "2026-03-22",
    similarityScore: "91%",
  },
];

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Job Listings" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/applications", label: "Applications" },
  { to: "/saved-jobs", label: "Saved Jobs" },
  { to: "/upload-cv", label: "Upload CV" },
];
