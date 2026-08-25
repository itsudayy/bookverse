import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { firebaseUser, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-navy-200 border-t-coral-500 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    // Keep the query string, not just the path — returning from Stripe carries
    // ?session_id=..., and dropping it would lose the order confirmation.
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  // Wait for the profile before judging role — otherwise the first render after
  // sign-in would bounce an admin out of their own dashboard.
  if (roles && !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-navy-200 border-t-coral-500 animate-spin" />
      </div>
    );
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
