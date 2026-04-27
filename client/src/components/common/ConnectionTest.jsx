import { useState } from 'react';

const ConnectionTest = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const testConnection = async () => {
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      if (res.ok) setMessage(data.message);
      else setError(data.message);

    } catch {
      setError('Server not reachable');
    }
  };

  return (
    <div>
      <h3>Backend Test</h3>
      <button onClick={testConnection}>Test</button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ConnectionTest;