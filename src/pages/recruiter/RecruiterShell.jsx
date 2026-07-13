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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Authenticate user and load recruiter profile
  useEffect(() => {
    const sessionStr = localStorage.getItem("user");
    if (!sessionStr) {
      navigate("/");
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role !== "recruiter") {
      navigate("/");
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch recruiter profile
        const profRes = await fetch(`http://localhost:5000/api/recruiters/${session.id}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          setUser({
            id: session.id,
            name: profData.full_name || session.name || "Recruiter",
            role: profData.title || "Recruiter",
            email: session.email,
            phone: profData.phone || "",
            department: profData.department || "",
            location: profData.location || "",
            bio: profData.bio || ""
          });
        } else {
          // Default fields for newly registered recruiters
          setUser({
            id: session.id,
            name: session.name || "Recruiter",
            role: "Recruiter",
            email: session.email,
            phone: "",
            department: "",
            location: "",
            bio: ""
          });
        }

        // Fetch jobs and applicants (filtered by recruiterId)
        const jobsRes = await fetch(`http://localhost:5000/api/jobs?recruiterId=${session.id}`);
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }

        const applicantsRes = await fetch(`http://localhost:5000/api/applicants?recruiterId=${session.id}`);
        const applicantsData = await applicantsRes.json();
        setApplicants(applicantsData);
      } catch (err) {
        console.error('Failed to load DB state in recruiter:', err);
      }
    };
    fetchInitialData();
  }, [navigate]);

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
    if (!user) return;
    fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiter_id: user.id,
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        description: newJob.description,
        skills: newJob.skills,
        status: newJob.status
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Post job failed');
      return res.json();
    })
    .then(() => {
      return fetch(`http://localhost:5000/api/jobs?recruiterId=${user.id}`);
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error('Error posting job:', err));
  };

  const handleUpdateProfile = (updatedProfile) => {
    if (!user || !user.id) return;
    
    fetch(`http://localhost:5000/api/recruiters/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updatedProfile.name,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        department: updatedProfile.department,
        location: updatedProfile.location,
        bio: updatedProfile.bio
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    })
    .then(data => {
      setUser({
        id: user.id,
        name: data.full_name,
        role: data.title,
        email: user.email,
        phone: data.phone,
        department: data.department,
        location: data.location,
        bio: data.bio
      });
    })
    .catch(err => console.error('Error updating profile:', err));
  };

  const handleUpdateJob = (updatedJob) => {
    fetch(`http://localhost:5000/api/jobs/${updatedJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedJob.title,
        department: updatedJob.department,
        location: updatedJob.location,
        description: updatedJob.description,
        status: updatedJob.status
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update job');
      return res.json();
    })
    .then(() => {
      return fetch(`http://localhost:5000/api/jobs?recruiterId=${user.id}`);
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error('Error updating job:', err));
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
    else if (pageName === 'jobs-all') navigate('/recruiter/jobs?tab=all-postings');
    else if (pageName === 'applicants') navigate('/recruiter/applicants');
    else if (pageName === 'profile') navigate('/recruiter/profile');
    else if (pageName === 'changepasswordadmin') navigate('/recruiter/changepassword');
    else if (pageName === 'applicant-details') navigate('/recruiter/applicants');
  };

  if (!user) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center font-sans">
        <div className="text-slate-500 font-semibold animate-pulse">Loading Recruiter Console...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans">
      <RecruiterNavbar user={user} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardOverview jobs={jobs} applicants={applicants} onNavigate={handleNavigate} onSelectJob={setSelectedJob} onUpdateJob={handleUpdateJob} />} />
          <Route path="dashboard" element={<DashboardOverview jobs={jobs} applicants={applicants} onNavigate={handleNavigate} onSelectJob={setSelectedJob} onUpdateJob={handleUpdateJob} />} />
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
          <Route path="profile" element={<Profile user={user} jobs={jobs} applicants={applicants} onUpdateUser={handleUpdateProfile} onNavigate={handleNavigate} />} />
          <Route path="changepassword" element={<ChangePasswordAdmin onNavigate={handleNavigate} />} />
          <Route path="applicant-details/:id" element={<ApplicantDetailsWrapper applicants={applicants} onUpdateStatus={handleUpdateApplicantStatus} onNavigate={handleNavigate} />} />
        </Routes>
      </main>
    </div>
  );
}

export default RecruiterShell;
