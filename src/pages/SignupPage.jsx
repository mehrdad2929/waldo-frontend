import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

export default function SignupPage({ onBack, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(username, email, password);
      setSuccess(true);
      setTimeout(async () => {
        await login(username, password);
        onBack();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="success-message">
            <h2>Account created!</h2>
            <p>Logging you in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="auth-card">
        <h1>Sign Up</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

SignupPage.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
};
