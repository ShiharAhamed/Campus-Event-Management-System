import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getVenues, createEvent, updateEvent, deleteEvent } from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const EMPTY_FORM = { title: '', description: '', date: '', venueId: '', organizer: '' };

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([getEvents(), getVenues()])
      .then(([evRes, vRes]) => {
        setEvents(evRes.data);
        setFiltered(evRes.data);
        setVenues(vRes.data);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.organizer || '').toLowerCase().includes(q) ||
          (e.venueId?.name || '').toLowerCase().includes(q)
      )
    );
  }, [search, events]);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (ev) => {
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: ev.date ? ev.date.split('T')[0] : '',
      venueId: ev.venueId?._id || '',
      organizer: ev.organizer || '',
    });
    setSelected(ev);
    setModal('edit');
  };
  const openDelete = (ev) => { setSelected(ev); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await createEvent(form);
        toast.success('Event created successfully!');
      } else {
        await updateEvent(selected._id, form);
        toast.success('Event updated successfully!');
      }
      closeModal();
      load();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteEvent(selected._id);
      toast.success('Event deleted.');
      closeModal();
      load();
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const isUpcoming = (d) => new Date(d) >= new Date();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span>Events</span>
          </div>
          <h2>📅 Event Management</h2>
          <p>Create and manage campus events.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Event
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title, organizer or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No events found</h3>
          <p>{search ? 'Try a different search term.' : 'Get started by creating your first event.'}</p>
          {!search && (
            <button className="btn btn-primary" onClick={openCreate}>+ Create Event</button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Organizer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => (
                <tr key={ev._id} className="fade-in-up">
                  <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td><strong style={{ color: 'var(--navy)' }}>{ev.title}</strong></td>
                  <td>📅 {formatDate(ev.date)}</td>
                  <td>🏛️ {ev.venueId?.name || '—'}</td>
                  <td>{ev.organizer || '—'}</td>
                  <td>
                    <span className={`badge ${isUpcoming(ev.date) ? 'badge-green' : 'badge-orange'}`}>
                      {isUpcoming(ev.date) ? '🟢 Upcoming' : '🔴 Past'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/events/${ev._id}`)}>
                        👁 View
                      </button>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(ev)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(ev)}>
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
          title={modal === 'create' ? '📅 Create New Event' : '✏️ Edit Event'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'create' ? 'Create Event' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Event Title <span>*</span></label>
              <input className="form-control" placeholder="e.g. Annual Hackathon 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>{v.name} (Cap: {v.capacity})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Organizer</label>
              <input className="form-control" placeholder="e.g. Computer Science Dept." value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Brief event description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
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
            <h4>Delete "{selected?.title}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;
