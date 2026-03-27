import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import OwnerDashboard from './pages/owner/Dashboard.jsx';
import ClientBooking from './pages/client/Booking.jsx';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/book" element={<ClientBooking />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
