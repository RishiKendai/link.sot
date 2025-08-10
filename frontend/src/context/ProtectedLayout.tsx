import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './UseAuth';

const ProtectedLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (!isAuthenticated && !isLoading) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedLayout;
