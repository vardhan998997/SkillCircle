import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaBell } from 'react-icons/fa'
import {
  getMyRequests as getSentRequests, // ✅ Corrected: aliased to getSentRequests
  getReceivedRequests,
  updateRequestStatus
} from '../../services/courseService'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const RequestsManager = () => {
  const [activeTab, setActiveTab] = useState('received')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data =
        activeTab === 'received'
          ? await getReceivedRequests()
          : await getSentRequests()
      setRequests(data)
    } catch (error) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, { status })
      toast.success(`Request ${status} successfully`)
      loadRequests()
    } catch (error) {
      toast.error('Failed to update request status')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Requests</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'received'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Received Requests
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'sent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Requests
        </button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} requests`}
          description={
            activeTab === 'sent'
              ? "You haven't sent any course requests yet."
              : "You don't have any incoming course requests."
          }
          icon={FaBell}
          actionLink="/courses"
          actionText="Browse Courses"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    <Link
                      to={`/courses/${request.course._id}`}
                      className="hover:text-primary-600"
                    >
                      {request.course.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-2">{request.reason}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      From: {new Date(request.requestedFrom).toLocaleDateString()}
                    </span>
                    <span>
                      To: {new Date(request.requestedTo).toLocaleDateString()}
                    </span>
                    <span
                      className={`badge ${
                        request.status === 'approved'
                          ? 'badge-primary'
                          : request.status === 'rejected'
                          ? 'badge-error'
                          : 'badge-warning'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                {activeTab === 'received' && request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'approved')}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'rejected')}
                      className="btn-outline text-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RequestsManager
