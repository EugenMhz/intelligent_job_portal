import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CVUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const MAX_MB = 5;

  const validateFile = (file) => {
    if (!ACCEPTED.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".pdf")) {
      return "Only PDF and DOCX files are accepted.";
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File must be under ${MAX_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
    }
    return null;
  };

  const handleFileSelect = (file) => {
    setError("");
    setUploadDone(false);
    setExtractedSkills([]);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;
    setUploading(true);
    setError("");
    setProgress(0);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userId);

      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setExtractedSkills(data.skills || []);
      setUploadDone(true);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const goToDashboard = () => navigate("/jobseeker");

  const fileIcon = (
    <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#ede9fe] to-[#e0e7ff] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-violet-100 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white -rotate-45" fill="white" fillOpacity="0.2" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l7-7 7 7M5 19l7-7 7 7" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900">Intelligent Job Portal</span>
        </div>
        <button
          onClick={goToDashboard}
          className="text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors cursor-pointer"
        >
          Skip for now →
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
              One Last Step
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Upload your <span className="text-violet-600">CV / Resume</span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-md mx-auto">
              We'll use AI to extract your skills automatically and match you with the best job opportunities.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-violet-100 border border-violet-100/60 overflow-hidden">
            {!uploadDone ? (
              <div className="p-8 sm:p-10">
                {/* Drop Zone */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
                    ${dragOver
                      ? "border-violet-500 bg-violet-50 scale-[1.01]"
                      : selectedFile
                      ? "border-violet-400 bg-violet-50/50"
                      : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/30"
                    }
                    ${uploading ? "pointer-events-none opacity-70" : ""}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                        {fileIcon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {!uploading && (
                        <span className="text-xs text-violet-500 font-semibold">Click to change file</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-700 font-semibold text-sm">Drag & drop your CV here</p>
                        <p className="text-slate-400 text-xs mt-1">or <span className="text-violet-600 font-semibold">click to browse</span></p>
                      </div>
                      <div className="flex gap-2">
                        {["PDF", "DOCX"].map((t) => (
                          <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 tracking-wider">
                            {t}
                          </span>
                        ))}
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 tracking-wider">
                          Max 5MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Uploading & extracting skills...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="mt-6 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing your CV...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Extract Skills & Continue
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 mt-4">
                  You can always update your CV later from your profile.{" "}
                  <button onClick={goToDashboard} className="text-violet-500 font-semibold hover:underline cursor-pointer">
                    Skip for now
                  </button>
                </p>
              </div>
            ) : (
              /* Success State */
              <div className="p-8 sm:p-10">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">CV Uploaded Successfully!</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    We extracted <strong className="text-violet-600">{extractedSkills.length} skills</strong> from your CV.
                  </p>
                </div>

                {/* Skills Grid */}
                {extractedSkills.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">
                      Extracted Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full animate-fade-in"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 font-medium text-center">
                    No skills were automatically detected. You can add them manually from your profile.
                  </div>
                )}

                <button
                  onClick={goToDashboard}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-violet-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  Continue to Dashboard
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Features row */}
          {!uploadDone && (
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: "🧠", title: "AI-Powered", desc: "Skills auto-extracted from your CV" },
                { icon: "🔒", title: "Secure", desc: "Your data is encrypted and private" },
                { icon: "⚡", title: "Instant Match", desc: "Get matched to jobs immediately" },
              ].map((f) => (
                <div key={f.title} className="bg-white/70 backdrop-blur rounded-2xl p-4 text-center border border-white/60 shadow-sm">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-xs font-bold text-slate-800">{f.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CVUpload;
