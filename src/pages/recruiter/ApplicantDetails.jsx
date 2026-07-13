import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Award, Mail, Phone, Calendar, Sparkles } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm font-semibold px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-slate-800 animate-slide-up">
          <CheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
          <span>Applicant status updated to: {status}!</span>
        </div>
      )}

      {/* Page Header / Navigation context */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <button 
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-semibold uppercase tracking-wider cursor-pointer border-none bg-none outline-none text-left w-fit"
          onClick={() => onNavigate('applicants')}
        >
          <ArrowLeft size={14} />
          Back to Applicant Review
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{applicant.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{applicant.role} at <strong className="text-slate-700 font-semibold">{applicant.company}</strong></p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-bold uppercase mr-1">Status:</span>
            <select 
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-700 font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer" 
              value={status} 
              onChange={handleStatusChange}
            >
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Sidebar Info */}
        <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center self-start">
          <div className="w-20 h-20 rounded-full bg-violet-50 border border-violet-100 text-violet-700 flex items-center justify-center font-bold text-3xl uppercase mb-4 ring-4 ring-violet-50/50">
            {applicant.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{applicant.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Experience: {applicant.experienceLevel}</p>
          
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/60 mt-4">
            <Sparkles size={12} />
            {applicant.matchScore}% AI Match
          </span>

          <div className="w-full border-t border-slate-100 pt-4 mt-6 space-y-4 text-left">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium flex items-center gap-1.5"><Mail size={14} /> Email</span>
              <span className="font-semibold text-slate-700 break-all text-right max-w-[170px]" style={{ fontSize: '13px' }}>{candidateDetails.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium flex items-center gap-1.5"><Phone size={14} /> Phone</span>
              <span className="font-semibold text-slate-700 text-right" style={{ fontSize: '13px' }}>{candidateDetails.phone}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium flex items-center gap-1.5"><Calendar size={14} /> Level</span>
              <span className="font-semibold text-slate-700 text-right" style={{ fontSize: '13px' }}>{applicant.experienceLevel}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs and Details Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-4">About the Candidate</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {candidateDetails.bio}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {applicant.skills.map((skill, sIdx) => (
                <span 
                  key={sIdx} 
                  className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-4">Work Experience</h3>
            <div className="divide-y divide-slate-100 space-y-6">
              {candidateDetails.workHistory.map((work, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-6' : ''}`}>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-base">{work.role}</h4>
                    <span className="text-xs font-bold text-violet-600 shrink-0">{work.period}</span>
                  </div>
                  <h5 className="text-xs sm:text-sm text-slate-400 font-semibold mb-2">{work.company}</h5>
                  <p className="text-slate-600 text-sm leading-relaxed">{work.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-4">Education</h3>
            <div className="flex items-start gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
              <Award className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-800 font-semibold leading-relaxed">{candidateDetails.education}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetails;
