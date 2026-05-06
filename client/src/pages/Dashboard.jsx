import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ⏳ Wait until auth is checked
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading...
      </div>
    );
  }

  // 🔒 Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Fetch posts when component mounts or page changes
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/posts?page=${page}&limit=10`);
      
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div style={containerStyle}>
      {/* Header with Create Button */}
      <div style={headerStyle}>
        <h1>Welcome, {user.name}!</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/create">
            <button style={createButtonStyle}>
              + Create New Post
            </button>
          </Link>
          <button onClick={logout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Posts List */}
      <div style={postsContainerStyle}>
        {isLoading ? (
          <div style={loadingStyle}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>You haven't created any posts yet.</p>
            <Link to="/create">Create your first post</Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post._id} style={postCardStyle}>
                <h3>{post.title}</h3>
                <p style={contentPreviewStyle}>
                  {post.content.substring(0, 150)}...
                </p>
                <div style={metaStyle}>
                  <span>{post.category}</span>
                  <span className={`status-${post.status}`} style={{ ...statusBadgeStyle, backgroundColor: post.status === 'published' ? '#28a745' : '#ffc107' }}>
                    {post.status}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div style={paginationStyle}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                style={{
                  ...paginationButtonStyle,
                  opacity: !pagination.hasPrevPage ? 0.5 : 1,
                  cursor: !pagination.hasPrevPage ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <span style={pageInfoStyle}>
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} total posts)
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                style={{
                  ...paginationButtonStyle,
                  opacity: !pagination.hasNextPage ? 0.5 : 1,
                  cursor: !pagination.hasNextPage ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const createButtonStyle = {
  padding: '0.5rem 1.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '0.95rem',
  textDecoration: 'none'
};

const logoutButtonStyle = {
  padding: '0.5rem 1.5rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
};

const postsContainerStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const loadingStyle = {
  textAlign: 'center',
  padding: '2rem',
  color: '#666'
};

const errorStyle = {
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '3rem',
  color: '#999'
};

const postCardStyle = {
  padding: '1.5rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '6px',
  marginBottom: '1rem',
  borderLeft: '4px solid #007bff'
};

const contentPreviewStyle = {
  color: '#666',
  margin: '1rem 0',
  lineHeight: '1.5'
};

const metaStyle = {
  display: 'flex',
  gap: '1rem',
  fontSize: '0.85rem',
  color: '#999'
};

const statusBadgeStyle = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 'bold'
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '2rem',
  paddingTop: '2rem',
  borderTop: '1px solid #eee'
};

const paginationButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const pageInfoStyle = {
  color: '#666',
  fontSize: '0.9rem'
};

export default Dashboard;