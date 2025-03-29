import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import './Login.css'; // We'll create this CSS file
import EyeIcon from './icons/EyeIcon';
import GenericConstants from '../../constants/GenericConstants';

const Login = () => {
  const [email, setEmail] = useState('eve.holt@reqres.in');
  const [password, setPassword] = useState('cityslicka');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateUser = () => {

    if (email !== GenericConstants.EMAIL) {
      setError("Incorrect username/ email")
      return false;
    }

    if (password !== GenericConstants.PASSWORD) {
      setError("Incorrect password")
      return false;
    }

    setError("");
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateUser() === false) {
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password);
      login(response.token);
      navigate('/users');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sign in</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-container">
            <EmailIcon className="input-icon" />
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <LockIcon className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <EyeIcon show={showPassword} toggleShow={togglePasswordVisibility} />
          </div>

          {/* {success && (
            <div className="snackbar">
              <div className="snackbar-content success">
                <span>User updated successfully!</span>
                <button
                  className="snackbar-close"
                  onClick={() => setSuccess(false)}
                >
                  ×
                </button>
              </div>
            </div>
          )} */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;