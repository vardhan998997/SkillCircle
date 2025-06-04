import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCircle } from '../../services/circleService'

const CircleCreate = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    skillLevel: 'intermediate',
    maxMembers: 10,
    isPrivate: false,
    goals: '',
    resources: [],
    meetingSchedule: '',
    endDate: '',
  })

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const circleData = {
        ...formData,
        goals: formData.goals.split('\n').filter(goal => goal.trim()),
        resources: [], // Add resource management later
      }
      await createCircle(circleData)
      toast.success('Study circle created successfully!')
      navigate('/circles')
    } catch (error) {
      toast.error('Failed to create study circle')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Study Circle</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">Circle Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
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
            <label htmlFor="topic" className="form-label">Topic</label>
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Topic</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="language">Language</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="skillLevel" className="form-label">Skill Level</label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="maxMembers" className="form-label">Maximum Members</label>
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="2"
              max="50"
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="goals" className="form-label">Goals (one per line)</label>
            <textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows="4"
              className="form-input"
              placeholder="Learn React basics&#10;Build a portfolio project&#10;Master state management"
              required
            />
          </div>

          <div>
            <label htmlFor="meetingSchedule" className="form-label">Meeting Schedule (optional)</label>
            <input
              type="text"
              id="meetingSchedule"
              name="meetingSchedule"
              value={formData.meetingSchedule}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Every Monday at 7 PM EST"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="form-label">End Date (optional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
              Make this circle private
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate('/circles')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Circle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CircleCreate