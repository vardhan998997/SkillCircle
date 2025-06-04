import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaCalendar, FaExchangeAlt, FaUser } from 'react-icons/fa'
import { getCourseById, deleteCourse } from '../../services/courseService'
import { requestCourseAccess } from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    reason: '',
    requestedFrom: '',
    requestedTo: '',
  })

  useEffect(() => {
    loadCourse()
  }, [id])

  const loadCourse = async () => {
    try {
      const data = await getCourseById(id)
      setCourse(data)
    } catch (error) {
      toast.error('Failed to load course details')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id)
        toast.success('Course deleted successfully')
        navigate('/courses')
      } catch (error) {
        toast.error('Failed to delete course')
      }
    }
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    try {
      await requestCourseAccess(id, requestData)
      toast.success('Request sent successfully')
      setShowRequestModal(false)
    } catch (error) {
      toast.error('Failed to send request')
    }
  }

  if (loading) return <Spinner />

  if (!course) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64">
          <img
            src={course.imageUrl || 'https://via.placeholder.com/800x400'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">{course.title}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="badge-primary">{course.platform}</span>
              <span className="badge-secondary">{course.type}</span>
              <span className="badge-accent">{course.category}</span>
            </div>
            {user?._id === course.owner._id && (
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/courses/edit/${id}`)}
                  className="btn-outline"
                >
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-outline text-red-600">
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-600">{course.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FaUser className="text-primary-600" />
              <span>Owner: {course.owner.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FaCalendar className="text-primary-600" />
              <span>Available: {new Date(course.availableFrom).toLocaleDateString()} - {new Date(course.availableTo).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FaExchangeAlt className="text-primary-600" />
              <span>Type: {course.type}</span>
            </div>
          </div>

          {user && user._id !== course.owner._id && course.isAvailable && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn-primary w-full"
            >
              Request Access
            </button>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Request Access</h2>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="form-label">Reason for Request</label>
                <textarea
                  className="form-input"
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  required
                  rows="4"
                />
              </div>
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={requestData.requestedFrom}
                  onChange={(e) => setRequestData({ ...requestData, requestedFrom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={requestData.requestedTo}
                  onChange={(e) => setRequestData({ ...requestData, requestedTo: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetail