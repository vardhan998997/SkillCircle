import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Footer from './Footer'
import Sidebar from './Sidebar'

const Layout = () => {
  const { user } = useAuth()
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex">
        {user && (
          <div className="hidden md:block w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        <main className={`flex-grow ${user ? 'md:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default Layout