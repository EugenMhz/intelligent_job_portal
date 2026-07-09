import React, { useState } from "react";

export default function CVUploadForm({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setFileName(file ? file.name : "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpload(selectedFile, fileName);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="cv-file" className="mb-2 block text-sm font-medium text-slate-700">
        Upload your CV
      </label>
      <input
        id="cv-file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      />
      <button
        type="submit"
        className="mt-4 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        Extract Skills
      </button>
    </form>
  );
}
