import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

function ChangePasswordAdmin({ onNavigate }) {
  React.useEffect(() => {
    document.title = 'Change Password - Intelligent Portal';
  }, []);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const sessionStr = localStorage.getItem("user");
      if (!sessionStr) {
        throw new Error("No active user session. Please log in again.");
      }
      const session = JSON.parse(sessionStr);

      const response = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.id,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setIsSaving(false);
      setShowToast(true);
      
      // Redirect back to profile after 1.5s
      setTimeout(() => {
        onNavigate('profile');
      }, 1500);
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>Password updated successfully!</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <button 
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-semibold uppercase tracking-wider cursor-pointer border-none bg-none outline-none text-left w-fit"
          onClick={() => onNavigate('profile')}
        >
          <ArrowLeft size={14} />
          Back to Profile
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Change Password</h1>
          <p className="text-slate-500 text-sm mt-1">Update your recruiter account credentials.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-6 flex items-center gap-2">
          <KeyRound size={18} className="text-violet-600" />
          Security Credentials
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="oldPassword">Old Password</label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                name="oldPassword"
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="newPassword">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min. 6 chars)"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="confirmNewPassword">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                name="confirmNewPassword"
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              >
                {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              onClick={() => onNavigate('profile')}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm hover:shadow-violet-200"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordAdmin;
