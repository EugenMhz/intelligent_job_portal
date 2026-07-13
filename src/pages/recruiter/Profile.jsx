import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, Award, Settings } from 'lucide-react';

function Profile({ user, onUpdateUser, onNavigate }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    document.title = user.role ? `${user.role} Profile - Intelligent Portal` : 'Recruiter Profile';
  }, [user.role]);

  const [formData, setFormData] = useState({
    name: user.name || 'Jane Doe',
    role: user.role || 'Senior Recruiter',
    email: user.email || 'jane.doe@intelligentportal.com',
    phone: user.phone || '+1 (555) 382-9012',
    department: user.department || 'Talent Acquisition',
    location: user.location || 'San Francisco, CA (Remote)',
    bio: user.bio || 'Passionate about connecting exceptional engineering and design talent with meaningful opportunities. 8+ years of technical recruiting experience.',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onUpdateUser(formData);
      setIsSaving(false);
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar Info Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center self-start">
          <div className="w-20 h-20 rounded-full bg-violet-100 border border-violet-200 text-violet-700 flex items-center justify-center font-bold text-3xl uppercase mb-4 ring-4 ring-violet-50">
            {formData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{formData.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">{formData.role}</p>

          <div className="w-full border-t border-slate-100 pt-4 mt-6 space-y-4 text-left">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Active Jobs</span>
              <span className="font-semibold text-slate-800">5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Total Applicants</span>
              <span className="font-semibold text-slate-800">69</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Response Rate</span>
              <span className="font-semibold text-emerald-600">94%</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-6 flex items-center gap-2">
            <Settings size={18} className="text-violet-600" />
            Profile Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="role">Role / Job Title</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="bio">Professional Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 min-h-[100px] transition-all"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t border-slate-200 mt-6">
              <button 
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold rounded-xl px-5 py-2.5 transition-colors cursor-pointer text-center"
              >
                Logout
              </button>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer text-center"
                  onClick={() => onNavigate('changepasswordadmin')}
                  disabled={isSaving}
                >
                  Change Password
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer text-center shadow-sm hover:shadow-violet-200"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
