import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        dispatch({ type: 'AUTH_START' });
        const response = await authAPI.getProfile();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data,
            token
          }
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Authentication failed'
        });
      }
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: null });
    }
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = () => {
      const token = localStorage.getItem('token');
      if (token && !state.user) {
        // If we have a token but no user, try to get the user profile
        checkAuth();
      }
    };

    handleGoogleCallback();
  }, [state.user]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login(email, password);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  const googleLogin = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Redirect to Google OAuth
      const googleAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
      window.location.href = googleAuthUrl;
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(userData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear(); // Clear all cached data
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.token && !!state.user,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
