import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, updateEvent, deleteEvent, getVenues } from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getEventById(id), getVenues()])
      .then(([evRes, vRes]) => {
        setEvent(evRes.data);
        setVenues(vRes.data);
        const ev = evRes.data;
        setForm({
          title: ev.title,
          description: ev.description || '',
          date: ev.date ? ev.date.split('T')[0] : '',
          venueId: ev.venueId?._id || '',
          organizer: ev.organizer || '',
        });
      })
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEvent(id, form);
      toast.success('Event updated!');
      setModal(null);
      load();
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteEvent(id);
      toast.success('Event deleted.');
      navigate('/events');
    } catch { toast.error('Delete failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner text="Loading event details..." />;
  if (!event) return null;

  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span onClick={() => navigate('/events')}>Events</span>
            <span className="breadcrumb-sep">›</span>
            <span>{event.title}</span>
          </div>
          <h2>📅 {event.title}</h2>
          <p>Event details and management</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning" onClick={() => setModal('edit')}>✏️ Edit</button>
          <button className="btn btn-danger" onClick={() => setModal('delete')}>🗑 Delete</button>
        </div>
      </div>

      <div className="card fade-in-up">
        <div className="card-header">
          <h3>📋 Event Information</h3>
          <span className={`badge ${isUpcoming ? 'badge-green' : 'badge-orange'}`}>
            {isUpcoming ? '🟢 Upcoming' : '🔴 Past'}
          </span>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field-label">Event Title</div>
              <div className="detail-field-value">📅 {event.title}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Date</div>
              <div className="detail-field-value">
                🗓️ {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Venue</div>
              <div className="detail-field-value">🏛️ {event.venueId?.name || '—'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Venue Location</div>
              <div className="detail-field-value">📍 {event.venueId?.location || '—'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Capacity</div>
              <div className="detail-field-value">👥 {event.venueId?.capacity || '—'} people</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Organizer</div>
              <div className="detail-field-value">🧑‍💼 {event.organizer || '—'}</div>
            </div>
          </div>
          {event.description && (
            <div className="detail-field" style={{ marginTop: '0.5rem' }}>
              <div className="detail-field-label">Description</div>
              <div style={{ marginTop: '0.4rem', color: 'var(--slate)', lineHeight: 1.6 }}>{event.description}</div>
            </div>
          )}
        </div>
        <div className="card-footer detail-footer-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/events')}>← Back to Events</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/registrations?eventId=${event._id}`)}>
            📝 View Registrations
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal
          title="✏️ Edit Event"
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
              <label className="form-label">Event Title <span>*</span></label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date <span>*</span></label>
                <input className="form-control" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Venue <span>*</span></label>
                <select className="form-control" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
                  <option value="">— Select Venue —</option>
                  {venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Organizer</label>
              <input className="form-control" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
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
                {saving ? 'Deleting...' : '🗑 Delete Event'}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className="confirm-icon">⚠️</div>
            <h4>Delete "{event.title}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventDetail;
