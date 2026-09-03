import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Venues
export const getVenues = () => api.get('/venues');
export const getVenueById = (id) => api.get(`/venues/${id}`);
export const createVenue = (data) => api.post('/venues', data);
export const updateVenue = (id, data) => api.put(`/venues/${id}`, data);
export const deleteVenue = (id) => api.delete(`/venues/${id}`);

// Events
export const getEvents = () => api.get('/events');
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Registrations
export const getRegistrations = (eventId = '') =>
  api.get('/registrations', { params: eventId ? { eventId } : {} });
export const getRegistrationById = (id) => api.get(`/registrations/${id}`);
export const createRegistration = (data) => api.post('/registrations', data);
export const updateRegistration = (id, data) => api.put(`/registrations/${id}`, data);
export const deleteRegistration = (id) => api.delete(`/registrations/${id}`);

// Stats
export const getStats = () => api.get('/stats');

export default api;
