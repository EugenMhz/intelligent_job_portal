import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShieldAlert, KeyRound } from 'lucide-react';
import Navbar from './Navbar';

function ChangePassword() {
  const navigate = useNavigate();
  React.useEffect(() => {
    document.title = 'Change Password - Intelligent Portal';
  }, []);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

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

  const handleSubmit = (e) => {
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

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      
      // Redirect back to profile after 1.5s
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-10">
      <Navbar />
      
      <div className="max-w-xl mx-auto space-y-6 px-4 py-10 animate-fade-in">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
            <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {/* Back navigation */}
        <div className="flex flex-col gap-3">
          <button 
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-semibold uppercase tracking-wider cursor-pointer border-none bg-none outline-none text-left w-fit"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft size={14} />
            Back to Profile
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h1>
            <p className="text-slate-400 text-sm mt-0.5">Update your account password credentials</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-6 flex items-center gap-2">
            <KeyRound size={18} className="text-violet-600" />
            Security Settings
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
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min. 6 chars)"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                onClick={() => navigate('/profile')}
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
    </div>
  );
}

export default ChangePassword;
