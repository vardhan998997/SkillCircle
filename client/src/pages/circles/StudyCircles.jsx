import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaUsers, FaPlus } from 'react-icons/fa'
import { getCircles } from '../../services/circleService'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const StudyCircles = () => {
  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    topic: '',
    skillLevel: '',
    search: '',
  })

  useEffect(() => {
    loadCircles()
  }, [filters])

  const loadCircles = async () => {
    try {
      const data = await getCircles(filters)
      setCircles(data)
    } catch (error) {
      console.error('Error loading circles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) return <Spinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Study Circles</h1>
        <Link to="/circles/create" className="btn-primary">
          <FaPlus className="inline-block mr-2" />
          Create Circle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search circles..."
            value={filters.search}
            onChange={handleFilterChange}
            className="form-input"
          />
          
          <select
            name="topic"
            value={filters.topic}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">All Topics</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="language">Language</option>
          </select>
          
          <select
            name="skillLevel"
            value={filters.skillLevel}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Circle List */}
      {circles.length === 0 ? (
        <EmptyState
          title="No study circles found"
          description="Create a new study circle and start learning together!"
          icon={FaUsers}
          actionLink="/circles/create"
          actionText="Create Circle"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <div key={circle._id} className="card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{circle.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{circle.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-primary">{circle.topic}</span>
                  <span className="badge-secondary">{circle.skillLevel}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <FaUsers className="text-gray-500" />
                  <span className="text-gray-600">
                    {circle.members.length} / {circle.maxMembers} members
                  </span>
                </div>
                
                <Link
                  to={`/circles/${circle._id}`}
                  className="btn-primary w-full"
                >
                  View Circle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudyCircles