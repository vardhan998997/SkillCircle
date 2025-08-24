import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  User, 
  ExternalLink, 
  Clock, 
  Tag, 
  ArrowLeft,
  MessageSquare,
  Calendar
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    reason: '',
    timeWindow: ''
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await API.get(`/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Fetch course error:', error);
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!requestData.reason.trim() || !requestData.timeWindow.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await API.post(`/api/courses/${id}/request`, requestData);
      toast.success('Access request sent successfully!');
      setShowRequestModal(false);
      setRequestData({ reason: '', timeWindow: '' });
    } catch (error) {
      console.error('Request access error:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading course details...</div>;
  }

  if (!course) {
    return <div className="text-center mt-20">Course not found</div>;
  }

  const isOwner = user?._id === course.owner?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Courses
        </button>

        <div className="card p-8">
          {/* Course Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {course.imageURL && (
              <img
                src={course.imageURL}
                alt={course.title}
                className="w-full lg:w-80 h-64 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.type === 'lend' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {course.type}
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {course.platform && (
                  <div className="flex items-center text-gray-700">
                    <ExternalLink size={20} className="mr-3 text-gray-400" />
                    <span className="font-medium">Platform:</span>
                    <span className="ml-2">{course.platform}</span>
                  </div>
                )}

                {course.category && (
                  <div className="flex items-center text-gray-700">
                    <Tag size={20} className="mr-3 text-gray-400" />
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 capitalize">{course.category}</span>
                  </div>
                )}

                {course.duration && (
                  <div className="flex items-center text-gray-700">
                    <Clock size={20} className="mr-3 text-gray-400" />
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{course.duration}</span>
                  </div>
                )}

                {course.difficulty && (
                  <div className="flex items-center text-gray-700">
                    <BookOpen size={20} className="mr-3 text-gray-400" />
                    <span className="font-medium">Level:</span>
                    <span className="ml-2 capitalize">{course.difficulty}</span>
                  </div>
                )}
              </div>

              {course.availability && (
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  course.availability === 'available' 
                    ? 'bg-green-100 text-green-700'
                    : course.availability === 'busy'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Status: {course.availability}
                </div>
              )}
            </div>
          </div>

          {/* Owner Info */}
          {course.owner && (
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Owner</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {course.owner?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{course.owner?.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{course.owner?.role}</p>
                    {course.owner?.bio && (
                      <p className="text-sm text-gray-600 mt-1">{course.owner.bio}</p>
                    )}
                  </div>
                </div>

                {isAuthenticated && !isOwner && (
                  <div className="flex space-x-3">
                    <Link
                      to={`/messages?user=${course.owner._id}`}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Message
                    </Link>
                    
                    {course.availability === 'available' && (
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <Calendar size={16} className="mr-2" />
                        Request Access
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Request Access Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Course Access
              </h3>
              
              <form onSubmit={handleRequestAccess}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you need this course?
                  </label>
                  <textarea
                    value={requestData.reason}
                    onChange={(e) => setRequestData({...requestData, reason: e.target.value})}
                    className="input-field h-24 resize-none"
                    placeholder="Explain your learning goals and how this course will help..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you need it?
                  </label>
                  <input
                    type="text"
                    value={requestData.timeWindow}
                    onChange={(e) => setRequestData({...requestData, timeWindow: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Next 2 weeks, This month, ASAP..."
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
