import React from 'react'
import { FaHeart, FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  const year = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SkillCircle</h3>
            <p className="text-gray-600 text-sm">
              Share your knowledge, expand your skills, and connect with like-minded learners in our global community.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-600 hover:text-primary-600 text-sm">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/circles" className="text-gray-600 hover:text-primary-600 text-sm">
                  Study Circles
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center">
          <p className="text-gray-500 text-sm text-center">
            &copy; {year} SkillCircle. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2 flex items-center">
            Made with <FaHeart className="mx-1 text-red-500" /> for lifelong learners
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer