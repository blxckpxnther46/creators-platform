import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // ⏳ Wait for auth check
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Checking authentication...
      </div>
    );
  }

  // 🔒 Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → show page
  return children;
};

export default ProtectedRoute;