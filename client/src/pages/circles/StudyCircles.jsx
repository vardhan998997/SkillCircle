import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Plus,
  User,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';

const StudyCircles = () => {
  const { isAuthenticated, user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    topic: '',
    skillLevel: ''
  });

  useEffect(() => {
    fetchCircles();
  }, [filters]);

  const fetchCircles = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/circles?${params}`);
      setCircles(response.data);
    } catch (error) {
      console.error('Fetch circles error:', error);
      toast.error('Failed to load study circles');
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

  const handleJoinCircle = async (circleId) => {
    if (!isAuthenticated) {
      toast.error('Please login to join a study circle');
      return;
    }

    try {
      await axios.post(`/api/circles/${circleId}/join`);
      toast.success('Successfully joined the study circle!');
      fetchCircles(); // Refresh the list
    } catch (error) {
      console.error('Join circle error:', error);
      toast.error(error.response?.data?.message || 'Failed to join circle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study circles...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Study Circles</h1>
            <p className="mt-2 text-gray-600">
              Join collaborative learning groups and study together
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/circles/create"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus size={20} className="mr-2" />
              Create Circle
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search circles..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Topic */}
            <input
              type="text"
              placeholder="Filter by topic..."
              value={filters.topic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
              className="input-field"
            />

            {/* Skill Level */}
            <select
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
              className="input-field"
            >
              <option value="">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Circles Grid */}
        {circles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => {
              const isMember = circle.members?.some(member => member._id === user?._id);
              const isCreator = circle.creator?._id === user?._id;
              const isFull = circle.members?.length >= circle.maxMembers;

              return (
                <div key={circle._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {circle.name}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      circle.skillLevel === 'beginner' 
                        ? 'bg-green-100 text-green-700'
                        : circle.skillLevel === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {circle.skillLevel}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Topic:</span>
                      <span className="ml-1">{circle.topic}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Creator:</span>
                      <span className="ml-1">{circle.creator?.name}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Members:</span>
                      <span className="ml-1">
                        {circle.members?.length || 0}/{circle.maxMembers}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Schedule:</span>
                      <span className="ml-1">{circle.availability}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                      <Target size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Goals:</span>
                        <p className="mt-1 line-clamp-3">{circle.goals}</p>
                      </div>
                    </div>
                  </div>

                  {circle.resources && circle.resources.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Resources:</h4>
                      <div className="flex flex-wrap gap-1">
                        {circle.resources.slice(0, 3).map((resource, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {resource}
                          </span>
                        ))}
                        {circle.resources.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{circle.resources.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/circles/${circle._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    {isAuthenticated && !isMember && !isCreator && (
                      <button
                        onClick={() => handleJoinCircle(circle._id)}
                        disabled={isFull}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                          isFull
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {isFull ? 'Full' : 'Join Circle'}
                      </button>
                    )}
                    
                    {isMember && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                        {isCreator ? 'Creator' : 'Member'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No study circles found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.topic || filters.skillLevel
                ? 'Try adjusting your filters to see more results.'
                : 'Be the first to create a study circle!'}
            </p>
            {isAuthenticated && (
              <Link
                to="/circles/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Circle
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCircles;