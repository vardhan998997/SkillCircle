import express from 'express';
import Course from '../models/Course.js';
import CourseRequest from '../models/CourseRequest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all courses with filters
router.get('/', async (req, res) => {
  try {
    const { category, type, difficulty, search } = req.query;
    let query = { availability: 'available' };

    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('owner', 'name email role bio');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, platform, imageURL, type, category, duration, difficulty } = req.body;

    const course = await Course.create({
      title,
      description,
      platform,
      imageURL,
      type,
      category,
      duration,
      difficulty,
      owner: req.user._id
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('owner', 'name email role');

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'name email role');

    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request course access
router.post('/:id/request', protect, async (req, res) => {
  try {
    const { reason, timeWindow } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request your own course' });
    }

    // Check if request already exists
    const existingRequest = await CourseRequest.findOne({
      course: req.params.id,
      requester: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    const courseRequest = await CourseRequest.create({
      course: req.params.id,
      requester: req.user._id,
      owner: course.owner,
      reason,
      timeWindow
    });

    const populatedRequest = await CourseRequest.findById(courseRequest._id)
      .populate('course', 'title platform')
      .populate('requester', 'name email')
      .populate('owner', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Request course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my course requests (sent)
router.get('/requests/sent', protect, async (req, res) => {
  try {
    const requests = await CourseRequest.find({ requester: req.user._id })
      .populate('course', 'title platform imageURL')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course requests received
router.get('/requests/received', protect, async (req, res) => {
  try {
    const requests = await CourseRequest.find({ owner: req.user._id })
      .populate('course', 'title platform imageURL')
      .populate('requester', 'name email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.put('/requests/:id', protect, async (req, res) => {
  try {
    const { status, message } = req.body;
    const request = await CourseRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedRequest = await CourseRequest.findByIdAndUpdate(
      req.params.id,
      { status, message },
      { new: true }
    ).populate('course', 'title platform')
     .populate('requester', 'name email')
     .populate('owner', 'name email');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;