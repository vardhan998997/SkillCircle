import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Bot, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import API from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/api/users/dashboard');
      console.log(response)
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'My Courses',
      value: dashboardData?.stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      link: '/courses'
    },
    {
      title: 'Study Circles',
      value: dashboardData?.stats?.totalCircles || 0,
      icon: Users,
      color: 'text-green-600 bg-green-100',
      link: '/circles'
    },
    {
      title: 'AI Chats',
      value: dashboardData?.stats?.totalChats || 0,
      icon: Bot,
      color: 'text-purple-600 bg-purple-100',
      link: '/chatbot'
    },
    {
      title: 'Pending Requests',
      value: dashboardData?.stats?.pendingRequests || 0,
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100',
      link: '/dashboard'
    }
  ];

  const quickActions = [
    {
      title: 'Share a Course',
      description: 'Upload and share your course materials',
      icon: Plus,
      link: '/courses/create',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Create Study Circle',
      description: 'Start a new study group',
      icon: Users,
      link: '/circles/create',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Ask AI Assistant',
      description: 'Get help with your questions',
      icon: Bot,
      link: '/chatbot',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Send Message',
      description: 'Connect with other learners',
      icon: MessageSquare,
      link: '/messages',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your learning journey today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="card p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <action.icon size={32} className="mb-3" />
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Courses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
              <Link 
                to="/courses" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.recentCourses?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentCourses.map((course) => (
                  <div key={course._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <img
                      src={course.imageURL}
                      alt={course.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.platform}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      course.availability === 'available' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.availability}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No courses yet. Start by sharing your first course!</p>
                <Link 
                  to="/courses/create"
                  className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Share a Course
                </Link>
              </div>
            )}
          </div>

          {/* Recent Study Circles */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Study Circles</h2>
              <Link 
                to="/circles" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {dashboardData?.recentCircles?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentCircles.map((circle) => (
                  <div key={circle._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <Users className="text-white" size={20} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-900">{circle.name}</h3>
                      <p className="text-sm text-gray-600">{circle.topic}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {circle.members?.length || 0} members
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No study circles yet. Join or create one!</p>
                <Link 
                  to="/circles"
                  className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Browse Circles
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent AI Chats */}
        {dashboardData?.recentChats?.length > 0 && (
          <div className="mt-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent AI Conversations</h2>
                <Link 
                  to="/chatbot" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {dashboardData.recentChats.map((chat) => (
                  <div key={chat._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Bot className="text-purple-600" size={16} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 text-sm">{chat.question}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chat.answer}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
