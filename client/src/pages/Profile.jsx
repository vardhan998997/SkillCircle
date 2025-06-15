import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Bot,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/users/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await axios.put('/api/users/profile', profileData);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      interests: user?.interests || []
    });
    setEditing(false);
    setNewSkill('');
    setNewInterest('');
  };

  const activityStats = [
    {
      title: 'Courses Shared',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Study Circles',
      value: stats?.totalCircles || 0,
      icon: Users,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'AI Conversations',
      value: stats?.totalChats || 0,
      icon: Bot,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              {/* Basic Info */}
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mr-6">
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="input-field text-xl font-semibold"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  )}
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      {user?.email}
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                {editing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell others about yourself, your learning goals, and interests..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {user?.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                {editing && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      {editing && (
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {profileData.skills.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      {editing ? 'Add your skills above' : 'No skills added yet'}
                    </p>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Interests</h3>
                {editing && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Add an interest"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      <span>{interest}</span>
                      {editing && (
                        <button
                          onClick={() => removeInterest(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {profileData.interests.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      {editing ? 'Add your learning interests above' : 'No interests added yet'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
              <div className="space-y-4">
                {activityStats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mr-3`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/courses/create"
                  className="block w-full px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Share a Course
                </a>
                <a
                  href="/circles/create"
                  className="block w-full px-4 py-2 text-center bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Create Study Circle
                </a>
                <a
                  href="/chatbot"
                  className="block w-full px-4 py-2 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Ask AI Assistant
                </a>
              </div>
            </div>

            {/* Member Since */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Since</h3>
              <p className="text-gray-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Recently joined'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;