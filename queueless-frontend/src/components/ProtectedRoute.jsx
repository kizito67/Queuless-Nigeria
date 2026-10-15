import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page in this to restrict it.
// <ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>
function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
