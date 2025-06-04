import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const { data } = await api.get('/api/users/profile')
          setUser(data)
        }
      } catch (err) {
        console.error('Authentication error:', err)
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Register user
  const register = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/users/register', userData)
      if (data.token) {
        localStorage.setItem('token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data.user)
      }
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/users/login', credentials)
      if (data.token) {
        localStorage.setItem('token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data.user)
      }
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.put('/api/users/profile', userData)
      setUser(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}