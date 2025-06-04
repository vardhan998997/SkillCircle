import asyncHandler from 'express-async-handler'
import Request from '../models/requestModel.js'
import Course from '../models/courseModel.js'

// @desc    Create a new course access request
// @route   POST /api/courses/:id/requests
// @access  Private
const createRequest = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }
  
  // Check if course is available
  if (!course.isAvailable) {
    res.status(400)
    throw new Error('This course is currently not available')
  }
  
  // Prevent user from requesting their own course
  if (course.owner.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot request access to your own course')
  }
  
  // Check if user already has a pending request for this course
  const existingRequest = await Request.findOne({
    course: course._id,
    requester: req.user._id,
    status: 'pending',
  })
  
  if (existingRequest) {
    res.status(400)
    throw new Error('You already have a pending request for this course')
  }
  
  const { reason, requestedFrom, requestedTo } = req.body
  
  const request = new Request({
    course: course._id,
    requester: req.user._id,
    owner: course.owner,
    reason,
    requestedFrom,
    requestedTo,
  })
  
  const createdRequest = await request.save()
  
  // Populate the request with course and user details
  const populatedRequest = await Request.findById(createdRequest._id)
    .populate('course', 'title platform imageUrl')
    .populate('requester', 'name email avatar')
    .populate('owner', 'name email')
  
  res.status(201).json(populatedRequest)
})

// @desc    Get all requests for a specific course
// @route   GET /api/courses/:id/requests
// @access  Private
const getCourseRequests = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  
  if (!course) {
    res.status(404)
    throw new Error('Course not found')
  }
  
  // Check if user is the owner of the course
  if (course.owner.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized to view these requests')
  }
  
  const requests = await Request.find({ course: req.params.id })
    .populate('course', 'title platform imageUrl')
    .populate('requester', 'name email avatar')
    .sort({ createdAt: -1 })
  
  res.json(requests)
})

// @desc    Update request status (approve/reject)
// @route   PUT /api/requests/:id
// @access  Private
const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate('course')
    .populate('requester', 'name email avatar')
  
  if (!request) {
    res.status(404)
    throw new Error('Request not found')
  }
  
  // Check if user is the owner of the course
  if (request.owner.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized to update this request')
  }
  
  const { status, message } = req.body
  
  // Validate status
  if (!['approved', 'rejected', 'completed'].includes(status)) {
    res.status(400)
    throw new Error('Invalid status')
  }
  
  // If approving, check if course is still available
  if (status === 'approved' && !request.course.isAvailable) {
    res.status(400)
    throw new Error('This course is no longer available')
  }
  
  // Update request
  request.status = status
  request.message = message || request.message
  
  // If approving, update course availability
  if (status === 'approved') {
    const course = await Course.findById(request.course._id)
    course.isAvailable = false
    course.currentUser = request.requester._id
    await course.save()
    
    // Reject all other pending requests for this course
    await Request.updateMany(
      {
        course: request.course._id,
        _id: { $ne: request._id },
        status: 'pending',
      },
      {
        status: 'rejected',
        message: 'Course has been assigned to another user',
      }
    )
  }
  
  const updatedRequest = await request.save()
  
  res.json(updatedRequest)
})

// @desc    Get all requests created by the logged in user
// @route   GET /api/requests/sent
// @access  Private
const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ requester: req.user._id })
    .populate('course', 'title platform imageUrl')
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 })
  
  res.json(requests)
})

// @desc    Get all requests received by the logged in user
// @route   GET /api/requests/received
// @access  Private
const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ owner: req.user._id })
    .populate('course', 'title platform imageUrl')
    .populate('requester', 'name email avatar')
    .sort({ createdAt: -1 })
  
  res.json(requests)
})

export {
  createRequest,
  getCourseRequests,
  updateRequestStatus,
  getSentRequests,
  getReceivedRequests,
}