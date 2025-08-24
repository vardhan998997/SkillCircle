import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Plus, ArrowLeft, X } from 'lucide-react';
import API from "../../api";  

const CreateCircle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    skillLevel: 'beginner',
    availability: '',
    goals: '',
    maxMembers: 10,
    resources: []
  });
  const [newResource, setNewResource] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addResource = () => {
    if (newResource.trim() && !formData.resources.includes(newResource.trim())) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, newResource.trim()]
      }));
      setNewResource('');
    }
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await API.post(
      '/api/circles',
      formData,
      {
        headers: {
          Authorization: `Bearer ${user?.token}` // ✅ add token
        }
      }
    );

    toast.success('Study circle created successfully!');
    navigate(`/circles/${response.data._id}`);
  } catch (error) {
    console.error('Create circle error:', error.response?.data || error.message);
    toast.error(error.response?.data?.message || 'Failed to create study circle');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/circles')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Study Circles
        </button>

        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Study Circle</h1>
            <p className="mt-2 text-gray-600">
              Start a collaborative learning group and invite others to join
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Circle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Circle Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., React Developers Study Group"
                required
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., React.js, Data Science, Web Design"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level *
                </label>
                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Max Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  className="input-field"
                  min="2"
                  max="50"
                  required
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Schedule *
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Weekends 2-4 PM EST, Flexible, Daily evenings"
                required
              />
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals *
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Describe what the group aims to achieve, what topics you'll cover, and what members should expect..."
                required
              />
            </div>

            {/* Resources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Resources
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Add a resource (book, course, website, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                />
                <button
                  type="button"
                  onClick={addResource}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {formData.resources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      <span>{resource}</span>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Optional: Add books, courses, websites, or other materials the group will use
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Creating Circle...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Users size={20} className="mr-2" />
                    Create Study Circle
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Study Circle Guidelines</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Be welcoming and inclusive to all skill levels</li>
              <li>• Set clear expectations for participation and commitment</li>
              <li>• Encourage active discussion and knowledge sharing</li>
              <li>• Respect everyone's time and learning pace</li>
              <li>• Share resources and help each other succeed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCircle;

