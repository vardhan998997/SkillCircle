import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCourse } from '../../services/courseService'

const CourseCreate = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    imageUrl: '',
    type: 'lend',
    availableFrom: '',
    availableTo: '',
    category: '',
    topics: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const courseData = {
        ...formData,
        topics: formData.topics.split(',').map(topic => topic.trim()),
      }
      await createCourse(courseData)
      toast.success('Course created successfully!')
      navigate('/courses')
    } catch (error) {
      toast.error('Failed to create course')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Share a Course</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="platform" className="form-label">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Platform</option>
              <option value="udemy">Udemy</option>
              <option value="coursera">Coursera</option>
              <option value="pluralsight">Pluralsight</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="form-label">Course Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label htmlFor="type" className="form-label">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="lend">Lend</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="availableFrom" className="form-label">Available From</label>
              <input
                type="date"
                id="availableFrom"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="availableTo" className="form-label">Available To</label>
              <input
                type="date"
                id="availableTo"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="form-label">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Category</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="topics" className="form-label">Topics (comma-separated)</label>
            <input
              type="text"
              id="topics"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              className="form-input"
              placeholder="React, JavaScript, Web Development"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CourseCreate