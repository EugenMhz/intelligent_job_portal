import React from 'react';
import { Briefcase, Users, UserCheck, Plus } from 'lucide-react';

function DashboardOverview({ jobs, applicants = [], onNavigate, onSelectJob, onUpdateJob }) {
  React.useEffect(() => {
    document.title = 'Recruiter Dashboard - Intelligent Portal';
  }, []);

  const [selectedDetailsJob, setSelectedDetailsJob] = React.useState(null);
  const [selectedEditJob, setSelectedEditJob] = React.useState(null);
  const [editFormData, setEditFormData] = React.useState({
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

  // Calculate dynamic stats from database data
  const totalJobsPosted = jobs.length;
  const activeApplicants = applicants.length;
  const recentHires = applicants.filter(app => app.status === 'Shortlisted' || app.status === 'Interviewing').length;

  const handleManageJob = (job) => {
    onSelectJob(job);
    onNavigate('applicants');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your hiring pipeline and optimize your talent search.</p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-violet-200 cursor-pointer"
          onClick={() => onNavigate('jobs')}
        >
          <Plus size={16} strokeWidth={2.5} />
          Post a New Job
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Jobs Posted Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-violet-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 z-10 relative">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total Jobs Posted</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">+12%</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 z-10 relative">{totalJobsPosted}</div>
          <Briefcase className="absolute right-3 -bottom-3 w-16 h-16 text-slate-100/70 group-hover:text-violet-50/50 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Active Applicants Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-violet-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 z-10 relative">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Applicants</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">+8%</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 z-10 relative">{activeApplicants.toLocaleString()}</div>
          <Users className="absolute right-3 -bottom-3 w-16 h-16 text-slate-100/70 group-hover:text-emerald-50/50 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Recent Hires Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-violet-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 z-10 relative">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Recent Hires</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">0%</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 z-10 relative">{recentHires}</div>
          <UserCheck className="absolute right-3 -bottom-3 w-16 h-16 text-slate-100/70 group-hover:text-slate-200/60 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
        </div>
      </div>

      {/* Recent Job Postings Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Job Postings</h3>
          <button 
            className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer" 
            onClick={() => onNavigate('jobs-all')}
          >
            View All Postings
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Job Title</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Applicants</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Posted Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{job.title}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{job.department} • {job.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      job.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {job.applicantsCount > 0 ? (
                        <>
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
                          <span className="text-xs font-medium text-slate-500">
                            {job.applicantsCount} candidate{job.applicantsCount > 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No applicants yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-slate-600 text-xs font-medium">{formatDate(job.posted_date || job.postedDate)}</span>
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
                        className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1 rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                        onClick={() => handleManageJob(job)}
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default DashboardOverview;
