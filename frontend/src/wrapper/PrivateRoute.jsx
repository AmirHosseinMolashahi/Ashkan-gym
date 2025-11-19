// PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>در حال بارگذاری...</div>; // یا Spinner دلخواه
  }

  if (!user) {
    return <Navigate to="/registration/login" replace />;
  }

  return children;
};

export default PrivateRoute;
