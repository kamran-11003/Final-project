import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Google authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!token || !userParam) {
          toast.error('Invalid authentication response from Google.');
          navigate('/login');
          return;
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Store token and user data
        localStorage.setItem('token', token);
        
        // Update auth context
        // We need to manually set the auth state since we're not using the login function
        // This will be handled by the AuthContext's useEffect that checks for token on mount
        
        toast.success('Successfully signed in with Google!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Failed to process Google authentication.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing Google authentication...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
