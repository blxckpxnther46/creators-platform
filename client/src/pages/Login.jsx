import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ INSIDE component

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
      const response = await api.post('/api/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      const data = response.data;

      if (data.success) {
        login(data.user, data.token); // ✅ USE CONTEXT
        navigate('/dashboard');
      } else {
        setError(data.message);
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Server error');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Login</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <br /><br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <br /><br />

        <button disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;