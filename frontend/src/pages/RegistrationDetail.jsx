import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRegistrationById, updateRegistration, deleteRegistration, getEvents } from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reg, setReg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getRegistrationById(id), getEvents()])
      .then(([rRes, eRes]) => {
        setReg(rRes.data);
        setEvents(eRes.data);
        const r = rRes.data;
        setForm({
          studentName: r.studentName,
          studentId: r.studentId,
          email: r.email,
          eventId: r.eventId?._id || '',
        });
      })
      .catch(() => toast.error('Registration not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRegistration(id, form);
      toast.success('Registration updated!');
      setModal(null);
      load();
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteRegistration(id);
      toast.success('Registration deleted.');
      navigate('/registrations');
    } catch { toast.error('Delete failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner text="Loading registration details..." />;
  if (!reg) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span onClick={() => navigate('/registrations')}>Registrations</span>
            <span className="breadcrumb-sep">›</span>
            <span>{reg.studentName}</span>
          </div>
          <h2>📝 {reg.studentName}</h2>
          <p>Registration details and management</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning" onClick={() => setModal('edit')}>✏️ Edit</button>
          <button className="btn btn-danger" onClick={() => setModal('delete')}>🗑 Delete</button>
        </div>
      </div>

      <div className="card fade-in-up">
        <div className="card-header">
          <h3>📋 Registration Information</h3>
          <span className="badge badge-green">✅ Registered</span>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field-label">Student Name</div>
              <div className="detail-field-value">🧑‍🎓 {reg.studentName}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Student ID</div>
              <div className="detail-field-value">🪪 {reg.studentId}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Email</div>
              <div className="detail-field-value">✉️ {reg.email}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Event</div>
              <div className="detail-field-value">📅 {reg.eventId?.title || '—'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Event Date</div>
              <div className="detail-field-value">
                🗓️ {reg.eventId?.date
                  ? new Date(reg.eventId.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Registered On</div>
              <div className="detail-field-value">
                📌 {new Date(reg.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer detail-footer-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/registrations')}>← Back</button>
          {reg.eventId && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/events/${reg.eventId._id}`)}>
              📅 View Event
            </button>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal
          title="✏️ Edit Registration"
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
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student Name <span>*</span></label>
                <input className="form-control" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Student ID <span>*</span></label>
                <input className="form-control" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email <span>*</span></label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Event <span>*</span></label>
              <select className="form-control" value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} required>
                <option value="">— Select Event —</option>
                {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select>
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
                {saving ? 'Deleting...' : '🗑 Delete'}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className="confirm-icon">⚠️</div>
            <h4>Delete registration for "{reg.studentName}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RegistrationDetail;
