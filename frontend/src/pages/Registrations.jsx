import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getEvents,
} from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const EMPTY_FORM = { studentName: '', studentId: '', email: '', eventId: '' };

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const load = (evId = eventFilter) => {
    setLoading(true);
    Promise.all([getRegistrations(evId), getEvents()])
      .then(([rRes, eRes]) => {
        setRegistrations(rRes.data);
        setFiltered(rRes.data);
        setEvents(eRes.data);
      })
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  };

  // Apply eventId from URL query param on mount
  useEffect(() => {
    const evId = searchParams.get('eventId') || '';
    setEventFilter(evId);
    load(evId);
  }, []);

  // Re-filter locally on search text change
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      registrations.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      )
    );
  }, [search, registrations]);

  const handleEventFilter = (evId) => {
    setEventFilter(evId);
    setSearch('');
    load(evId);
  };

  const openCreate = () => { setForm({ ...EMPTY_FORM, eventId: eventFilter }); setSelected(null); setModal('create'); };
  const openEdit = (r) => {
    setForm({
      studentName: r.studentName,
      studentId: r.studentId,
      email: r.email,
      eventId: r.eventId?._id || '',
    });
    setSelected(r);
    setModal('edit');
  };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await createRegistration(form);
        toast.success('Registration created!');
      } else {
        await updateRegistration(selected._id, form);
        toast.success('Registration updated!');
      }
      closeModal();
      load();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteRegistration(selected._id);
      toast.success('Registration deleted.');
      closeModal();
      load();
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEventName = events.find((e) => e._id === eventFilter)?.title;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span>Registrations</span>
          </div>
          <h2>📝 Registration Management</h2>
          <p>
            {selectedEventName
              ? `Showing registrations for: ${selectedEventName}`
              : 'View and manage all student registrations.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Registration
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by name, student ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Event Filter Dropdown */}
        <select
          className="filter-select"
          value={eventFilter}
          onChange={(e) => handleEventFilter(e.target.value)}
        >
          <option value="">🔽 Filter by Event</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>

        {eventFilter && (
          <button className="btn btn-ghost btn-sm" onClick={() => handleEventFilter('')}>
            ✕ Clear Filter
          </button>
        )}

        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No registrations found</h3>
          <p>
            {search || eventFilter
              ? 'Try clearing your filters.'
              : 'Add your first registration to get started.'}
          </p>
          {!search && !eventFilter && (
            <button className="btn btn-primary" onClick={openCreate}>+ Add Registration</button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Event</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._id} className="fade-in-up">
                  <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td><strong style={{ color: 'var(--navy)' }}>{r.studentName}</strong></td>
                  <td><span className="badge badge-purple">{r.studentId}</span></td>
                  <td style={{ color: 'var(--muted)' }}>✉️ {r.email}</td>
                  <td>
                    {r.eventId ? (
                      <span className="badge badge-blue">📅 {r.eventId.title}</span>
                    ) : '—'}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {new Date(r.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/registrations/${r._id}`)}>
                        👁 View
                      </button>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(r)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(r)}>
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal
          title={modal === 'create' ? '📝 Add Registration' : '✏️ Edit Registration'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'create' ? 'Register' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student Name <span>*</span></label>
                <input className="form-control" placeholder="e.g. John Doe" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Student ID <span>*</span></label>
                <input className="form-control" placeholder="e.g. STU-2024-001" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email <span>*</span></label>
              <input className="form-control" type="email" placeholder="student@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Event <span>*</span></label>
              <select className="form-control" value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} required>
                <option value="">— Select Event —</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && (
        <Modal
          title="Confirm Delete"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : '🗑 Delete'}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className="confirm-icon">⚠️</div>
            <h4>Delete registration for "{selected?.studentName}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Registrations;
