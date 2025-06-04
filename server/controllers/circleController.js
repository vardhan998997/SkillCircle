import asyncHandler from 'express-async-handler'
import Circle from '../models/circleModel.js'
import Message from '../models/messageModel.js'

// @desc    Create a new study circle
// @route   POST /api/circles
// @access  Private
const createCircle = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    topic,
    skillLevel,
    maxMembers,
    isPrivate,
    goals,
    resources,
    meetingSchedule,
    endDate,
  } = req.body
  
  const circle = new Circle({
    name,
    description,
    topic,
    skillLevel: skillLevel || 'intermediate',
    creator: req.user._id,
    members: [req.user._id], // Add creator as first member
    maxMembers: maxMembers || 10,
    isPrivate: isPrivate || false,
    goals: goals || [],
    resources: resources || [],
    meetingSchedule: meetingSchedule || '',
    endDate: endDate || null,
  })
  
  const createdCircle = await circle.save()
  res.status(201).json(createdCircle)
})

// @desc    Get all study circles
// @route   GET /api/circles
// @access  Public
const getCircles = asyncHandler(async (req, res) => {
  const { topic, skillLevel, search } = req.query
  
  // Build filter object
  const filter = {}
  
  if (topic) filter.topic = topic
  if (skillLevel) filter.skillLevel = skillLevel
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
    ]
  }
  
  // Only show public circles
  filter.isPrivate = false
  
  const circles = await Circle.find(filter)
    .populate('creator', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 })
  
  res.json(circles)
})

// @desc    Get circle by ID
// @route   GET /api/circles/:id
// @access  Public/Private (depends on circle privacy)
const getCircleById = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('members', 'name email avatar')
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if circle is private and user is not a member
  if (
    circle.isPrivate &&
    (!req.user || !circle.members.some((member) => member._id.toString() === req.user._id.toString()))
  ) {
    res.status(403)
    throw new Error('This circle is private')
  }
  
  res.json(circle)
})

// @desc    Update a circle
// @route   PUT /api/circles/:id
// @access  Private (creator only)
const updateCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if user is creator
  if (circle.creator.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized to update this circle')
  }
  
  // Update fields
  circle.name = req.body.name || circle.name
  circle.description = req.body.description || circle.description
  circle.topic = req.body.topic || circle.topic
  circle.skillLevel = req.body.skillLevel || circle.skillLevel
  circle.maxMembers = req.body.maxMembers || circle.maxMembers
  circle.isPrivate = req.body.isPrivate !== undefined ? req.body.isPrivate : circle.isPrivate
  circle.goals = req.body.goals || circle.goals
  circle.resources = req.body.resources || circle.resources
  circle.meetingSchedule = req.body.meetingSchedule || circle.meetingSchedule
  circle.endDate = req.body.endDate || circle.endDate
  
  const updatedCircle = await circle.save()
  
  res.json(updatedCircle)
})

// @desc    Delete a circle
// @route   DELETE /api/circles/:id
// @access  Private (creator only)
const deleteCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if user is creator
  if (circle.creator.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized to delete this circle')
  }
  
  await circle.deleteOne()
  
  // Delete all messages associated with this circle
  await Message.deleteMany({ circle: circle._id })
  
  res.json({ message: 'Circle removed' })
})

// @desc    Join a circle
// @route   POST /api/circles/:id/join
// @access  Private
const joinCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if circle is full
  if (circle.members.length >= circle.maxMembers) {
    res.status(400)
    throw new Error('This circle is full')
  }
  
  // Check if user is already a member
  if (circle.members.includes(req.user._id)) {
    res.status(400)
    throw new Error('You are already a member of this circle')
  }
  
  // Add user to members
  circle.members.push(req.user._id)
  await circle.save()
  
  const updatedCircle = await Circle.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('members', 'name email avatar')
  
  res.json(updatedCircle)
})

// @desc    Leave a circle
// @route   POST /api/circles/:id/leave
// @access  Private
const leaveCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if user is a member
  if (!circle.members.includes(req.user._id)) {
    res.status(400)
    throw new Error('You are not a member of this circle')
  }
  
  // Check if user is the creator
  if (circle.creator.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('As the creator, you cannot leave the circle. You can delete it instead.')
  }
  
  // Remove user from members
  circle.members = circle.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  )
  
  await circle.save()
  
  res.json({ message: 'Left the circle successfully' })
})

// @desc    Get all circles for the logged in user
// @route   GET /api/circles/my
// @access  Private
const getMyCircles = asyncHandler(async (req, res) => {
  const circles = await Circle.find({ members: req.user._id })
    .populate('creator', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 })
  
  res.json(circles)
})

// @desc    Get circle messages
// @route   GET /api/circles/:id/messages
// @access  Private (members only)
const getCircleMessages = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if user is a member
  if (!circle.members.some((member) => member.toString() === req.user._id.toString())) {
    res.status(403)
    throw new Error('Not authorized to view these messages')
  }
  
  const messages = await Message.find({ circle: circle._id })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 })
  
  res.json(messages)
})

// @desc    Create a circle message
// @route   POST /api/circles/:id/messages
// @access  Private (members only)
const createCircleMessage = asyncHandler(async (req, res) => {
  const { content } = req.body
  const circle = await Circle.findById(req.params.id)
  
  if (!circle) {
    res.status(404)
    throw new Error('Circle not found')
  }
  
  // Check if user is a member
  if (!circle.members.some((member) => member.toString() === req.user._id.toString())) {
    res.status(403)
    throw new Error('Not authorized to send messages to this circle')
  }
  
  const message = new Message({
    sender: req.user._id,
    content,
    circle: circle._id,
  })
  
  const createdMessage = await message.save()
  
  const populatedMessage = await Message.findById(createdMessage._id).populate(
    'sender',
    'name email avatar'
  )
  
  res.status(201).json(populatedMessage)
})

// @desc    Get recommended circles based on user interests
// @route   GET /api/circles/recommended
// @access  Private
const getRecommendedCircles = asyncHandler(async (req, res) => {
  // Get user interests and skills
  const userInterests = req.user.interests || []
  const userSkills = req.user.skills || []
  
  // Combine interests and skills
  const userTopics = [...userInterests, ...userSkills]
  
  if (userTopics.length === 0) {
    // If user has no interests/skills, return newest circles
    const newestCircles = await Circle.find({ isPrivate: false })
      .populate('creator', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
    
    return res.json(newestCircles)
  }
  
  // Find circles that match user topics
  const circles = await Circle.find({
    isPrivate: false,
    $or: [
      { topic: { $in: userTopics } },
      { 'goals.0': { $in: userTopics } },
    ],
    members: { $ne: req.user._id }, // Exclude circles user is already in
  })
    .populate('creator', 'name email avatar')
    .limit(10)
  
  res.json(circles)
})

export {
  createCircle,
  getCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
  joinCircle,
  leaveCircle,
  getMyCircles,
  getCircleMessages,
  createCircleMessage,
  getRecommendedCircles,
}