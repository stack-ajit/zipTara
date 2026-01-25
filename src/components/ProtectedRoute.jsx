import { Navigate } from 'react-router-dom';
import { useTrips } from '../store/useStore';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useTrips(); // useTrips now also serves as useAuth for MVP

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
