import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaFilter } from 'react-icons/fa'
import { getCourses } from '../../services/courseService'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const CourseExplore = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    platform: '',
    type: '',
    category: '',
    search: '',
  })

  useEffect(() => {
    loadCourses()
  }, [filters])

  const loadCourses = async () => {
    try {
      const data = await getCourses(filters)
      setCourses(data)
    } catch (error) {
      console.error('Error loading courses:', error)
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
        <h1 className="text-3xl font-bold">Explore Courses</h1>
        <Link to="/courses/create" className="btn-primary">
          <FaPlus className="inline-block mr-2" />
          Add Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search courses..."
            value={filters.search}
            onChange={handleFilterChange}
            className="form-input"
          />
          
          <select
            name="platform"
            value={filters.platform}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">All Platforms</option>
            <option value="udemy">Udemy</option>
            <option value="coursera">Coursera</option>
            <option value="pluralsight">Pluralsight</option>
          </select>
          
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">All Types</option>
            <option value="lend">Lend</option>
            <option value="exchange">Exchange</option>
          </select>
          
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="form-input"
          >
            <option value="">All Categories</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Be the first to share a course with the community!"
          icon={FaPlus}
          actionLink="/courses/create"
          actionText="Share a Course"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="card">
              <img
                src={course.imageUrl || 'https://via.placeholder.com/300x200'}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="badge-primary">{course.platform}</span>
                  <span className="badge-secondary">{course.type}</span>
                </div>
                <Link
                  to={`/courses/${course._id}`}
                  className="btn-primary w-full mt-4"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseExplore