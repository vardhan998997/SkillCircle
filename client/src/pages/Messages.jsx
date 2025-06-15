import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  User,
  Clock
} from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
    
    // Check if there's a user or circle parameter in URL
    const userId = searchParams.get('user');
    const circleId = searchParams.get('circle');
    
    if (userId) {
      // Start conversation with specific user
      startConversationWithUser(userId);
    } else if (circleId) {
      // Load circle messages
      loadCircleMessages(circleId);
    }
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const startConversationWithUser = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/direct/${userId}`);
      const userData = users.find(u => u._id === userId) || 
                      { _id: userId, name: 'Unknown User', email: '' };
      
      setSelectedConversation({
        type: 'direct',
        user: userData,
        messages: response.data
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Start conversation error:', error);
    }
  };

  const loadCircleMessages = async (circleId) => {
    try {
      const response = await axios.get(`/api/messages/group/${circleId}`);
      setSelectedConversation({
        type: 'group',
        circleId: circleId,
        messages: response.data
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Load circle messages error:', error);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      const response = await axios.get(`/api/messages/direct/${conversation._id._id}`);
      setSelectedConversation({
        type: 'direct',
        user: conversation._id,
        messages: response.data
      });
      setMessages(response.data);
      
      // Mark messages as read
      await axios.put(`/api/messages/read/${conversation._id._id}`);
    } catch (error) {
      console.error('Select conversation error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      let response;
      
      if (selectedConversation.type === 'direct') {
        response = await axios.post('/api/messages/direct', {
          receiver: selectedConversation.user._id,
          content: newMessage.trim()
        });
      } else {
        response = await axios.post('/api/messages/group', {
          studyCircle: selectedConversation.circleId,
          content: newMessage.trim()
        });
      }

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const startNewConversation = (selectedUser) => {
    setSelectedConversation({
      type: 'direct',
      user: selectedUser,
      messages: []
    });
    setMessages([]);
    setShowUserSearch(false);
    setUserSearch('');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <MessageSquare size={20} />
                </button>
              </div>

              {/* New Conversation Search */}
              {showUserSearch && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  {userSearch && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                      {filteredUsers.map(u => (
                        <button
                          key={u._id}
                          onClick={() => startNewConversation(u)}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center"
                        >
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-600">{u.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <button
                    key={conversation._id._id}
                    onClick={() => selectConversation(conversation)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?.user?._id === conversation._id._id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium">
                          {conversation._id.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {conversation._id.name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {selectedConversation.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {selectedConversation.user?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === user._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender._id === user._id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the sidebar or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;