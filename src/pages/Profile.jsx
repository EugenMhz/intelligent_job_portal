import React, { useState } from 'react';

function Profile({ user, onUpdateUser, onNavigate }) {
  React.useEffect(() => {
    document.title = user.role || 'Profile';
  }, [user.role]);
  const [formData, setFormData] = useState({
    name: user.name || 'Jane Doe',
    role: user.role || 'Senior Recruiter',
    email: user.email || 'jane.doe@intelligentportal.com',
    phone: user.phone || '+1 (555) 382-9012',
    department: user.department || 'Talent Acquisition',
    location: user.location || 'San Francisco, CA (Remote)',
    bio: user.bio || 'Passionate about connecting exceptional engineering and design talent with meaningful opportunities. 8+ years of technical recruiting experience.',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onUpdateUser(formData);
      setIsSaving(false);
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="page-container profile-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Profile</h1>
          <p className="page-subtitle">Manage your personal information and preferences</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile Sidebar Info Card */}
        <div className="card profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {formData.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <h2 className="profile-user-name">{formData.name}</h2>
          <p className="profile-user-role">{formData.role}</p>

          <div className="profile-stats-list">
            <div className="profile-stat-item">
              <span className="profile-stat-label">Active Jobs</span>
              <span className="profile-stat-value">5</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Total Applicants</span>
              <span className="profile-stat-value">69</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Response Rate</span>
              <span className="profile-stat-value">94%</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Card */}
        <div className="card">
          <h3 className="form-card-title">Profile Information</h3>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">Role / Job Title</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
            </div>

            <div className="profile-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('changepasswordadmin')}
              >
                Change Password
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <div className="toast">
          Profile updated successfully!
        </div>
      )}
    </div>
  );
}

export default Profile;
