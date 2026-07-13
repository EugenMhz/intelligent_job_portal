import React, { useState } from 'react';

function ChangePasswordAdmin({ onNavigate }) {
  React.useEffect(() => {
    document.title = 'Change Password';
  }, []);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      
      // Redirect back to profile after 1.5s
      setTimeout(() => {
        onNavigate('profile');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="page-container profile-container" style={{ maxWidth: '600px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '8px' }}
            onClick={() => onNavigate('profile')}
          >
            <span>&larr; Back to Profile</span>
          </div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your recruiter account credentials</p>
        </div>
      </div>

      <div className="card">
        <h3 className="form-card-title">Change Password Admin</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="oldPassword">Old Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              className="form-input"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-input"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              className="form-input"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="profile-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('profile')}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <div className="toast">
          Password updated successfully!
        </div>
      )}
    </div>
  );
}

export default ChangePasswordAdmin;
