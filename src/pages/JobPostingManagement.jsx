import React, { useState } from 'react';

function JobPostingManagement({ jobs, onPostJob, onNavigate }) {
  React.useEffect(() => {
    document.title = 'Job Posting';
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
    <div className="page-container">
      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Job Management</h1>
          <p className="page-subtitle">Design, publish, and manage your organization's career opportunities.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sort-bar" style={{ marginBottom: '32px', padding: '6px 12px' }}>
        <div className="status-tabs">
          <button className="tab-btn active">Create New Posting</button>
          <button className="tab-btn" onClick={() => onNavigate('dashboard')}>
            Active Postings
            <span className="badge badge-primary" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px' }}>
              {jobs.filter(j => j.status === 'Active').length}
            </span>
          </button>
          <button className="tab-btn" onClick={() => onNavigate('dashboard')}>Archived</button>
        </div>
      </div>

      <div className="job-posting-grid">
        {/* Left Column - Form */}
        <div className="card">
          <h2 className="form-card-title">Job Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Senior Product Designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label className="form-label">Department</label>
                <select className="select-dropdown" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="form-label">Location</label>
                <select className="select-dropdown" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
                  <option value="London, UK">London, UK</option>
                  <option value="New York, NY">New York, NY</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe the role, responsibilities, and team culture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div className="skills-input-wrapper">
                {skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                    <button type="button" className="remove-tag-btn" onClick={() => removeSkill(idx)}>
                      &times;
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  placeholder={skills.length === 0 ? "Add skill..." : ""} 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
              </div>
              <p className="form-help-text">Press enter or comma to add a skill tag</p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Post Job Opportunity
            </button>
          </form>
        </div>

        {/* Right Column - Recently Active List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Recently Active</h2>
            <button className="reset-filter-btn" onClick={() => onNavigate('dashboard')}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="active-feed-card">
                <div className="feed-header">
                  <div>
                    <h3 className="feed-title">{job.title}</h3>
                    <span className="feed-meta">Posted {job.postedDate} • {job.location}</span>
                  </div>
                  <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                    {job.status}
                  </span>
                </div>
                
                <div className="feed-footer">
                  <div className="applicant-avatars">
                    {[...Array(Math.min(3, Math.ceil(job.applicantsCount / 5)))].map((_, i) => (
                      <div key={i} className="avatar-stack-item">
                        {String.fromCharCode(65 + (job.id + i) % 26)}
                      </div>
                    ))}
                    {job.applicantsCount > 3 && (
                      <div className="avatar-stack-item avatar-stack-more">
                        +{job.applicantsCount - 2}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>
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
