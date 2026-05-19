import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setDeleteError('Failed to delete account. Please try again.');
        return;
      }
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Placeholder stats — wire to /api/progress later
  const stats = [
    { label: 'Lessons Completed', value: '0' },
    { label: 'Avg. Accuracy',     value: '—' },
    { label: 'Clefs Practiced',   value: '0' },
  ];

  return (
    <div className="profile-page">
      <NavBar />

      <main className="profile">
        <div className="profile__header">
          <h1 className="profile__title">Profile</h1>
          <p className="profile__sub">Manage your account and view your stats.</p>
        </div>

        {/* ── Account info ── */}
        <section className="profile__card" aria-label="Account information">
          <h2 className="profile__card-title">Account</h2>
          <div className="profile__divider" />

          <div className="profile__row">
            <span className="profile__row-label">Email</span>
            <span className="profile__row-value">{user.email || '—'}</span>
          </div>

          <div className="profile__row">
            <span className="profile__row-label">Member since</span>
            <span className="profile__row-value">{formatDate(user.createdAt)}</span>
          </div>

          <div className="profile__row">
            <span className="profile__row-label">Password</span>
            <span className="profile__row-value profile__row-value--muted">••••••••</span>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="profile__card" aria-label="Your stats">
          <h2 className="profile__card-title">Your Stats</h2>
          <div className="profile__divider" />

          <div className="profile__stats">
            {stats.map((s) => (
              <div key={s.label} className="profile__stat">
                <span className="profile__stat-value">{s.value}</span>
                <span className="profile__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section className="profile__card profile__card--danger" aria-label="Danger zone">
          <h2 className="profile__card-title profile__card-title--danger">Danger Zone</h2>
          <div className="profile__divider profile__divider--danger" />

          <p className="profile__danger-desc">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              className="btn btn--danger"
              onClick={() => setShowConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="profile__confirm">
              <p className="profile__confirm-text">
                Are you sure? This will permanently erase your account and progress.
              </p>
              <div className="profile__confirm-actions">
                <button
                  className="btn btn--danger"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
              {deleteError && <p className="profile__error">{deleteError}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}