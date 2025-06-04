import api from './api'

// Get all study circles with optional filters
export const getCircles = async (filters = {}) => {
  const { data } = await api.get('/api/circles', { params: filters })
  return data
}

// Get a single study circle by ID
export const getCircleById = async (id) => {
  const { data } = await api.get(`/api/circles/${id}`)
  return data
}

// Create a new study circle
export const createCircle = async (circleData) => {
  const { data } = await api.post('/api/circles', circleData)
  return data
}

// Update a study circle
export const updateCircle = async (id, circleData) => {
  const { data } = await api.put(`/api/circles/${id}`, circleData)
  return data
}

// Delete a study circle
export const deleteCircle = async (id) => {
  const { data } = await api.delete(`/api/circles/${id}`)
  return data
}

// Join a study circle
export const joinCircle = async (circleId) => {
  const { data } = await api.post(`/api/circles/${circleId}/join`)
  return data
}

// Leave a study circle
export const leaveCircle = async (circleId) => {
  const { data } = await api.post(`/api/circles/${circleId}/leave`)
  return data
}

// Get recommended study circles based on user profile
export const getRecommendedCircles = async () => {
  const { data } = await api.get('/api/circles/recommended')
  return data
}

// Get my study circles (circles I'm a member of)
export const getMyCircles = async () => {
  const { data } = await api.get('/api/circles/my')
  return data
}