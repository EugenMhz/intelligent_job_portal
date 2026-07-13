import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardOverview from './pages/DashboardOverview';
import JobPostingManagement from './pages/JobPostingManagement';
import ApplicantManagement from './pages/ApplicantManagement';
import Profile from './pages/Profile';
import ChangePasswordAdmin from './pages/ChangePasswordAdmin';
import ApplicantDetails from './pages/ApplicantDetails';

function ApplicantDetailsWrapper({ applicants, onUpdateStatus, onNavigate }) {
  const { id } = useParams();
  const applicant = applicants.find(app => app.id === parseInt(id));

  if (!applicant) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '16px' }} onClick={() => onNavigate('applicants')}>
          <span>&larr; Back to Applicant Review</span>
        </div>
        <h2>Applicant not found.</h2>
      </div>
    );
  }

  return (
    <ApplicantDetails 
      applicant={applicant} 
      onUpdateStatus={onUpdateStatus} 
      onNavigate={onNavigate} 
    />
  );
}

function App() {
  const [user, setUser] = useState({
    name: 'Jane Doe',
    role: 'Senior Recruiter',
    email: 'jane.doe@intelligentportal.com',
    phone: '+1 (555) 382-9012',
    department: 'Talent Acquisition',
    location: 'San Francisco, CA (Remote)',
    bio: 'Passionate about connecting exceptional engineering and design talent with meaningful opportunities. 8+ years of technical recruiting experience.',
  });
  const navigate = useNavigate();
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname;
    if (path.startsWith('/jobs')) return 'jobs';
    if (path.startsWith('/applicants')) return 'applicants';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/changepasswordadmin')) return 'changepasswordadmin';
    if (path.startsWith('/applicant-details')) return 'applicant-details';
    return 'dashboard'; // default
  };

  const currentPage = getPageName();

  const handleUpdateApplicantStatus = (candidateId, nextStatus) => {
    setApplicants(applicants.map(app => {
      if (app.id === candidateId) {
        return { ...app, status: nextStatus };
      }
      return app;
    }));
  };
  
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

  const handleNavigate = (pageName) => {
    if (pageName === 'dashboard') navigate('/dashboard');
    else if (pageName === 'jobs') navigate('/jobs');
    else if (pageName === 'applicants') navigate('/applicants');
    else if (pageName === 'profile') navigate('/profile');
    else if (pageName === 'changepasswordadmin') navigate('/changepasswordadmin');
    else if (pageName === 'applicant-details') navigate('/applicants');
  };

  return (
    <div className="app-shell">
      {/* Top navigation header */}
      <header className="navbar">
        {/* Brand - text only, no logo. Click redirects to dashboard */}
        <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <span className="navbar-title">Intelligent Portal</span>
        </div>

        {/* Menu items and profile aligned to the right */}
        <div className="navbar-right">
          {/* Nav Items */}
          <nav className="navbar-menu">
            <button 
              className={`navbar-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>

            <button 
              className={`navbar-item ${currentPage === 'jobs' ? 'active' : ''}`}
              onClick={() => navigate('/jobs')}
            >
              Job Posting
            </button>

            <button 
              className={`navbar-item ${currentPage === 'applicants' ? 'active' : ''}`}
              onClick={() => {
                // If no job is selected, default to the first one so it's not empty
                if (!selectedJob && jobs.length > 0) {
                  setSelectedJob(jobs[0]);
                }
                navigate('/applicants');
              }}
            >
              Applicant Review
            </button>
          </nav>

          {/* Header Profile Avatar option only (no text) */}
          <div className="navbar-profile" onClick={() => navigate('/profile')} title="View Profile">
            <div className="user-avatar">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </header>

      {/* Main content frame */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardOverview jobs={jobs} onNavigate={handleNavigate} onSelectJob={setSelectedJob} />} />
          <Route path="/dashboard" element={<DashboardOverview jobs={jobs} onNavigate={handleNavigate} onSelectJob={setSelectedJob} />} />
          <Route path="/jobs" element={<JobPostingManagement jobs={jobs} onPostJob={handlePostJob} onNavigate={handleNavigate} />} />
          <Route 
            path="/applicants" 
            element={
              <ApplicantManagement 
                selectedJob={selectedJob} 
                jobs={jobs} 
                applicants={applicants} 
                onToggleShortlist={handleToggleShortlist} 
                onNavigate={handleNavigate} 
                onSelectApplicant={(candidate) => navigate(`/applicant-details/${candidate.id}`)}
              />
            } 
          />
          <Route path="/profile" element={<Profile user={user} onUpdateUser={setUser} onNavigate={handleNavigate} />} />
          <Route path="/changepasswordadmin" element={<ChangePasswordAdmin onNavigate={handleNavigate} />} />
          <Route path="/applicant-details/:id" element={<ApplicantDetailsWrapper applicants={applicants} onUpdateStatus={handleUpdateApplicantStatus} onNavigate={handleNavigate} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
