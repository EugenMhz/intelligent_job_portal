import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Calendar, MapPin, CheckCircle, Plus } from 'lucide-react';

function JobPostingManagement({ jobs, onPostJob, onNavigate, onDeleteJob, onUpdateJob }) {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Job Management - Intelligent Portal';
  }, []);

  // Read ?tab=all-postings from URL and switch to Active Postings → All Jobs view
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'all-postings') {
      setActiveTab('active-postings');
      setViewFilter('all');
    }
  }, [location.search]);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobLocation, setJobLocation] = useState('Remote');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'active-postings'
  const [viewFilter, setViewFilter] = useState('active'); // 'active' or 'all'

  const [selectedDetailsJob, setSelectedDetailsJob] = useState(null);
  const [selectedEditJob, setSelectedEditJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    status: 'Active',
    description: ''
  });

  const handleStartEditObj = (job) => {
    setSelectedEditJob(job);
    setEditFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || 'Remote',
      status: job.status || 'Active',
      description: job.description || ''
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
      location: jobLocation,
      status: saveAsDraft ? 'Draft' : 'Active',
      postedDate: 'Just now',
      applicantsCount: 0,
      description: description.trim(),
      skills: skills
    };

    onPostJob(newJob);

    // Reset Form
    setTitle('');
    setDescription('');
    setSkills([]);
    setSaveAsDraft(false);

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
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            Create New Posting
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center ${activeTab === 'active-postings' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            onClick={() => setActiveTab('active-postings')}
          >
            Active Postings
            <span className="ml-2 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {jobs.filter(j => j.status === 'Active').length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (

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
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Site">On-Site</option>
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

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="saveAsDraft"
                  checked={saveAsDraft}
                  onChange={(e) => setSaveAsDraft(e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
                />
                <label htmlFor="saveAsDraft" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Save as draft (will not be visible immediately)
                </label>
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
                onClick={() => setActiveTab('active-postings')}
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
                        <span>{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Just now'}</span>
                        <span>•</span>
                        <MapPin size={12} />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
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
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Job Postings List</h2>
              <p className="text-slate-500 text-xs mt-0.5">Filter and manage all the job listings you have created.</p>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewFilter === 'active'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Active Jobs Only
              </button>
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                All Jobs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Job Title</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Applicants</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs
                  .filter(job => viewFilter === 'all' || job.status === 'Active')
                  .map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{job.title}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{job.department} &bull; {job.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            job.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-slate-600 font-semibold">
                        {job.applicantsCount} candidate{job.applicantsCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex justify-end items-center gap-2.5">
                          <button 
                            className="text-violet-600 hover:text-violet-700 font-bold text-xs cursor-pointer hover:underline"
                            onClick={() => setSelectedDetailsJob(job)}
                          >
                            View
                          </button>
                          <span className="text-slate-200">|</span>
                          <button 
                            className="text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer hover:underline"
                            onClick={() => handleStartEditObj(job)}
                          >
                            Edit
                          </button>
                          <span className="text-slate-200">|</span>
                          <button 
                            className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer hover:underline"
                            onClick={() => onDeleteJob(job.id)}
                          >
                            Delete
                          </button>
                          <span className="text-slate-200">|</span>
                          <button
                            onClick={() => {
                              onNavigate('applicants', job.id);
                            }}
                            className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                          >
                            View Applicants
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {jobs.filter(job => viewFilter === 'all' || job.status === 'Active').length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                      No jobs match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedDetailsJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedDetailsJob.title}</h3>
                <p className="text-slate-500 text-xs mt-1">
                  {selectedDetailsJob.department} &bull; {selectedDetailsJob.location} &bull; Posted on {formatDate(selectedDetailsJob.posted_date || selectedDetailsJob.postedDate)}
                </p>
              </div>
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                selectedDetailsJob.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                selectedDetailsJob.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {selectedDetailsJob.status}
              </span>
            </div>
            
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Description</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedDetailsJob.description}</p>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-slate-500 text-xs">
                <span>Total Candidates: <strong>{selectedDetailsJob.applicantsCount}</strong></span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedDetailsJob(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {selectedEditJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-xl w-full p-6 animate-scale-in text-left">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Job Posting</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateJob({
                id: selectedEditJob.id,
                ...editFormData
              });
              setSelectedEditJob(null);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Job Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Department</label>
                  <select 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 cursor-pointer"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Location</label>
                  <select 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 cursor-pointer"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Kathmandu, Nepal">Kathmandu, Nepal</option>
                    <option value="Lalitpur, Nepal">Lalitpur, Nepal</option>
                    <option value="Bhaktapur, Nepal">Bhaktapur, Nepal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 cursor-pointer"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Job Description</label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 min-h-[120px] transition-all"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setSelectedEditJob(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm shadow-violet-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPostingManagement;

