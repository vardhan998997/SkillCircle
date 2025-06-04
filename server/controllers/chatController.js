import asyncHandler from 'express-async-handler'
import Conversation from '../models/conversationModel.js'
import Message from '../models/messageModel.js'
import User from '../models/userModel.js'

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
  
  res.json(conversations)
})

// @desc    Get or create a conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body
  
  // Validate receiver exists
  const receiver = await User.findById(receiverId)
  if (!receiver) {
    res.status(404)
    throw new Error('User not found')
  }
  
  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
  
  // If not, create a new one
  if (!conversation) {
    conversation = new Conversation({
      participants: [req.user._id, receiverId],
    })
    
    await conversation.save()
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar')
  }
  
  res.status(200).json(conversation)
})

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'name email avatar')
  
  if (!conversation) {
    res.status(404)
    throw new Error('Conversation not found')
  }
  
  // Check if user is a participant
  if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
    res.status(403)
    throw new Error('Not authorized to view this conversation')
  }
  
  // Get all messages for this conversation
  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 })
  
  // Mark all unread messages as read
  await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: req.user._id },
      isRead: false,
    },
    { isRead: true }
  )
  
  res.json({
    conversation,
    messages,
  })
})

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body
  const conversation = await Conversation.findById(req.params.id)
  
  if (!conversation) {
    res.status(404)
    throw new Error('Conversation not found')
  }
  
  // Check if user is a participant
  if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
    res.status(403)
    throw new Error('Not authorized to send messages in this conversation')
  }
  
  // Create the message
  const message = new Message({
    sender: req.user._id,
    content,
    conversation: conversation._id,
  })
  
  const createdMessage = await message.save()
  
  // Update conversation's lastMessage
  conversation.lastMessage = createdMessage._id
  await conversation.save()
  
  const populatedMessage = await Message.findById(createdMessage._id).populate(
    'sender',
    'name email avatar'
  )
  
  res.status(201).json(populatedMessage)
})

export {
  getConversations,
  createConversation,
  getConversation,
  sendMessage,
}