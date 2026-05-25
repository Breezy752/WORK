import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  return (user || token) ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
