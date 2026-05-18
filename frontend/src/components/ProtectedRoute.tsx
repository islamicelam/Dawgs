import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isLoggedIn = !!localStorage.getItem('me');
  if (!isLoggedIn) return <Navigate to="/login" />;
  return <Outlet />;
};

export default ProtectedRoute;
