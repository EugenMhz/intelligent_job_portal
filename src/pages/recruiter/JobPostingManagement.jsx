import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, CheckCircle, Plus } from 'lucide-react';

function JobPostingManagement({ jobs, onPostJob, onNavigate }) {
  React.useEffect(() => {
    document.title = 'Job Management - Intelligent Portal';
  }, []);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Figma', 'Tailwind CSS', 'React']);
  const [toastMessage, setToastMessage] = useState('');

  // Handle adding skill tags
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,/g, '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the Job Title and Description.');
      return;
    }

    const newJob = {
      id: Date.now(),
      title: title.trim(),
      department: department,
      location: location,
      status: 'Active',
      postedDate: 'Just now',
      applicantsCount: 0,
      description: description.trim(),
      skills: skills
    };

    onPostJob(newJob);

    // Reset Form
    setTitle('');
    setDescription('');
    setSkills(['Figma', 'Tailwind CSS', 'React']);
    
    // Show premium toast
    setToastMessage('🎉 Job Opportunity Posted Successfully!');
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Job Management</h1>
          <p className="text-slate-500 text-sm mt-1">Design, publish, and manage your organization's career opportunities.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-between items-center bg-white border border-slate-200 shadow-sm rounded-2xl p-2">
        <div className="flex flex-wrap gap-1.5">
          <button className="bg-violet-50 text-violet-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer">
            Create New Posting
          </button>
          <button 
            className="text-slate-600 hover:bg-slate-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer flex items-center" 
            onClick={() => onNavigate('dashboard')}
          >
            Active Postings
            <span className="ml-2 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {jobs.filter(j => j.status === 'Active').length}
            </span>
          </button>
          <button className="text-slate-600 hover:bg-slate-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer" onClick={() => onNavigate('dashboard')}>
            Archived
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Job Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Job Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" 
                placeholder="e.g. Senior Product Designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Department</label>
                <select 
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Location</label>
                <select 
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
                  <option value="London, UK">London, UK</option>
                  <option value="New York, NY">New York, NY</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Job Description</label>
              <textarea 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 min-h-[140px] transition-all" 
                placeholder="Describe the role, responsibilities, and team culture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Required Skills</label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 border border-slate-200 rounded-xl focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all min-h-[50px]">
                {skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 pl-2.5 pr-1.5 py-1 rounded-full border border-violet-100/60"
                  >
                    {skill}
                    <button 
                      type="button" 
                      className="text-violet-400 hover:text-violet-700 font-extrabold text-sm w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-100 transition-colors" 
                      onClick={() => removeSkill(idx)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="bg-transparent border-0 outline-none text-sm text-slate-800 placeholder-slate-400 flex-1 min-w-[120px]"
                  placeholder={skills.length === 0 ? "Add skill..." : "Type and press enter..."} 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Press Enter or type a comma to add a skill tag</p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-violet-200 mt-6"
            >
              <Plus size={18} strokeWidth={2.5} />
              Post Job Opportunity
            </button>
          </form>
        </div>

        {/* Right Column - Recently Active List */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recently Active</h2>
            <button 
              className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer" 
              onClick={() => onNavigate('dashboard')}
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {jobs.slice(0, 3).map((job) => (
              <div 
                key={job.id} 
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-violet-200 transition-all duration-300 space-y-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Calendar size={12} />
                      <span>{job.postedDate}</span>
                      <span>•</span>
                      <MapPin size={12} />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-3">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {[...Array(Math.min(3, Math.ceil(job.applicantsCount / 5)))].map((_, i) => (
                      <div 
                        key={i} 
                        className="inline-block h-6 w-6 rounded-full border-2 border-white bg-violet-100 text-violet-700 font-bold text-[9px] flex items-center justify-center uppercase shrink-0"
                      >
                        {String.fromCharCode(65 + (job.id + i) % 26)}
                      </div>
                    ))}
                    {job.applicantsCount > 3 && (
                      <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center shrink-0">
                        +{job.applicantsCount - 2}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-violet-600">
                    {job.applicantsCount} Applicant{job.applicantsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobPostingManagement;
