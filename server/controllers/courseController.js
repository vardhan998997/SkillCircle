import asyncHandler from 'express-async-handler'
import Course from '../models/courseModel.js'

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    platform,
    imageUrl,
    type,
    availableFrom,
    availableTo,
    category,
    topics,
  } = req.body
  
  const course = new Course({
    title,
    description,
    platform,
    imageUrl,
    type,
    availableFrom,
    availableTo,
    owner: req.user._id,
    category: category || 'Other',
    topics: topics || [],
  })
  
  const createdCourse = await course.save()
  res.status(201).json(createdCourse)
})

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { platform, type, category, search } = req.query
  
  // Build filter object
  const filter = {}
  
  if (platform) filter.platform = platform
  if (type) filter.type = type
  if (category) filter.category = category
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }
  
  const courses = await Course.find(filter)
    .populate('owner', 'name email avatar')
    .populate('currentUser', 'name email')
    .sort({ createdAt: -1 })
  
  res.json(courses)
})

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('currentUser', 'name email')
  
  if (course) {
    res.json(course)
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  
  if (course) {
    // Check if user is owner
    if (course.owner.toString() !== req.user._id.toString()) {
      res.status(401)
      throw new Error('Not authorized to update this course')
    }
    
    course.title = req.body.title || course.title
    course.description = req.body.description || course.description
    course.platform = req.body.platform || course.platform
    course.imageUrl = req.body.imageUrl || course.imageUrl
    course.type = req.body.type || course.type
    course.availableFrom = req.body.availableFrom || course.availableFrom
    course.availableTo = req.body.availableTo || course.availableTo
    course.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : course.isAvailable
    course.category = req.body.category || course.category
    course.topics = req.body.topics || course.topics
    
    const updatedCourse = await course.save()
    res.json(updatedCourse)
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  
  if (course) {
    // Check if user is owner
    if (course.owner.toString() !== req.user._id.toString()) {
      res.status(401)
      throw new Error('Not authorized to delete this course')
    }
    
    await course.deleteOne()
    res.json({ message: 'Course removed' })
  } else {
    res.status(404)
    throw new Error('Course not found')
  }
})

// @desc    Get courses created by the logged in user
// @route   GET /api/courses/my
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ owner: req.user._id })
    .populate('owner', 'name email avatar')
    .populate('currentUser', 'name email')
    .sort({ createdAt: -1 })
  
  res.json(courses)
})

export {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
}