import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaHome, 
  FaBook, 
  FaUsers, 
  FaComments, 
  FaUserCircle, 
  FaBell,
  FaPlus
} from 'react-icons/fa'

const Sidebar = () => {
  const { user } = useAuth()
  
  return (
    <div className="bg-white border-r border-gray-200 h-full fixed w-64">
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
              {user?.name?.charAt(0).toUpperCase() || <FaUserCircle />}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaHome className="mr-3 h-4 w-4" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/courses" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaBook className="mr-3 h-4 w-4" />
            Courses
          </NavLink>
          
          <NavLink 
            to="/courses/create" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } pl-10`
            }
          >
            <FaPlus className="mr-3 h-3 w-3" />
            Add Course
          </NavLink>
          
          <NavLink 
            to="/circles" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaUsers className="mr-3 h-4 w-4" />
            Study Circles
          </NavLink>
          
          <NavLink 
            to="/circles/create" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } pl-10`
            }
          >
            <FaPlus className="mr-3 h-3 w-3" />
            Create Circle
          </NavLink>
          
          <NavLink 
            to="/requests" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaBell className="mr-3 h-4 w-4" />
            Requests
          </NavLink>
          
          <NavLink 
            to="/chat" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaComments className="mr-3 h-4 w-4" />
            Messages
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FaUserCircle className="mr-3 h-4 w-4" />
            Profile
          </NavLink>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar