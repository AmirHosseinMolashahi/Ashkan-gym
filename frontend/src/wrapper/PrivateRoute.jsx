// PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) {
    return <div>در حال بارگذاری...</div>; // یا Spinner دلخواه
  }

  if (!user) {
    return <Navigate to="/registration/login" replace />;
  }

  return children;
};

export default PrivateRoute;
