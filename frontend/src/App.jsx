import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Registrations from './pages/Registrations';
import RegistrationDetail from './pages/RegistrationDetail';

function App() {
  return (
    <Router>
      <div className="page-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/registrations/:id" element={<RegistrationDetail />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </Router>
  );
}

export default App;
