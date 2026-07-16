import React, { useState, useEffect, useRef } from "react";
import {
  Pencil,
  Sparkles,
  Plus,
  X,
  FileUp,
  UploadCloud,
  FileText,
  CheckCircle,
  Loader2,
  GraduationCap,
  User,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000");

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [autoApply, setAutoApply] = useState(true);
  const [autoApplyThreshold, setAutoApplyThreshold] = useState(70);
  const [resumeUrl, setResumeUrl] = useState("");

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);

  // CV upload state
  const [cvUploading, setCvUploading] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvDeleting, setCvDeleting] = useState(false);
  const [showDeleteCvConfirm, setShowDeleteCvConfirm] = useState(false);
  const [newlyExtractedSkills, setNewlyExtractedSkills] = useState([]); // Skills found in latest upload

  // Logout confirm
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit mode
  const [editingInfo, setEditingInfo] = useState(false);

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    document.title = "My Profile - Intelligent Job Portal";
    if (!userId) { navigate("/"); return; }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobseekers/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setName(data.full_name || "");
      setTitle(data.title || "");
      setEmail(data.email || user?.email || "");
      setEducation(data.education || "");
      setAutoApply(data.auto_apply ?? true);
      setAutoApplyThreshold(data.auto_apply_match_threshold ?? 70);
      setResumeUrl(data.resume_url || "");
      setSkills(data.skills || []);
      setProfilePictureUrl(data.profile_picture_url || "");
      
      // Update localStorage with photo to keep navbar in sync
      if (data.profile_picture_url) {
        const updatedUser = { ...user, profile_picture_url: data.profile_picture_url };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch {
      // If profile not found, use auth data as fallback
      setEmail(user?.email || "");
      setName(user?.name || "");
    } finally {
      setLoading(false);
    }
  };

  // ── Save profile to DB ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/jobseekers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          education,
          auto_apply: autoApply,
          auto_apply_match_threshold: autoApplyThreshold,
          resume_url: resumeUrl,
          skills,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Profile saved successfully!");
      setEditingInfo(false);
    } catch {
      showToast("Failed to save. Try again.", true);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle auto-apply (saves immediately) ─────────────────────────────────
  const handleToggleAutoApply = async () => {
    const next = !autoApply;
    setAutoApply(next);
    try {
      await fetch(`${API}/api/jobseekers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, title, education,
          auto_apply: next,
          auto_apply_match_threshold: autoApplyThreshold,
          resume_url: resumeUrl,
          skills,
        }),
      });
    } catch { /* silent */ }
  };

  // ── Profile photo management ──────────────────────────────────────────────
  const handlePhotoUploadClick = () => {
    setShowPhotoOptions(false);
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("role", "seeker");

    try {
      const res = await fetch(`${API}/api/profile-picture/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setProfilePictureUrl(data.profile_picture_url);
      
      // Sync with localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentUser.profile_picture_url = data.profile_picture_url;
      localStorage.setItem("user", JSON.stringify(currentUser));
      
      showToast("Profile picture updated!");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handlePhotoDelete = async () => {
    setShowPhotoOptions(false);
    try {
      const res = await fetch(`${API}/api/profile-picture/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "seeker" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      
      setProfilePictureUrl("");
      
      // Sync with localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      delete currentUser.profile_picture_url;
      localStorage.setItem("user", JSON.stringify(currentUser));
      
      showToast("Profile picture removed!");
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // ── Skill management ───────────────────────────────────────────────────────
  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setNewSkill("");
    setAddingSkill(false);
  };

  const handleRemoveSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  // ── View CV ──────────────────────────────────────────────────────────────
  const handleViewCv = () => {
    if (resumeUrl) {
      window.open(`${API}${resumeUrl}`, "_blank", "noopener,noreferrer");
    }
  };

  // ── Delete CV ─────────────────────────────────────────────────────────────
  const handleDeleteCv = async () => {
    setCvDeleting(true);
    setShowDeleteCvConfirm(false);
    try {
      const res = await fetch(`${API}/api/cv/delete/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setResumeUrl("");
      showToast("CV deleted successfully.");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setCvDeleting(false);
    }
  };

  // ── CV re-upload from profile page ────────────────────────────────────────
  const handleCvFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      showToast("Only PDF and DOCX files are accepted.", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File must be under 5MB.", true);
      return;
    }
    setCvUploading(true);
    setCvProgress(0);
    setNewlyExtractedSkills([]); // clear previous results
    const interval = setInterval(() => setCvProgress((p) => p < 85 ? p + Math.random() * 15 : p), 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      const res = await fetch(`${API}/api/cv/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      clearInterval(interval);
      setCvProgress(100);
      setResumeUrl(data.resume_url);

      // Track only *newly added* skills (not already in the list)
      setSkills((prev) => {
        const existingSet = new Set(prev);
        const brandNew = (data.skills || []).filter((s) => !existingSet.has(s));
        setNewlyExtractedSkills(brandNew);
        return [...new Set([...prev, ...data.skills])];
      });

      await new Promise((r) => setTimeout(r, 400));
      showToast(`CV uploaded! ${data.skill_count} skill${data.skill_count !== 1 ? 's' : ''} extracted.`);
    } catch (err) {
      clearInterval(interval);
      showToast(err.message, true);
    } finally {
      setCvUploading(false);
      setCvProgress(0);
    }
  };

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(""), 3000);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getInitials = (n) => n ? n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const getResumeFilename = (url) => url ? url.split("/").pop().replace(/^\d+_/, "") : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toast.isError ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.isError
            ? <X size={16} />
            : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* ── Top card: avatar + name + auto-apply ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 sm:items-start sm:justify-between shadow-sm">
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <div className="relative shrink-0">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-sm overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-violet-400 relative group cursor-pointer"
                  title="Click to manage photo"
                >
                  {profilePictureUrl ? (
                    <img
                      src={`${API}${profilePictureUrl}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(name)
                  )}
                  {/* Subtle edit overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-medium">Edit</span>
                  </div>
                </button>

                {/* Dropdown overlay/popover */}
                {showPhotoOptions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPhotoOptions(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
                      {!profilePictureUrl ? (
                        <button
                          onClick={handlePhotoUploadClick}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Plus size={14} /> Upload Photo
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handlePhotoUploadClick}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <RefreshCw size={14} /> Change Photo
                          </button>
                          <button
                            onClick={handlePhotoDelete}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 size={14} /> Remove Photo
                          </button>
                        </>
                      )}
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => setShowPhotoOptions(false)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Info editable block */}
              <div className="flex-1 min-w-0">
                {editingInfo ? (
                  <div className="space-y-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-violet-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                    <input
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. BSc Computer Science, MIT"
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setEditingInfo(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">
                        {name || "Your Name"}
                      </h1>
                      <button
                        onClick={() => setEditingInfo(true)}
                        className="shrink-0 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                        aria-label="Edit profile"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    {title && <p className="text-violet-600 font-medium text-sm mt-0.5">{title}</p>}
                    {education && (
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                        <GraduationCap size={12} /> {education}
                      </p>
                    )}
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                      <User size={12} /> {email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-apply toggle */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 w-full sm:w-60 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase">Auto-Apply</span>
                <button
                  onClick={handleToggleAutoApply}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                    autoApply ? "bg-violet-600 justify-end" : "bg-slate-300 justify-start"
                  }`}
                  aria-pressed={autoApply}
                  aria-label="Toggle auto-apply"
                >
                  <span className="w-4 h-4 rounded-full bg-white block shadow-sm" />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Automatically apply to jobs matching{" "}
                <span className="text-violet-600 font-semibold">≥{autoApplyThreshold}%</span> of your skills.
              </p>
              {autoApply && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Threshold</span>
                    <span className="font-bold text-violet-600">{autoApplyThreshold}%</span>
                  </div>
                  <input
                    type="range" min="50" max="100" step="5"
                    value={autoApplyThreshold}
                    onChange={(e) => setAutoApplyThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 accent-violet-600 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Skills management ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-violet-600" />
                <h2 className="font-semibold text-slate-900">Skills</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {skills.length}
                </span>
              </div>
              <button
                onClick={() => setAddingSkill(true)}
                className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={14} /> Add skill
              </button>
            </div>

            {/* Add skill input */}
            {addingSkill && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  autoFocus
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddSkill(); if (e.key === "Escape") { setAddingSkill(false); setNewSkill(""); } }}
                  placeholder="e.g. React, Python..."
                  className="flex-1 border border-violet-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button onClick={handleAddSkill} className="bg-violet-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-violet-700 transition-colors cursor-pointer">
                  Add
                </button>
                <button onClick={() => { setAddingSkill(false); setNewSkill(""); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            )}

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm text-violet-700 bg-violet-50 border border-violet-100 pl-3 pr-2 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-violet-300 hover:text-rose-500 transition-colors cursor-pointer"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">
                No skills added yet. Upload your CV or add manually.
              </p>
            )}
          </div>

          {/* ── Resume upload ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileUp size={18} className="text-violet-600" />
              <h2 className="font-semibold text-slate-900">Resume / CV</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleCvFile(e.target.files[0])}
            />

            {/* Progress bar during upload */}
            {cvUploading && (
              <div className="mb-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Uploading & extracting skills...</span>
                  <span>{Math.round(cvProgress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${cvProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Drop zone */}
            <div
              onClick={() => !cvUploading && fileInputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); !cvUploading && handleCvFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-xl py-8 flex flex-col items-center text-center px-4 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all ${cvUploading ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-violet-100 flex items-center justify-center mb-3 shadow-sm">
                <UploadCloud size={22} className="text-violet-600" />
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">
                {cvUploading ? "Analyzing your CV..." : "Upload / Update your CV"}
              </p>
              <p className="text-xs text-slate-400 mb-4">PDF or DOCX · Max 5MB</p>
              <span className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors">
                {cvUploading ? "Processing..." : "Select file"}
              </span>
            </div>

            {/* ── Extracted Skills Result Panel ── */}
            {newlyExtractedSkills.length > 0 && !cvUploading && (
              <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-violet-900">
                        {newlyExtractedSkills.length} new skill{newlyExtractedSkills.length !== 1 ? "s" : ""} extracted!
                      </p>
                      <p className="text-[11px] text-violet-500">Added to your skills list below</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewlyExtractedSkills([])}
                    className="text-violet-300 hover:text-violet-600 transition-colors cursor-pointer mt-0.5 shrink-0"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newlyExtractedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-white border border-violet-200 px-2.5 py-1 rounded-full shadow-sm"
                    >
                      <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {newlyExtractedSkills.length === 0 && !cvUploading && resumeUrl && (
              <></>
            )}

            {/* Current resume file display */}
            {resumeUrl && (
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {getResumeFilename(resumeUrl) || "Uploaded CV"}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" /> Saved on your profile
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* View */}
                    <button
                      onClick={handleViewCv}
                      title="View CV"
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-violet-600 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                    >
                      <Eye size={13} /> View
                    </button>

                    {/* Re-upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={cvUploading}
                      title="Replace CV"
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg px-3 py-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={cvUploading ? "animate-spin" : ""} /> Replace
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setShowDeleteCvConfirm(true)}
                      disabled={cvDeleting}
                      title="Delete CV"
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg px-3 py-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {cvDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      {cvDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200 mt-2">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold rounded-xl px-5 py-2.5 transition-colors cursor-pointer text-center text-sm"
            >
              Logout
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate("/changepassword")}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-center text-sm"
              >
                Change Password
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl px-6 py-2.5 transition-colors cursor-pointer text-center shadow-sm text-sm flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete CV confirmation modal ── */}
      {showDeleteCvConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete your CV?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently remove your CV file and clear it from your profile.
              Your extracted skills will remain. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteCvConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCv}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm shadow-rose-100 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Log Out</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to log out? Any unsaved changes will be lost.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { localStorage.removeItem("user"); navigate("/"); }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
