import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUsers, FaCalendar, FaBook, FaComments } from 'react-icons/fa'
import { getCircleById, joinCircle, leaveCircle } from '../../services/circleService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

const CircleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [circle, setCircle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    loadCircle()
  }, [id])

  const loadCircle = async () => {
    try {
      const data = await getCircleById(id)
      setCircle(data)
    } catch (error) {
      toast.error('Failed to load circle details')
      navigate('/circles')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    try {
      await joinCircle(id)
      toast.success('Successfully joined the circle!')
      loadCircle()
    } catch (error) {
      toast.error('Failed to join circle')
    }
  }

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this circle?')) {
      try {
        await leaveCircle(id)
        toast.success('Successfully left the circle')
        loadCircle()
      } catch (error) {
        toast.error('Failed to leave circle')
      }
    }
  }

  if (loading) return <Spinner />

  if (!circle) return null

  const isMember = circle.members.some(member => member._id === user?._id)
  const isCreator = circle.creator._id === user?._id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{circle.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="badge-primary">{circle.topic}</span>
                <span className="badge-secondary">{circle.skillLevel}</span>
                {circle.isPrivate && (
                  <span className="badge-accent">Private</span>
                )}
              </div>
            </div>
            
            {user && !isCreator && (
              <button
                onClick={isMember ? handleLeave : handleJoin}
                className={isMember ? 'btn-outline text-red-600' : 'btn-primary'}
              >
                {isMember ? 'Leave Circle' : 'Join Circle'}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resources'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resources
              </button>
              {isMember && (
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'chat'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Chat
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'about' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">About this Circle</h2>
                <p className="text-gray-600 mb-6">{circle.description}</p>
                
                <h3 className="text-lg font-semibold mb-2">Goals</h3>
                <ul className="list-disc list-inside text-gray-600 mb-6">
                  {circle.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
                
                {circle.meetingSchedule && (
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <FaCalendar className="text-primary-600" />
                    <span>Meeting Schedule: {circle.meetingSchedule}</span>
                  </div>
                )}
                
                {circle.endDate && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaCalendar className="text-primary-600" />
                    <span>End Date: {new Date(circle.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {circle.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">
                          {member._id === circle.creator._id ? 'Creator' : 'Member'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
                {circle.resources.length === 0 ? (
                  <p className="text-gray-600">No resources have been added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {circle.resources.map((resource, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <FaBook className="text-primary-600 mt-1" />
                        <div>
                          <h3 className="font-medium">{resource.title}</h3>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            View Resource
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && isMember && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Circle Chat</h2>
                <p className="text-gray-600">Chat feature coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CircleDetail