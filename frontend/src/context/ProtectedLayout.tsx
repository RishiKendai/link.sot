import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./UseAuth";
import PageLoader from '../components/PageLoader';

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <PageLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
