import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaPaperPlane } from 'react-icons/fa'
import { getConversations, getConversation, sendMessage } from '../../services/chatService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'

const Chat = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (id) {
      loadConversation(id)
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load conversations')
      setLoading(false)
    }
  }

  const loadConversation = async (conversationId) => {
    try {
      const data = await getConversation(conversationId)
      setActiveConversation(data.conversation)
      setMessages(data.messages)
    } catch (error) {
      toast.error('Failed to load conversation')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const message = await sendMessage(activeConversation._id, newMessage)
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) return <Spinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="w-1/4 bg-white rounded-l-lg shadow-sm overflow-y-auto border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants.find(
                (p) => p._id !== user._id
              )
              return (
                <button
                  key={conversation._id}
                  onClick={() => loadConversation(conversation._id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    activeConversation?._id === conversation._id
                      ? 'bg-primary-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {otherUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {otherUser?.name}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-r-lg shadow-sm">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {activeConversation.participants
                      .find((p) => p._id !== user._id)
                      ?.name.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {
                        activeConversation.participants.find(
                          (p) => p._id !== user._id
                        )?.name
                      }
                    </h2>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === user._id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                        message.sender._id === user._id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender._id === user._id
                            ? 'text-primary-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="form-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary"
                  >
                    <FaPaperPlane className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat