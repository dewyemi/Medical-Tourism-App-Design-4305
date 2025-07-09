import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();

  // Check if user is authenticated via recovery flow
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!user) {
        // If no user, redirect to login
        navigate('/login', { replace: true });
      }
    };

    checkAuthStatus();
  }, [user, navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { success, error } = await updatePassword(password);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(error || 'Failed to update password');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Update Password</h1>
          <p className="text-gray-600 mt-2">
            Please enter your new password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            Password updated successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleUpdatePassword}>
          <div className="space-y-4">
            <div className="relative">
              <SafeIcon icon={FiIcons.FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="New password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="relative">
              <SafeIcon icon={FiIcons.FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 mt-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            disabled={loading || success}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-primary-600 font-medium hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;