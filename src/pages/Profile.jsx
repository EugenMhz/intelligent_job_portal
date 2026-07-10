import React, { useState } from "react";
import {
  Pencil,
  Sparkles,
  Plus,
  X,
  FileUp,
  UploadCloud,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import Navbar from "./Navbar";

const initialSkills = [
  "React.js",
  "TypeScript",
  "Tailwind CSS",
  "UI Design",
  "Next.js",
  "GraphQL",
  "Figma",
];

const Profile = () => {
  const [skills, setSkills] = useState(initialSkills);
  const [autoApply, setAutoApply] = useState(true);
  const [fileName] = useState("Alex_Johnson_Resume_2024.pdf");

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="min-h-screen bg-slate-100 py-10">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Top card: avatar + auto-apply */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                  <svg
                    viewBox="0 0 64 64"
                    className="w-full h-full text-slate-400"
                  >
                    <circle cx="32" cy="32" r="32" fill="#CBD5E1" />
                    <circle cx="32" cy="26" r="11" fill="#94A3B8" />
                    <path
                      d="M10 58c2-12 12-18 22-18s20 6 22 18"
                      fill="#94A3B8"
                    />
                  </svg>
                </div>
                <button
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white border-2 border-white"
                  aria-label="Edit photo"
                >
                  <Pencil size={11} />
                </button>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Alex Johnson
                </h1>
                <p className="text-violet-600 font-medium text-sm">
                  Senior Frontend Developer
                </p>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                  <span aria-hidden="true">✉</span> alex.johnson@email.com
                </p>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 w-full sm:w-64 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-wide text-slate-700">
                  AUTO-APPLY
                </span>
                <button
                  onClick={() => setAutoApply((v) => !v)}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                    autoApply
                      ? "bg-violet-600 justify-end"
                      : "bg-slate-300 justify-start"
                  }`}
                  aria-pressed={autoApply}
                  aria-label="Toggle auto-apply"
                >
                  <span className="w-4 h-4 rounded-full bg-white block" />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically apply to jobs with{" "}
                <span className="text-violet-600 font-semibold">
                  &ge;70% match
                </span>{" "}
                based on your parsed skills and preferences.
              </p>
            </div>
          </div>

          {/* Skills management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-violet-600" />
                <h2 className="font-semibold text-slate-900">
                  Skills management
                </h2>
              </div>
              <button className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
                <Plus size={14} />
                Add skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm text-violet-700 bg-violet-50 pl-3 pr-2 py-1.5 rounded-full flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-violet-400 hover:text-violet-700"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Resume upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileUp size={18} className="text-violet-600" />
              <h2 className="font-semibold text-slate-900">Resume upload</h2>
            </div>

            <div className="border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-xl py-10 flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
                <UploadCloud size={22} className="text-violet-600" />
              </div>
              <p className="font-semibold text-slate-900 mb-1">
                Upload your latest resume
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Supports PDF, DOCX (Max 5MB)
              </p>
              <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full px-5 py-2.5 transition-colors">
                Select file
              </button>
            </div>

            <div className="flex items-center justify-between mt-4 bg-slate-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                  <FileText size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Last updated: 2 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <button
                  aria-label="Preview resume"
                  className="hover:text-slate-600"
                >
                  <Eye size={16} />
                </button>
                <button
                  aria-label="Delete resume"
                  className="hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button className="bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors">
              Preview applications
            </button>
            <button className="bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl px-5 py-2.5 transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
