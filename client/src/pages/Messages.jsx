// Messages.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquare, Send, Search } from 'lucide-react';

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

    const userId = searchParams.get('user');
    const circleId = searchParams.get('circle');

    if (userId) startConversationWithUser(userId);
    else if (circleId) loadCircleMessages(circleId);
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
      const userData = users.find(u => u._id === userId) || { _id: userId, name: 'Unknown User', email: '' };

      setSelectedConversation({ type: 'direct', user: userData, messages: response.data });
      setMessages(response.data);
    } catch (error) {
      console.error('Start conversation error:', error);
    }
  };

  const loadCircleMessages = async (circleId) => {
    try {
      const response = await axios.get(`/api/messages/group/${circleId}`);
      setSelectedConversation({ type: 'group', circleId, messages: response.data });
      setMessages(response.data);
    } catch (error) {
      console.error('Load circle messages error:', error);
    }
  };

  const selectConversation = async (conversation) => {
    const userId = conversation?._id?._id;
    if (!userId) return;

    try {
      const response = await axios.get(`/api/messages/direct/${userId}`);
      setSelectedConversation({
        type: 'direct',
        user: conversation._id,
        messages: response.data,
      });
      setMessages(response.data);
      await axios.put(`/api/messages/read/${userId}`);
    } catch (error) {
      console.error('Select conversation error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedConversation) return;

    try {
      let response;
      if (selectedConversation.type === 'direct') {
        response = await axios.post('/api/messages/direct', {
          receiver: selectedConversation.user._id,
          content: trimmed,
        });
      } else {
        response = await axios.post('/api/messages/group', {
          studyCircle: selectedConversation.circleId,
          content: trimmed,
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
    setSelectedConversation({ type: 'direct', user: selectedUser, messages: [] });
    setMessages([]);
    setShowUserSearch(false);
    setUserSearch('');
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex h-screen">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button onClick={() => setShowUserSearch(!showUserSearch)}>
                <MessageSquare size={20} />
              </button>
            </div>

            {showUserSearch && (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 w-full border rounded-lg"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <button
                      key={u._id}
                      onClick={() => startNewConversation(u)}
                      className="w-full p-3 text-left flex items-center hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3 text-white">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-gray-600">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map(conv => {
                const userId = conv._id?._id;
                return (
                  <button
                    key={userId}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 border-b text-left hover:bg-gray-50 ${
                      selectedConversation?.user?._id === userId ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3 text-white">
                        {conv._id?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{conv._id?.name || 'User'}</p>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage?.content}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {conv.lastMessage?.createdAt &&
                          new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-2" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3 text-white">
                    {selectedConversation.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedConversation.user?.name}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div key={message._id} className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === user._id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-black'
                    }`}>
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 text-right text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
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
                <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                <p className="text-gray-600">Start chatting by selecting a user or group</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
