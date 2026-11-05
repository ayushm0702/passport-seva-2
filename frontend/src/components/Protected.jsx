import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === 'citizen' ? '/login' : '/staff-login'} replace />;
  return user.role === role ? children : <Navigate to="/" replace />;
}
