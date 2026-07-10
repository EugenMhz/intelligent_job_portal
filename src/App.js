import React, { useState } from 'react';
import DashboardOverview from './pages/DashboardOverview';
import JobPostingManagement from './pages/JobPostingManagement';
import ApplicantManagement from './pages/ApplicantManagement';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Seed initial jobs based on wireframe data
  const [jobs, setJobs] = useState([
    { 
      id: 10293, 
      title: 'Senior UX Designer', 
      department: 'Product Design', 
      location: 'Remote', 
      status: 'Active', 
      postedDate: 'Oct 14, 2023', 
      applicantsCount: 4 
    },
    { 
      id: 10294, 
      title: 'Senior Frontend Engineer', 
      department: 'Engineering', 
      location: 'Remote', 
      status: 'Active', 
      postedDate: 'Oct 12, 2023', 
      applicantsCount: 12 
    },
    { 
      id: 10295, 
      title: 'Product Designer', 
      department: 'Design', 
      location: 'San Francisco, CA', 
      status: 'Active', 
      postedDate: 'Oct 08, 2023', 
      applicantsCount: 45 
    },
    { 
      id: 10296, 
      title: 'Marketing Manager', 
      department: 'Marketing', 
      location: 'New York, NY', 
      status: 'Draft', 
      postedDate: 'Oct 05, 2023', 
      applicantsCount: 0 
    },
    { 
      id: 10297, 
      title: 'DevOps Engineer', 
      department: 'Infrastructure', 
      location: 'Hybrid', 
      status: 'Closed', 
      postedDate: 'Sep 28, 2023', 
      applicantsCount: 8 
    }
  ]);

  // Seed initial applicants matching the wireframe's Alex, Sarah, Marcus, Elena
  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: 'Alex Rivera',
      role: 'Sr. Designer',
      company: 'Creative Flow',
      matchScore: 98,
      skills: ['Figma Expert', 'UI Design', 'User Research', 'Prototyping'],
      status: 'Applied',
      experienceLevel: 'Mid-Senior Level',
      jobId: 10293
    },
    {
      id: 2,
      name: 'Sarah Chen',
      role: 'UX Architect',
      company: 'TechPulse',
      matchScore: 92,
      skills: ['Prototyping', 'Strategy', 'Sketch', 'Figma'],
      status: 'Shortlisted',
      experienceLevel: 'Mid-Senior Level',
      jobId: 10293
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      role: 'Visual Designer',
      company: 'Spectrum',
      matchScore: 85,
      skills: ['Design Systems', 'Iconography', 'Figma'],
      status: 'Applied',
      experienceLevel: 'Entry Level',
      jobId: 10293
    },
    {
      id: 4,
      name: 'Elena Petrova',
      role: 'UI/UX Lead',
      company: 'BrightDev',
      matchScore: 79,
      skills: ['Leadership', 'Figma', 'User Research'],
      status: 'Applied',
      experienceLevel: 'Director/Lead',
      jobId: 10293
    }
  ]);

  // Selected job context for Applicant Management
  const [selectedJob, setSelectedJob] = useState(null);

  // Handler to post a new job
  const handlePostJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  // Handler to shortlist / toggle candidate status
  const handleToggleShortlist = (candidateId) => {
    setApplicants(applicants.map(app => {
      if (app.id === candidateId) {
        const nextStatus = app.status === 'Shortlisted' ? 'Applied' : 'Shortlisted';
        
        // Dynamically adjust the corresponding job's applicantCount if needed
        // (Just for state integration demo)
        const job = jobs.find(j => j.id === app.jobId);
        if (job) {
          setJobs(jobs.map(j => {
            if (j.id === job.id) {
              return {
                ...j,
                // Shortlisting doesn't change total applicant count, but we show integration
              };
            }
            return j;
          }));
        }
        
        return { ...app, status: nextStatus };
      }
      return app;
    }));
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardOverview 
            jobs={jobs} 
            onNavigate={setCurrentPage} 
            onSelectJob={setSelectedJob} 
          />
        );
      case 'jobs':
        return (
          <JobPostingManagement 
            jobs={jobs} 
            onPostJob={handlePostJob} 
            onNavigate={setCurrentPage} 
          />
        );
      case 'applicants':
        return (
          <ApplicantManagement 
            selectedJob={selectedJob} 
            jobs={jobs} 
            applicants={applicants} 
            onToggleShortlist={handleToggleShortlist} 
            onNavigate={setCurrentPage} 
          />
        );
      default:
        return (
          <DashboardOverview 
            jobs={jobs} 
            onNavigate={setCurrentPage} 
            onSelectJob={setSelectedJob} 
          />
        );
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div>
          {/* Logo Brand */}
          <div className="sidebar-brand">
            <div className="sidebar-logo">I</div>
            <span className="sidebar-title">Intelligent Portal</span>
          </div>

          {/* Nav Items */}
          <nav className="sidebar-menu">
            <button 
              className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </button>

            <button 
              className={`sidebar-item ${currentPage === 'jobs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('jobs')}
            >
              <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.67 12.88a2.25 2.25 0 11-3.34 0M2.25 12a10.5 10.5 0 002.5 6.84M21.75 12a10.5 10.5 0 01-2.5 6.84" />
              </svg>
              Job Posting
            </button>

            <button 
              className={`sidebar-item ${currentPage === 'applicants' ? 'active' : ''}`}
              onClick={() => {
                // If no job is selected, default to the first one so it's not empty
                if (!selectedJob && jobs.length > 0) {
                  setSelectedJob(jobs[0]);
                }
                setCurrentPage('applicants');
              }}
            >
              <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Applicant Review
            </button>
          </nav>
        </div>

        {/* Sidebar Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <span className="user-name">Jane Doe</span>
            <span className="user-role">Senior Recruiter</span>
          </div>
        </div>
      </aside>

      {/* Main content frame */}
      <main className="main-content">
        {renderActivePage()}
      </main>
    </div>
  );
}

export default App;
