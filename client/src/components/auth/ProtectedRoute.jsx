import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <Spinner />
  }
  
  return user ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute