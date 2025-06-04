import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/dashboard/Profile'
import CourseExplore from './pages/courses/CourseExplore'
import CourseDetail from './pages/courses/CourseDetail'
import CourseCreate from './pages/courses/CourseCreate'
import RequestsManager from './pages/requests/RequestsManager'
import StudyCircles from './pages/circles/StudyCircles'
import CircleDetail from './pages/circles/CircleDetail'
import CircleCreate from './pages/circles/CircleCreate'
import Chat from './pages/chat/Chat'
import NotFound from './pages/NotFound'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses">
            <Route index element={<CourseExplore />} />
            <Route path=":id" element={<CourseDetail />} />
            <Route path="create" element={<CourseCreate />} />
          </Route>
          <Route path="requests" element={<RequestsManager />} />
          <Route path="circles">
            <Route index element={<StudyCircles />} />
            <Route path=":id" element={<CircleDetail />} />
            <Route path="create" element={<CircleCreate />} />
          </Route>
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:id" element={<Chat />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App