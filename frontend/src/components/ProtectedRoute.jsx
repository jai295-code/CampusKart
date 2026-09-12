import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { Spinner } from './icons';

// Waits for the session restore to settle before deciding, then renders the
// page or sends an anonymous visitor to the login view (Requirement 3.2).
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Spinner className="h-4 w-4" />
        Loading…
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
