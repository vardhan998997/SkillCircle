import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API from '../api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios defaults on app load
  useEffect(() => {
    if (state.token) {
      console.log(state)
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUser = async () => {
    if (!state.token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const response = await API.get('/api/auth/profile');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data,
          token: state.token
        }
      });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data,
          token: response.data.token
        }
      });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.post('/api/auth/register', userData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data,
          token: response.data.token
        }
      });
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    loadUser
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

export default AuthContext;