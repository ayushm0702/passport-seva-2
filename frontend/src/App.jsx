import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Protected from './components/Protected.jsx';
import Home from './pages/Home.jsx';
import { About, Contact } from './pages/Info.jsx';
import { Register, Login, StaffLogin } from './pages/Auth.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ApplicationForm from './pages/ApplicationForm.jsx';
import DocumentUpload from './pages/DocumentUpload.jsx';
import Appointment from './pages/Appointment.jsx';
import Tracking from './pages/Tracking.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OfficerDashboard from './pages/OfficerDashboard.jsx';

const C = ({ children }) => <Protected role="citizen">{children}</Protected>;
export default function App() {
  return (<>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/dashboard" element={<C><UserDashboard /></C>} />
      <Route path="/apply" element={<C><ApplicationForm /></C>} />
      <Route path="/apply/:id/documents" element={<C><DocumentUpload /></C>} />
      <Route path="/appointment/:id" element={<C><Appointment /></C>} />
      <Route path="/track" element={<C><Tracking /></C>} />
      <Route path="/profile" element={<C><Profile /></C>} />
      <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/officer" element={<Protected role="officer"><OfficerDashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <footer>Academic demo project. Dummy data only. Not an official Government of India service.</footer>
  </>);
}
