import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Bot, 
  Send, 
  User, 
  Trash2, 
  MessageSquare,
  BookOpen,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/chatbot/history?limit=50');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) return;

    const question = newQuestion.trim();
    setNewQuestion('');
    setLoading(true);

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/chatbot/ask', {
        question,
        topic: selectedTopic
      });

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date(response.data.timestamp)
      };
      setMessages(prev => [...prev, aiMessage]);

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Ask question error:', error);
      toast.error('Failed to get response from AI assistant');
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I\'m having trouble processing your question right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const loadHistoryItem = (historyItem) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: historyItem.question,
      timestamp: new Date(historyItem.createdAt)
    };
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: historyItem.answer,
      timestamp: new Date(historyItem.createdAt)
    };

    setMessages([userMessage, aiMessage]);
  };

  const deleteHistoryItem = async (id) => {
    try {
      await axios.delete(`/api/chatbot/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      toast.success('History item deleted');
    } catch (error) {
      console.error('Delete history error:', error);
      toast.error('Failed to delete history item');
    }
  };

  const suggestedQuestions = [
    "How do I get started with React?",
    "What's the difference between let, const, and var in JavaScript?",
    "Explain the concept of closures in programming",
    "How do I improve my problem-solving skills?",
    "What are the best practices for learning a new programming language?"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex h-screen">
        {/* Sidebar - Chat History */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare size={20} className="mr-2" />
              Chat History
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              <div className="space-y-2 p-4">
                {history.map(item => (
                  <div
                    key={item._id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            item.topic === 'general' 
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-primary-100 text-primary-700'
                          }`}>
                            {item.topic}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 transition-opacity duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <p>No chat history yet</p>
                <p className="text-sm">Start asking questions!</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Learning Assistant</h3>
                  <p className="text-sm text-gray-600">Ask me anything about your studies!</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">General</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="data-science">Data Science</option>
                </select>
                
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg text-sm transition-colors duration-200"
                  >
                    Clear Chat
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to your AI Learning Assistant!
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    I'm here to help you with your studies. Ask me questions about programming, 
                    design, business, or any topic you're learning about.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Lightbulb size={16} className="mr-2" />
                    Try asking:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setNewQuestion(question)}
                        className="p-3 text-left bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <HelpCircle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-primary-600 ml-3' 
                          : 'bg-purple-600 mr-3'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="text-white" size={16} />
                        ) : (
                          <Bot className="text-white" size={16} />
                        )}
                      </div>
                      
                      <div className={`px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="spinner"></div>
                          <span className="text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={askQuestion} className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newQuestion.trim() || loading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Be specific with your questions for better answers!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;