import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ STORE TOKEN
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/dashboard');
      } else {
        setError(data.message);
      }

    } catch {
      setError('Server error');
    }

    setLoading(false);
  };

  // Styles (you can move these to a CSS file later)
  const containerStyle = {
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
  };

  const formContainerStyle = {
    maxWidth: '400px',
    width: '100%',
    padding: '2.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#333',
    fontSize: '2rem',
  };

  const subtitleStyle = {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#333',
    fontSize: '0.9rem',
  };

  const inputStyle = {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
  };

  const buttonStyle = {
    padding: '0.875rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '0.5rem',
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  };

  const errorMessageStyle = {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
  };

  const linkTextStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666',
  };

  const linkStyle = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>
          Login to your {/* Your Platform Name */} account
        </p>

        {/* API Error Message */}
        {error && (
          <div style={errorMessageStyle}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          
          {/* Email Field */}
          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={inputStyle}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={inputStyle}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={loading ? buttonDisabledStyle : buttonStyle}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <p style={linkTextStyle}>
          Don't have an account?{' '}
          <Link to="/register" style={linkStyle}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;