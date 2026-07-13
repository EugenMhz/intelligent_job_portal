import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import RecruiterNavbar from './RecruiterNavbar';
import DashboardOverview from './DashboardOverview';
import JobPostingManagement from './JobPostingManagement';
import ApplicantManagement from './ApplicantManagement';
import Profile from './Profile';
import ChangePasswordAdmin from './ChangePasswordAdmin';
import ApplicantDetails from './ApplicantDetails';

function ApplicantDetailsWrapper({ applicants, onUpdateStatus, onNavigate }) {
  const { id } = useParams();
  const applicant = applicants.find(app => app.id === parseInt(id));

  if (!applicant) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 cursor-pointer mb-4"
          onClick={() => onNavigate('applicants')}
        >
          <span>&larr; Back to Applicant Review</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Applicant not found.</h2>
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

function RecruiterShell() {
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

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Load jobs and applicants from backend API server (connected to Postgres)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const jobsRes = await fetch('http://localhost:5000/api/jobs');
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }

        const applicantsRes = await fetch('http://localhost:5000/api/applicants');
        const applicantsData = await applicantsRes.json();
        setApplicants(applicantsData);
      } catch (err) {
        console.error('Failed to load DB state in recruiter:', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleUpdateApplicantStatus = (candidateId, nextStatus) => {
    fetch(`http://localhost:5000/api/applicants/${candidateId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
    .then(res => {
      if (!res.ok) throw new Error('Status update failed');
      return res.json();
    })
    .then(() => {
      setApplicants(prev => prev.map(app => {
        if (app.id === candidateId) {
          return { ...app, status: nextStatus };
        }
        return app;
      }));
    })
    .catch(err => console.error('Error updating status:', err));
  };

  const handlePostJob = (newJob) => {
    fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiter_id: 6,
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        description: newJob.description,
        skills: newJob.skills
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Post job failed');
      return res.json();
    })
    .then(() => {
      // Reload jobs list from database
      return fetch('http://localhost:5000/api/jobs');
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error('Error posting job:', err));
  };

  const handleToggleShortlist = (candidateId) => {
    const candidate = applicants.find(app => app.id === candidateId);
    if (!candidate) return;
    const nextStatus = candidate.status === 'Shortlisted' ? 'Applied' : 'Shortlisted';
    handleUpdateApplicantStatus(candidateId, nextStatus);
  };

  const handleNavigate = (pageName) => {
    if (pageName === 'dashboard') navigate('/recruiter/dashboard');
    else if (pageName === 'jobs') navigate('/recruiter/jobs');
    else if (pageName === 'applicants') navigate('/recruiter/applicants');
    else if (pageName === 'profile') navigate('/recruiter/profile');
    else if (pageName === 'changepasswordadmin') navigate('/recruiter/changepassword');
    else if (pageName === 'applicant-details') navigate('/recruiter/applicants');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      <RecruiterNavbar user={user} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardOverview jobs={jobs} onNavigate={handleNavigate} onSelectJob={setSelectedJob} />} />
          <Route path="dashboard" element={<DashboardOverview jobs={jobs} onNavigate={handleNavigate} onSelectJob={setSelectedJob} />} />
          <Route path="jobs" element={<JobPostingManagement jobs={jobs} onPostJob={handlePostJob} onNavigate={handleNavigate} />} />
          <Route 
            path="applicants" 
            element={
              <ApplicantManagement 
                selectedJob={selectedJob} 
                jobs={jobs} 
                applicants={applicants} 
                onToggleShortlist={handleToggleShortlist} 
                onNavigate={handleNavigate} 
                onSelectApplicant={(candidate) => navigate(`/recruiter/applicant-details/${candidate.id}`)}
              />
            } 
          />
          <Route path="profile" element={<Profile user={user} onUpdateUser={setUser} onNavigate={handleNavigate} />} />
          <Route path="changepassword" element={<ChangePasswordAdmin onNavigate={handleNavigate} />} />
          <Route path="applicant-details/:id" element={<ApplicantDetailsWrapper applicants={applicants} onUpdateStatus={handleUpdateApplicantStatus} onNavigate={handleNavigate} />} />
        </Routes>
      </main>
    </div>
  );
}

export default RecruiterShell;
