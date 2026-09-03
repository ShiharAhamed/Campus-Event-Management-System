import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../services/api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const EMPTY_FORM = { name: '', capacity: '', location: '' };

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getVenues()
      .then((res) => {
        setVenues(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load venues'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      venues.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      )
    );
  }, [search, venues]);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (v) => { setForm({ name: v.name, capacity: v.capacity, location: v.location }); setSelected(v); setModal('edit'); };
  const openDelete = (v) => { setSelected(v); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await createVenue(form);
        toast.success('Venue created successfully!');
      } else {
        await updateVenue(selected._id, form);
        toast.success('Venue updated successfully!');
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
      await deleteVenue(selected._id);
      toast.success('Venue deleted.');
      closeModal();
      load();
    } catch {
      toast.error('Failed to delete venue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>🏠 Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span>Venues</span>
          </div>
          <h2>🏛️ Venue Management</h2>
          <p>View, create, update and delete campus venues.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Venue
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {filtered.length} venue{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏛️</div>
          <h3>No venues found</h3>
          <p>
            {search ? 'Try a different search term.' : 'Get started by adding your first venue.'}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={openCreate}>
              + Add Venue
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Venue Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v._id} className="fade-in-up">
                  <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <strong style={{ color: 'var(--navy)' }}>{v.name}</strong>
                  </td>
                  <td>📍 {v.location}</td>
                  <td>
                    <span className="badge badge-blue">👥 {v.capacity}</span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/venues/${v._id}`)}
                      >
                        👁 View
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => openEdit(v)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDelete(v)}
                      >
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
          title={modal === 'create' ? '🏛️ Add New Venue' : '✏️ Edit Venue'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'create' ? 'Create Venue' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Venue Name <span>*</span></label>
              <input
                className="form-control"
                placeholder="e.g. Main Auditorium"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Capacity <span>*</span></label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location <span>*</span></label>
                <input
                  className="form-control"
                  placeholder="e.g. Building A, 1st Floor"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {modal === 'delete' && (
        <Modal
          title="Confirm Delete"
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : '🗑 Delete'}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className="confirm-icon">⚠️</div>
            <h4>Delete "{selected?.name}"?</h4>
            <p>This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Venues;
