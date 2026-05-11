import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext"

const AdminRoute = () => {
  const { user, isAdmin, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // If not logged in OR role is not administrator, send them home
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;