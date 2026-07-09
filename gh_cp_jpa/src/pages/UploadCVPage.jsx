import React, { useState } from "react";
import CVUploadForm from "../components/CVUploadForm";
import { api } from "../services/api";

export default function UploadCVPage() {
  const [message, setMessage] = useState("Upload a file to extract skills.");
  const [skills, setSkills] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file, fileName) => {
    if (!file) {
      setMessage("Please choose a CV file before extracting skills.");
      return;
    }

    setIsUploading(true);
    try {
      const data = await api.uploadCv(file);
      setMessage(data.message || `Parsed ${fileName}.`);
      setSkills(data.extractedSkills || []);
    } catch (error) {
      setMessage(error.message || "CV upload failed.");
      setSkills([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Upload CV</h1>
      <p className="mt-1 text-sm text-slate-600">Attach your resume and preview extracted skills.</p>

      <div className="mt-6">
        <CVUploadForm onUpload={handleUpload} />
        {isUploading && <p className="mt-2 text-sm text-slate-600">Uploading and parsing CV...</p>}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Extracted Skills</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
