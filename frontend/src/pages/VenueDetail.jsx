import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenueById, updateVenue, deleteVenue } from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getVenueById(id)
      .then((res) => { setVenue(res.data); setForm(res.data); })
      .catch(() => toast.error('Venue not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateVenue(id, form);
      toast.success('Venue updated!');
      setModal(null);
      load();
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteVenue(id);
      toast.success('Venue deleted.');
      navigate('/venues');
    } catch { toast.error('Delete failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner text="Loading venue details..." />;
  if (!venue) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span onClick={() => navigate('/venues')}>Venues</span>
            <span className="breadcrumb-sep">›</span>
            <span>{venue.name}</span>
          </div>
          <h2>🏛️ {venue.name}</h2>
          <p>Venue details and management</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning" onClick={() => setModal('edit')}>
            ✏️ Edit
          </button>
          <button className="btn btn-danger" onClick={() => setModal('delete')}>
            🗑 Delete
          </button>
        </div>
      </div>

      <div className="card fade-in-up">
        <div className="card-header">
          <h3>📋 Venue Information</h3>
          <span className="badge badge-blue">Active</span>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field-label">Venue Name</div>
              <div className="detail-field-value">🏛️ {venue.name}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Capacity</div>
              <div className="detail-field-value">👥 {venue.capacity} people</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Location</div>
              <div className="detail-field-value">📍 {venue.location}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Created</div>
              <div className="detail-field-value">
                {new Date(venue.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer detail-footer-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/venues')}>
            ← Back to Venues
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/events')}>
            📅 View Events in this Venue
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal
          title="✏️ Edit Venue"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Venue Name <span>*</span></label>
              <input className="form-control" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Capacity <span>*</span></label>
                <input className="form-control" type="number" min="1" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location <span>*</span></label>
                <input className="form-control" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <Modal
          title="Confirm Delete"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : '🗑 Delete Venue'}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className="confirm-icon">⚠️</div>
            <h4>Delete "{venue.name}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VenueDetail;
