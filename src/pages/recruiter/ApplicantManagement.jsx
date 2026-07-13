import React, { useState, useMemo } from 'react';
import { Filter, RotateCcw, AlertCircle, Plus, Sparkles, ChevronRight } from 'lucide-react';

function ApplicantManagement({ selectedJob, jobs, applicants, onToggleShortlist, onNavigate, onSelectApplicant }) {
  React.useEffect(() => {
    document.title = 'Applicant Review - Intelligent Portal';
  }, []);
  
  // Use selected job or default to the first active job
  const jobContext = selectedJob || jobs.find(j => j.title === 'Senior UX Designer') || jobs[0];

  // Filters State
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minMatchScore, setMinMatchScore] = useState(75);
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Match %');

  // Hardcoded skills to match wireframe
  const filterSkills = [
    { name: 'Figma', count: 84 },
    { name: 'User Research', count: 42 },
    { name: 'Prototyping', count: 31 },
    { name: 'React', count: 12 }
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSkills([]);
    setMinMatchScore(75);
    setExperienceLevel('All');
  };

  // Toggle skill check
  const handleSkillToggle = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Filter and Sort Candidates
  const filteredApplicants = useMemo(() => {
    // Filter applicants that belong to the current job (or if none specify, show all for demo)
    let list = applicants.filter(app => app.jobId === jobContext.id || !app.jobId);

    // Filter by Active Tab
    if (activeTab === 'Shortlisted') {
      list = list.filter(app => app.status === 'Shortlisted');
    } else if (activeTab === 'Interviewing') {
      list = list.filter(app => app.status === 'Interviewing');
    }

    // Filter by Skills Checkbox
    if (selectedSkills.length > 0) {
      list = list.filter(app => 
        app.skills.some(skill => 
          selectedSkills.some(sel => skill.toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    // Filter by Min Match Score
    list = list.filter(app => app.matchScore >= minMatchScore);

    // Filter by Experience Level
    if (experienceLevel !== 'All') {
      list = list.filter(app => app.experienceLevel === experienceLevel);
    }

    // Sorting
    if (sortBy === 'Highest Match %') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'Newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [applicants, jobContext.id, activeTab, selectedSkills, minMatchScore, experienceLevel, sortBy]);

  // Statistics counters
  const totalCount = applicants.filter(app => app.jobId === jobContext.id || !app.jobId).length;
  const shortlistedCount = applicants.filter(app => (app.jobId === jobContext.id || !app.jobId) && app.status === 'Shortlisted').length;
  const interviewingCount = applicants.filter(app => (app.jobId === jobContext.id || !app.jobId) && app.status === 'Interviewing').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span className="hover:text-slate-600 cursor-pointer" onClick={() => onNavigate('dashboard')}>Dashboard</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-violet-600">Active Jobs</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {jobContext.title} 
              <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">#{jobContext.id}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Reviewing {totalCount} applicants for this position</p>
          </div>
          <button 
            className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-violet-200 cursor-pointer shrink-0"
            onClick={() => onNavigate('jobs')}
          >
            <Plus size={16} strokeWidth={2.5} />
            Post New Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 self-start space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              Filters
            </span>
            <button 
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1 cursor-pointer" 
              onClick={handleResetFilters}
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>

          {/* Skills Checklist Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Top Skills Required</h3>
            <div className="space-y-2.5">
              {filterSkills.map((skill) => (
                <label key={skill.name} className="flex justify-between items-center text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      className="accent-violet-600 w-4 h-4 rounded text-violet-600 focus:ring-violet-400 border-slate-300"
                      checked={selectedSkills.includes(skill.name)}
                      onChange={() => handleSkillToggle(skill.name)}
                    />
                    <span className="group-hover:text-slate-900">{skill.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 group-hover:bg-slate-100 px-2 py-0.5 rounded-full border border-slate-100">
                    {skill.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Min Match Score Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Min. Match Score</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100/80">
                {minMatchScore}%
              </span>
            </div>
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full accent-violet-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer border border-slate-200/50" 
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Experience Level Filter */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Experience Level</h3>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer font-medium" 
              value={experienceLevel} 
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="All">All Experience Levels</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid-Senior Level">Mid-Senior Level</option>
              <option value="Director/Lead">Director/Lead</option>
            </select>
          </div>
        </aside>

        {/* Right Column - Candidate List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and State tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="flex flex-wrap gap-1">
              <button 
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'All' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('All')}
              >
                All ({totalCount})
              </button>
              <button 
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'Shortlisted' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('Shortlisted')}
              >
                Shortlisted ({shortlistedCount})
              </button>
              <button 
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'Interviewing' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('Interviewing')}
              >
                Interviewing ({interviewingCount})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase shrink-0">
              <span>Sort by:</span>
              <select 
                className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white text-slate-700 outline-none focus:border-violet-500 font-semibold cursor-pointer" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Highest Match %">Highest Match</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Candidate Card List */}
          <div className="space-y-4">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-violet-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-base shrink-0 uppercase border border-violet-200/50">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="space-y-1">
                      <h3 
                        className="font-bold text-slate-900 text-base hover:text-violet-600 transition-colors cursor-pointer"
                        onClick={() => onSelectApplicant(candidate)}
                      >
                        {candidate.name}
                      </h3>
                      <span className="text-xs text-slate-500 block">
                        {candidate.role} at <strong className="text-slate-700 font-medium">{candidate.company}</strong>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {candidate.skills.map((skill, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="flex flex-col md:items-end justify-center shrink-0 min-w-[110px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} className="text-violet-500" />
                      AI Match Score
                    </span>
                    <span className={`text-sm font-extrabold mt-1 ${
                      candidate.matchScore >= 90 ? 'text-emerald-600 font-black' : 'text-violet-600'
                    }`}>
                      {candidate.matchScore}% Match
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-32">
                    <button 
                      className={`w-full px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        candidate.status === 'Shortlisted' 
                          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' 
                          : 'bg-violet-600 hover:bg-violet-700 text-white border-transparent shadow-sm'
                      }`}
                      onClick={() => onToggleShortlist(candidate.id)}
                    >
                      {candidate.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
                    </button>
                    <button 
                      className="w-full px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center" 
                      onClick={() => onSelectApplicant(candidate)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl text-center py-12 px-6 flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No candidates match these criteria</h3>
                <p className="text-sm text-slate-400 max-w-sm">Try resetting the score slider, deselecting skills, or switching filter criteria.</p>
              </div>
            )}
          </div>

          {filteredApplicants.length > 0 && (
            <div className="flex justify-center pt-4">
              <button 
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                onClick={() => alert('All candidates loaded!')}
              >
                Load More Applicants
              </button>
            </div>
          )}
        </div>
      </div>
      
      <footer className="text-center text-xs text-slate-400 border-t border-slate-100 pt-6 mt-12">
        &copy; 2026 Intelligent Job Portal. Powered by advanced matching algorithms.
      </footer>
    </div>
  );
}

export default ApplicantManagement;
