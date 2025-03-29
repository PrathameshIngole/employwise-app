import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { updateUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UsersContext';
import './EditUser.css';
import LoadingSpinner from './icons/LoadingSpinner';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token } = useAuth();
  const { handleUserUpdated } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (state?.userData) {
      setFormData({
        first_name: state.userData.first_name,
        last_name: state.userData.last_name,
        email: state.userData.email,
        avatar: state.userData.avatar
      });
    } else {
      navigate('/users');
    }
  }, [id, token, navigate, state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUser(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });

      const completeUser = {
        ...updatedUser,
        avatar: formData.avatar
      };

      handleUserUpdated(completeUser);
      
      setSuccess(true);
      setTimeout(() => navigate('/users'), 500);
    } catch (err) {
      setError(err.message || 'An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-user-container">
      <div className="edit-user-card">
        <div className="edit-user-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/users')}
            aria-label="Back to users"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="edit-user-title">Edit User</h1>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {formData.avatar && (
          <div className="user-avatar-container">
            <img 
              src={formData.avatar} 
              alt={`${formData.first_name} ${formData.last_name}`} 
              className="user-avatar"
            />
          </div>
        )}

        <form className="edit-user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter first name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter last name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="button button-secondary"
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button button-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Update User'}
            </button>
          </div>
        </form>
      </div>

      {success && (
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
      )}
    </div>
  );
};

export default EditUser;