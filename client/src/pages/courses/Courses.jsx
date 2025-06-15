import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  ExternalLink,
  User,
  Clock,
  Tag
} from 'lucide-react';

const Courses = () => {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/courses?${params}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRequestAccess = async (courseId) => {
    if (!isAuthenticated) {
      toast.error('Please login to request access');
      return;
    }

    // This would typically open a modal for request details
    toast.success('Request feature will be implemented in course detail page');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Exchange</h1>
            <p className="mt-2 text-gray-600">
              Discover and share learning resources with the community
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/courses/create"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus size={20} className="mr-2" />
              Share Course
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="data-science">Data Science</option>
              <option value="other">Other</option>
            </select>

            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="lend">Lend</option>
              <option value="exchange">Exchange</option>
            </select>

            {/* Difficulty */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="input-field"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <img
                  src={course.imageURL}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.type === 'lend' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {course.type}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <ExternalLink size={16} className="mr-2" />
                    {course.platform}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User size={16} className="mr-2" />
                    {course.owner?.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag size={16} className="mr-2" />
                    {course.category}
                  </div>
                  {course.duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-2" />
                      {course.duration}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.availability === 'available' 
                      ? 'bg-green-100 text-green-700'
                      : course.availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {course.availability}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/courses/${course._id}`}
                      className="px-3 py-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {isAuthenticated && course.owner?._id !== user?._id && (
                      <button
                        onClick={() => handleRequestAccess(course._id)}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded"
                        disabled={course.availability !== 'available'}
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category || filters.type || filters.difficulty
                ? 'Try adjusting your filters to see more results.'
                : 'Be the first to share a course with the community!'}
            </p>
            {isAuthenticated && (
              <Link
                to="/courses/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus size={20} className="mr-2" />
                Share Your First Course
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;