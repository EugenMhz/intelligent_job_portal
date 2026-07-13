import React, { useState } from 'react';

function ApplicantDetails({ applicant, onUpdateStatus, onNavigate }) {
  React.useEffect(() => {
    document.title = applicant ? `${applicant.name} - Applicant Details` : 'Applicant Details';
  }, [applicant]);
  const [status, setStatus] = useState(applicant.status);
  const [showToast, setShowToast] = useState(false);

  // Generate mock details based on candidate ID to look complete and rich
  const detailsMap = {
    1: {
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 902-1143',
      education: 'M.S. in Human-Computer Interaction - Georgia Institute of Technology',
      bio: 'A detail-oriented senior product designer with a passion for designing scalable systems and beautiful, intuitive interfaces. Over 6 years of experience in product design across SaaS and fintech companies.',
      workHistory: [
        { role: 'Sr. Product Designer', company: 'Creative Flow', period: '2021 - Present', desc: 'Led redesign of the core dashboard application, resulting in a 40% increase in user retention. Established and documented the company\'s first unified design system.' },
        { role: 'UX Designer', company: 'DesignStudio', period: '2018 - 2021', desc: 'Designed custom web applications for client companies. Conducted user research, usability testing, and built complex clickable wireframe prototypes.' }
      ]
    },
    2: {
      email: 'sarah.chen@example.com',
      phone: '+1 (555) 309-8874',
      education: 'B.F.A. in Graphic Design - Rhode Island School of Design',
      bio: 'UX Architect specializing in strategy, information architecture, and prototyping. Love mapping out user flows and solving intricate navigation puzzles for complex digital tools.',
      workHistory: [
        { role: 'UX Architect', company: 'TechPulse', period: '2020 - Present', desc: 'Created high-fidelity interactive prototype layouts. Improved user onboarding flow, reducing customer churn by 18%.' },
        { role: 'Visual Designer', company: 'PixelPerfect', period: '2017 - 2020', desc: 'Crafted marketing collaterals and custom interface illustrations. Partnered with developers to build functional, pixel-perfect layouts.' }
      ]
    },
    3: {
      email: 'marcus.johnson@example.com',
      phone: '+1 (555) 441-2093',
      education: 'B.S. in Web Design & Interactive Media - Academy of Art University',
      bio: 'Visual designer with an entry-level focus on design systems, typography, and iconography. Excels in Figma, Sketch, and Adobe Creative Cloud suites.',
      workHistory: [
        { role: 'Junior Visual Designer', company: 'Spectrum', period: '2022 - Present', desc: 'Assisted senior designers in managing the company\'s visual asset library. Created high-quality icons and layout illustrations.' }
      ]
    },
    4: {
      email: 'elena.petrova@example.com',
      phone: '+1 (555) 887-3210',
      education: 'B.S. in Computer Science & Design - Carnegie Mellon University',
      bio: 'Experienced UI/UX director and lead designer. Expert at building high-performing design teams, running detailed user research campaigns, and aligning product visual design with company-wide strategic business targets.',
      workHistory: [
        { role: 'UI/UX Lead', company: 'BrightDev', period: '2019 - Present', desc: 'Manage a team of 5 designers. Decreased user task completion times by 25% by streamlining key operations.' },
        { role: 'Lead Product Designer', company: 'CoreFintech', period: '2015 - 2019', desc: 'Supervised end-to-end product development for a leading mobile investment client app.' }
      ]
    }
  };

  const defaultDetails = {
    email: 'candidate@example.com',
    phone: '+1 (555) 000-0000',
    education: 'Degree in Design / Computer Science - University of Science',
    bio: 'Experienced professional with a strong track record of success. Possesses key industry skills and thrives in collaborative environments.',
    workHistory: [
      { role: 'Professional', company: applicant.company || 'Tech Corp', period: '2021 - Present', desc: 'Contributed to major client deliverables and scaled internal operational metrics.' }
    ]
  };

  const candidateDetails = detailsMap[applicant.id] || defaultDetails;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onUpdateStatus(applicant.id, newStatus);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="page-container profile-container">
      {/* Breadcrumbs */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', marginBottom: '24px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={() => onNavigate('applicants')}
        >
          <span>&larr; Back to Applicant Review</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '28px' }}>{applicant.name}</h1>
            <p className="page-subtitle">{applicant.role} at <strong>{applicant.company}</strong></p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <select 
                className="select-dropdown" 
                value={status} 
                onChange={handleStatusChange}
                style={{ minWidth: '160px', padding: '8px 12px' }}
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-layout">
        {/* Left column info */}
        <div className="card profile-sidebar-card">
          <div className="profile-avatar-large">
            {applicant.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="profile-user-name" style={{ fontSize: '18px' }}>{applicant.name}</h2>
          <p className="profile-user-role" style={{ fontSize: '13px', marginBottom: '16px' }}>Match: {applicant.matchScore}%</p>
          
          <span 
            className={`badge ${applicant.matchScore >= 90 ? 'badge-success' : 'badge-primary'}`}
            style={{ fontSize: '12px', padding: '6px 12px', fontWeight: '700', borderRadius: '20px' }}
          >
            {applicant.matchScore}% AI Match
          </span>

          <div className="profile-stats-list" style={{ marginTop: '24px' }}>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Email</span>
              <span className="profile-stat-value" style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{candidateDetails.email}</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Phone</span>
              <span className="profile-stat-value" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{candidateDetails.phone}</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Level</span>
              <span className="profile-stat-value" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{applicant.experienceLevel}</span>
            </div>
          </div>
        </div>

        {/* Right column info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bio Card */}
          <div className="card">
            <h3 className="form-card-title">About the Candidate</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {candidateDetails.bio}
            </p>
            <div className="candidate-tags" style={{ marginTop: '20px' }}>
              {applicant.skills.map((skill, sIdx) => (
                <span key={sIdx} className="candidate-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>{skill}</span>
              ))}
            </div>
          </div>

          {/* Work History Card */}
          <div className="card">
            <h3 className="form-card-title">Work Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {candidateDetails.workHistory.map((work, idx) => (
                <div key={idx} style={{ borderBottom: idx < candidateDetails.workHistory.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx < candidateDetails.workHistory.length - 1 ? '20px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{work.role}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>{work.period}</span>
                  </div>
                  <h5 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>{work.company}</h5>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{work.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Card */}
          <div className="card">
            <h3 className="form-card-title">Education</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px', color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{candidateDetails.education}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="toast">
          Applicant status updated to: {status}!
        </div>
      )}
    </div>
  );
}

export default ApplicantDetails;
