import { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom'; // Add Outlet
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => { // Remove children prop
  const { user, isAdmin, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="p-20 text-center">Loading session...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Change this from 'children' to 'Outlet'
};

export default ProtectedRoute;