import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showToast } from '../services/toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ INSIDE component

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      const data = response.data;

      if (data.success) {
        login(data.user, data.token); // ✅ USE CONTEXT
        showToast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        showToast.error(data.message);
      }

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to login';
      showToast.apiError(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Login</h2>

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