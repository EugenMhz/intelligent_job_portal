import React from 'react';

function DashboardOverview({ jobs, onNavigate, onSelectJob }) {
  React.useEffect(() => {
    document.title = 'Dashboard';
  }, []);
  // Calculate dynamic stats
  const totalJobsPosted = 20 + jobs.length; // Figma says 24 initially
  const activeApplicants = 1160 + jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0); // Figma says 1,284
  const recentHires = 12;

  const handleManageJob = (job) => {
    onSelectJob(job);
    onNavigate('applicants');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Manage your hiring pipeline and optimize your talent search.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('jobs')}>
          <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a New Job
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Jobs Posted</span>
            <span className="stat-indicator badge-primary">+12%</span>
          </div>
          <div className="stat-value">{totalJobsPosted}</div>
          <svg className="stat-background-pattern" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
          </svg>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Applicants</span>
            <span className="stat-indicator badge-success">+8%</span>
          </div>
          <div className="stat-value">{activeApplicants.toLocaleString()}</div>
          <svg className="stat-background-pattern" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 5 1.34 5 8c0 1.66 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Recent Hires</span>
            <span className="stat-indicator badge-warning" style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#64748B' }}>0%</span>
          </div>
          <div className="stat-value">{recentHires}</div>
          <svg className="stat-background-pattern" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {/* Recent Job Postings Table Section */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Recent Job Postings</h3>
          <button className="reset-filter-btn" onClick={() => onNavigate('jobs')} style={{ fontSize: '14px' }}>
            View All Postings
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Posted Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="job-title-cell">
                      <span className="job-cell-title">{job.title}</span>
                      <span className="job-cell-subtext">{job.department} • {job.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      job.status === 'Active' ? 'badge-success' : 
                      job.status === 'Draft' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {job.applicantsCount > 0 ? (
                        <>
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
                          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            {job.applicantsCount} candidate{job.applicantsCount > 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No applicants yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>{job.postedDate}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => handleManageJob(job)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
