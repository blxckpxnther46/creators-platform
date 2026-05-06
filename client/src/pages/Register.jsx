import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showToast } from '../services/toast';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};

    if (!formData.name.trim()) err.name = 'Name required';
    if (!formData.email.includes('@')) err.email = 'Invalid email';
    if (formData.password.length < 6) err.password = 'Min 6 chars';
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = 'Passwords must match';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await api.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const data = response.data;

      if (data.success) {
        showToast.success('Account created successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast.error(data.message);
      }
    } catch (error) {
      showToast.apiError(error);
    }

    setLoading(false);
  };

  return (
    <div style={container}>
      <form onSubmit={handleSubmit} style={form}>
        <h2>Create Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        {errors.name && <p>{errors.name}</p>}

        <input name="email" placeholder="Email" onChange={handleChange} />
        {errors.email && <p>{errors.email}</p>}

        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        {errors.password && <p>{errors.password}</p>}

        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}

        <button disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;

const container = { display: 'flex', justifyContent: 'center', padding: '2rem' };
const form = { width: '300px', display: 'flex', flexDirection: 'column', gap: '10px' };