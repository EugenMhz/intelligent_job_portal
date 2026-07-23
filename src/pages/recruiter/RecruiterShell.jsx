import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
  const [deletingJobId, setDeletingJobId] = useState(null);

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
        const profRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruiters/${session.id}`);
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
            bio: profData.bio || "",
            profile_picture_url: profData.profile_picture_url || ""
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
            bio: "",
            profile_picture_url: ""
          });
        }

        // Fetch jobs and applicants (filtered by recruiterId)
        const jobsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs?recruiterId=${session.id}`);
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }

        const applicantsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/applicants?recruiterId=${session.id}`);
        const applicantsData = await applicantsRes.json();
        setApplicants(applicantsData);
      } catch (err) {
        console.error('Failed to load DB state in recruiter:', err);
      }
    };
    fetchInitialData();
  }, [navigate]);

  const handleUpdateApplicantStatus = (candidateId, nextStatus) => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/applicants/${candidateId}/status`, {
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
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/jobs', {
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
      return fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs?recruiterId=${user.id}`);
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error('Error posting job:', err));
  };

  const handleUpdateProfile = (updatedProfile) => {
    if (!user || !user.id) return;
    
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruiters/${user.id}`, {
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
        bio: data.bio,
        profile_picture_url: data.profile_picture_url || user.profile_picture_url || ""
      });
    })
    .catch(err => console.error('Error updating profile:', err));
  };

  const handleUpdateJob = (updatedJob) => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${updatedJob.id}`, {
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
      return fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs?recruiterId=${user.id}`);
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error('Error updating job:', err));
  };

  const handleDeleteJob = (jobId) => {
    setDeletingJobId(jobId);
  };

  const confirmDeleteJob = () => {
    if (!deletingJobId) return;
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${deletingJobId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to delete job');
      return res.json();
    })
    .then(() => {
      setDeletingJobId(null);
      return fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs?recruiterId=${user.id}`);
    })
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => {
      console.error('Error deleting job:', err);
      setDeletingJobId(null);
    });
  };

  const handleToggleShortlist = (candidateId) => {
    const candidate = applicants.find(app => app.id === candidateId);
    if (!candidate) return;
    const nextStatus = candidate.status === 'Shortlisted' ? 'Applied' : 'Shortlisted';
    handleUpdateApplicantStatus(candidateId, nextStatus);
  };

  const handleNavigate = (pageName, jobId) => {
    if (pageName === 'dashboard') navigate('/recruiter/dashboard');
    else if (pageName === 'jobs') navigate('/recruiter/jobs');
    else if (pageName === 'jobs-all') navigate('/recruiter/jobs?tab=all-postings');
    else if (pageName === 'applicants') {
      if (jobId) {
        navigate(`/recruiter/applicants?jobId=${jobId}`);
      } else {
        navigate('/recruiter/applicants');
      }
    }
    else if (pageName === 'profile') navigate('/recruiter/profile');
    else if (pageName === 'changepasswordadmin') navigate('/recruiter/changepassword');
    else if (pageName === 'applicant-details') {
      if (jobId) {
        navigate(`/recruiter/applicants?jobId=${jobId}`);
      } else {
        navigate('/recruiter/applicants');
      }
    }
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
          <Route path="/" element={<DashboardOverview jobs={jobs} applicants={applicants} onNavigate={handleNavigate} onSelectJob={setSelectedJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} />} />
          <Route path="dashboard" element={<DashboardOverview jobs={jobs} applicants={applicants} onNavigate={handleNavigate} onSelectJob={setSelectedJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} />} />
          <Route path="jobs" element={<JobPostingManagement jobs={jobs} onPostJob={handlePostJob} onNavigate={handleNavigate} onDeleteJob={handleDeleteJob} onUpdateJob={handleUpdateJob} />} />
          <Route 
            path="applicants" 
            element={
              <ApplicantManagement 
                selectedJob={selectedJob} 
                jobs={jobs} 
                applicants={applicants} 
                onUpdateStatus={handleUpdateApplicantStatus} 
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

      {deletingJobId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setDeletingJobId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Delete job?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this job listing? This action cannot be undone and will delete all candidate applications associated with it.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setDeletingJobId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteJob}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterShell;
