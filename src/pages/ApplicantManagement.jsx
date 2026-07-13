import React, { useState, useMemo } from 'react';

function ApplicantManagement({ selectedJob, jobs, applicants, onToggleShortlist, onNavigate, onSelectApplicant }) {
  React.useEffect(() => {
    document.title = 'Applicant Review';
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
    <div className="page-container">
      {/* Dashboard Breadcrumbs / Context Header */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Dashboard</span>
            <span>&gt;</span>
            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Active Jobs</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '26px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {jobContext.title} 
              <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>#{jobContext.id}</span>
            </h1>
            <p className="page-subtitle">Reviewing {totalCount} applicants for this position</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('jobs')}>
              Post New Job
            </button>
          </div>
        </div>
      </div>

      <div className="candidate-grid">
        {/* Left Column - Sidebar Filters */}
        <aside className="filters-card">
          <div className="filters-header">
            <span className="filters-title">Filters</span>
            <button className="reset-filter-btn" onClick={handleResetFilters}>Reset All</button>
          </div>

          {/* Skills Checklist Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Top Skills Required</h3>
            <div className="checkbox-group">
              {filterSkills.map((skill) => (
                <label key={skill.name} className="checkbox-label">
                  <div className="checkbox-left">
                    <input 
                      type="checkbox" 
                      checked={selectedSkills.includes(skill.name)}
                      onChange={() => handleSkillToggle(skill.name)}
                    />
                    <span>{skill.name}</span>
                  </div>
                  <span className="checkbox-count">{skill.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Min Match Score Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Min. Match Score ({minMatchScore}%)</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="range-slider" 
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
              />
              <div className="slider-values">
                <span>0%</span>
                <span style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                  {minMatchScore}%
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Experience Level Filter */}
          <div className="filter-section" style={{ marginBottom: '0px' }}>
            <h3 className="filter-section-title">Experience Level</h3>
            <select 
              className="select-dropdown" 
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
        <div>
          {/* Sorting and State tabs */}
          <div className="sort-bar">
            <div className="status-tabs">
              <button 
                className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => setActiveTab('All')}
              >
                All ({totalCount})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'Shortlisted' ? 'active' : ''}`}
                onClick={() => setActiveTab('Shortlisted')}
              >
                Shortlisted ({shortlistedCount})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'Interviewing' ? 'active' : ''}`}
                onClick={() => setActiveTab('Interviewing')}
              >
                Interviewing ({interviewingCount})
              </button>
            </div>

            <div className="sort-select-wrapper">
              <span>Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Highest Match %">Highest Match %</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Candidate Card List */}
          <div className="candidate-cards-container">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((candidate) => (
                <div key={candidate.id} className="candidate-card">
                  <div className="candidate-main-info">
                    <div className="candidate-photo-placeholder">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="candidate-details">
                      <h3 className="candidate-name">{candidate.name}</h3>
                      <span className="candidate-subtext">{candidate.role} at <strong>{candidate.company}</strong></span>
                      <div className="candidate-tags">
                        {candidate.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="candidate-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="match-score-section">
                    <span className="match-score-label">AI Match Score</span>
                    <span className={`match-score-value ${candidate.matchScore >= 90 ? 'high' : ''}`}>
                      {candidate.matchScore}% Match
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="candidate-actions">
                    <button 
                      className={`btn ${candidate.status === 'Shortlisted' ? 'btn-secondary' : 'btn-primary'}`} 
                      onClick={() => onToggleShortlist(candidate.id)}
                      style={{ padding: '8px 14px', width: '100%', fontSize: '13px' }}
                    >
                      {candidate.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => onSelectApplicant(candidate)}
                      style={{ padding: '8px 14px', width: '100%', fontSize: '13px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0012 20c-1.102 0-2.167-.157-3.173-.448l-.004-.007C8.322 19.23 8 18.183 8 17.07a4.125 4.125 0 017.532-2.492M15 17.5a3 3 0 11-6 0 3 3 0 016 0zm-8.25-3c1.11 0 2.222.186 3.25.57m-3.25-3.07a11.386 11.386 0 00-3 2.508c-.285.32-.507.72-.507 1.15v2.5M10.5 8.25a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>No candidates match these criteria</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try resetting the score slider or skill filters.</p>
              </div>
            )}
          </div>

          {filteredApplicants.length > 0 && (
            <div className="load-more-container">
              <button className="btn btn-secondary" onClick={() => alert('All candidates loaded!')} style={{ borderRadius: 'var(--radius-sm)' }}>
                Load More Applicants
              </button>
            </div>
          )}
        </div>
      </div>
      
      <footer className="footer">
        &copy; 2024 Intelligent Job Portal. Powered by advanced matching algorithms.
      </footer>
    </div>
  );
}

export default ApplicantManagement;
