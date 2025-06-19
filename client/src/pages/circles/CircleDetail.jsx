import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  User, 
  BookOpen, 
  Clock, 
  Target, 
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import API from '../../api';

const CircleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircle();
  }, [id]);

  const fetchCircle = async () => {
    try {
      const response = await API.get(`/api/circles/${id}`);
      setCircle(response.data);
    } catch (error) {
      console.error('Fetch circle error:', error);
      toast.error('Study circle not found');
      navigate('/circles');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async () => {
    try {
      await API.post(`/api/circles/${id}/join`);
      toast.success('Successfully joined the study circle!');
      fetchCircle(); // Refresh circle data
    } catch (error) {
      console.error('Join circle error:', error);
      toast.error(error.response?.data?.message || 'Failed to join circle');
    }
  };

  const handleLeaveCircle = async () => {
    if (!confirm('Are you sure you want to leave this study circle?')) {
      return;
    }

    try {
      await API.post(`/api/circles/${id}/leave`);
      toast.success('Left the study circle');
      fetchCircle(); // Refresh circle data
    } catch (error) {
      console.error('Leave circle error:', error);
      toast.error(error.response?.data?.message || 'Failed to leave circle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study circle...</p>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Study circle not found</h3>
          <Link to="/circles" className="text-primary-600 hover:text-primary-700">
            Back to study circles
          </Link>
        </div>
      </div>
    );
  }

  const isMember = circle.members?.some(member => member._id === user?._id);
  const isCreator = circle.creator?._id === user?._id;
  const isFull = circle.members?.length >= circle.maxMembers;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/circles')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Study Circles
        </button>

        <div className="card p-8">
          {/* Circle Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{circle.name}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  circle.skillLevel === 'beginner' 
                    ? 'bg-green-100 text-green-700'
                    : circle.skillLevel === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {circle.skillLevel}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center text-gray-700">
                  <BookOpen size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium">Topic:</span>
                  <span className="ml-2">{circle.topic}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Users size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium">Members:</span>
                  <span className="ml-2">
                    {circle.members?.length || 0}/{circle.maxMembers}
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium">Schedule:</span>
                  <span className="ml-2">{circle.availability}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <User size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium">Created by:</span>
                  <span className="ml-2">{circle.creator?.name}</span>
                </div>
              </div>

              {/* Goals */}
              <div className="mb-6">
                <div className="flex items-start text-gray-700">
                  <Target size={20} className="mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Learning Goals:</span>
                    <p className="mt-2 text-gray-600 leading-relaxed">{circle.goals}</p>
                  </div>
                </div>
              </div>

              {/* Resources */}
              {circle.resources && circle.resources.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Study Resources:</h3>
                  <div className="flex flex-wrap gap-2">
                    {circle.resources.map((resource, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="flex flex-wrap gap-3">
                  {isMember && (
                    <Link
                      to={`/messages?circle=${circle._id}`}
                      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Group Chat
                    </Link>
                  )}

                  {!isMember && !isFull && (
                    <button
                      onClick={handleJoinCircle}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <UserPlus size={16} className="mr-2" />
                      Join Circle
                    </button>
                  )}

                  {isMember && !isCreator && (
                    <button
                      onClick={handleLeaveCircle}
                      className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors duration-200"
                    >
                      <UserMinus size={16} className="mr-2" />
                      Leave Circle
                    </button>
                  )}

                  {isFull && !isMember && (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                      Circle is Full
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Circle Members ({circle.members?.length || 0})
            </h3>
            
            {circle.members && circle.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {circle.members.map((member) => (
                  <div key={member._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                        {member._id === circle.creator._id && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                    {isAuthenticated && member._id !== user?._id && (
                      <Link
                        to={`/messages?user=${member._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Message
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No members yet. Be the first to join!</p>
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="border-t pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Circle Creator</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {circle.creator?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{circle.creator?.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{circle.creator?.role}</p>
                  {circle.creator?.bio && (
                    <p className="text-sm text-gray-600 mt-1">{circle.creator.bio}</p>
                  )}
                </div>
              </div>

              {isAuthenticated && circle.creator?._id !== user?._id && (
                <Link
                  to={`/messages?user=${circle.creator._id}`}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Message Creator
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleDetail;