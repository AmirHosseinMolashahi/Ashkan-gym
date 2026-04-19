import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasRole } from "../hooks/roleConverter";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useSelector(state => state.auth)

    if (loading) {
        return <div>در حال بارگذاری...</div>;
    }

    if (!user) {
        return <Navigate to="/registration/login" />;
    }

    if (allowedRoles && !hasRole(user.roles, allowedRoles)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;