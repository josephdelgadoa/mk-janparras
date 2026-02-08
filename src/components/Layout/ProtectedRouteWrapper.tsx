import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ProtectedRouteWrapper() {
    const user = authService.getCurrentUser();
    const location = useLocation();

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
