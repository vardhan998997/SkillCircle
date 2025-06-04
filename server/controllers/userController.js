import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  
  // Check if user already exists
  const userExists = await User.findOne({ email })
  
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }
  
  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'learner',
  })
  
  if (user) {
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  
  // Find user by email
  const user = await User.findOne({ email })
  
  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        avatar: user.avatar,
      },
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  
  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.bio = req.body.bio || user.bio
    user.skills = req.body.skills || user.skills
    user.interests = req.body.interests || user.interests
    user.avatar = req.body.avatar || user.avatar
    
    if (req.body.password) {
      user.password = req.body.password
    }
    
    const updatedUser = await user.save()
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      avatar: updatedUser.avatar,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
}