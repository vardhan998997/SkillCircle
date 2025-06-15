import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import StudyCircle from '../models/StudyCircle.js';
import CourseRequest from '../models/CourseRequest.js';
import ChatbotHistory from '../models/ChatbotHistory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skills, interests } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        bio,
        skills: skills || [],
        interests: interests || []
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get user's courses
    const userCourses = await Course.find({ owner: req.user._id })
      .populate('owner', 'name email');

    // Get user's study circles
    const userCircles = await StudyCircle.find({ 
      members: req.user._id 
    }).populate('creator', 'name email');

    // Get course requests stats
    const sentRequests = await CourseRequest.countDocuments({ 
      requester: req.user._id 
    });
    const receivedRequests = await CourseRequest.countDocuments({ 
      owner: req.user._id 
    });
    const pendingRequests = await CourseRequest.countDocuments({ 
      owner: req.user._id, 
      status: 'pending' 
    });

    // Get recent chatbot history
    const recentChats = await ChatbotHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get activity stats
    const totalCourses = userCourses.length;
    const totalCircles = userCircles.length;
    const totalChats = await ChatbotHistory.countDocuments({ user: req.user._id });

    res.json({
      user: req.user,
      stats: {
        totalCourses,
        totalCircles,
        totalChats,
        sentRequests,
        receivedRequests,
        pendingRequests
      },
      recentCourses: userCourses.slice(0, 5),
      recentCircles: userCircles.slice(0, 5),
      recentChats
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for messaging)
router.get('/', protect, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role skills interests')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedCircles', 'name topic skillLevel')
      .populate('coursesShared', 'title platform category');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;