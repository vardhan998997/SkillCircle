import api from './api'

// Get all conversations for the current user
export const getConversations = async () => {
  const { data } = await api.get('/api/chat/conversations')
  return data
}

// Get a specific conversation with all messages
export const getConversation = async (conversationId) => {
  const { data } = await api.get(`/api/chat/conversations/${conversationId}`)
  return data
}

// Start a new conversation with another user
export const startConversation = async (receiverId) => {
  const { data } = await api.post('/api/chat/conversations', { receiverId })
  return data
}

// Send a message in a conversation
export const sendMessage = async (conversationId, content) => {
  const { data } = await api.post(`/api/chat/conversations/${conversationId}/messages`, { content })
  return data
}

// Get circle chat messages
export const getCircleMessages = async (circleId) => {
  const { data } = await api.get(`/api/circles/${circleId}/messages`)
  return data
}

// Send a message to a circle chat
export const sendCircleMessage = async (circleId, content) => {
  const { data } = await api.post(`/api/circles/${circleId}/messages`, { content })
  return data
}