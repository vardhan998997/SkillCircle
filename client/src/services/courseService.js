import api from './api'

// Get all courses with optional filters
export const getCourses = async (filters = {}) => {
  const { data } = await api.get('/api/courses', { params: filters })
  return data
}

// Get a single course by ID
export const getCourseById = async (id) => {
  const { data } = await api.get(`/api/courses/${id}`)
  return data
}

// Create a new course
export const createCourse = async (courseData) => {
  const { data } = await api.post('/api/courses', courseData)
  return data
}

// Update a course
export const updateCourse = async (id, courseData) => {
  const { data } = await api.put(`/api/courses/${id}`, courseData)
  return data
}

// Delete a course
export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/api/courses/${id}`)
  return data
}

// Request access to a course
export const requestCourseAccess = async (courseId, requestData) => {
  const { data } = await api.post(`/api/courses/${courseId}/requests`, requestData)
  return data
}

// Get all requests for a specific course
export const getCourseRequests = async (courseId) => {
  const { data } = await api.get(`/api/courses/${courseId}/requests`)
  return data
}

// Get all my course requests (sent)
export const getMyRequests = async () => {
  const { data } = await api.get('/api/requests/sent')
  return data
}

// Get all requests for my courses (received)
export const getReceivedRequests = async () => {
  const { data } = await api.get('/api/requests/received')
  return data
}

// Approve or reject a course request
export const updateRequestStatus = async (requestId, status) => {
  const { data } = await api.put(`/api/requests/${requestId}`, { status })
  return data
}
