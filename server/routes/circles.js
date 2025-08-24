import express from 'express';
import StudyCircle from '../models/StudyCircle.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all study circles
router.get('/', async (req, res) => {
  try {
    const { topic, skillLevel, search } = req.query;
    let query = { isActive: true };

    if (topic) query.topic = { $regex: topic, $options: 'i' };
    if (skillLevel) query.skillLevel = skillLevel;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const circles = await StudyCircle.find(query)
      .populate('creator', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(circles);
  } catch (error) {
    console.error('Get circles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single study circle
router.get('/:id', async (req, res) => {
  try {
    const circle = await StudyCircle.findById(req.params.id)
      .populate('creator', 'name email role bio')
      .populate('members', 'name email role skills');

    if (!circle) {
      return res.status(404).json({ message: 'Study circle not found' });
    }

    res.json(circle);
  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create study circle
router.post('/', protect, async (req, res) => {
  try {
    const { name, topic, skillLevel, availability, goals, resources, maxMembers } = req.body;

    const circle = await StudyCircle.create({
      name,
      topic,
      skillLevel,
      availability,
      goals,
      resources: resources || [],
      maxMembers: maxMembers || 10,
      creator: req.user._id,
      members: [req.user._id]
    });

    const populatedCircle = await StudyCircle.findById(circle._id)
      .populate('creator', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json(populatedCircle);
  } catch (error) {
    console.error('Create circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join study circle
router.post('/:id/join', protect, async (req, res) => {
  try {
    const circle = await StudyCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Study circle not found' });
    }

    if (circle.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this circle' });
    }

    if (circle.members.length >= circle.maxMembers) {
      return res.status(400).json({ message: 'Study circle is full' });
    }

    circle.members.push(req.user._id);
    await circle.save();

    const updatedCircle = await StudyCircle.findById(circle._id)
      .populate('creator', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedCircle);
  } catch (error) {
    // console.error('Join circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave study circle
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const circle = await StudyCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Study circle not found' });
    }

    if (!circle.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this circle' });
    }

    if (circle.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the circle' });
    }

    circle.members = circle.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    await circle.save();

    const updatedCircle = await StudyCircle.findById(circle._id)
      .populate('creator', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedCircle);
  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update study circle
router.put('/:id', protect, async (req, res) => {
  try {
    const circle = await StudyCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Study circle not found' });
    }

    if (circle.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCircle = await StudyCircle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('creator', 'name email role')
     .populate('members', 'name email role');

    res.json(updatedCircle);
  } catch (error) {
    console.error('Update circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete study circle
router.delete('/:id', protect, async (req, res) => {
  try {
    const circle = await StudyCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Study circle not found' });
    }

    if (circle.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await StudyCircle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study circle removed' });
  } catch (error) {
    console.error('Delete circle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;