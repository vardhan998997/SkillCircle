import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get direct messages between two users
router.get('/direct/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      messageType: 'direct',
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages for a study circle
router.get('/group/:circleId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      messageType: 'group',
      studyCircle: req.params.circleId
    })
    .populate('sender', 'name email')
    .populate('studyCircle', 'name topic')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send direct message
router.post('/direct', protect, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      messageType: 'direct'
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send direct message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send group message
router.post('/group', protect, async (req, res) => {
  try {
    const { studyCircle, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      studyCircle,
      content,
      messageType: 'group'
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('studyCircle', 'name topic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get direct message conversations
    const directMessages = await Message.aggregate([
      {
        $match: {
          messageType: 'direct',
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    // Populate user data
    const conversations = await Message.populate(directMessages, [
      { path: '_id', select: 'name email' },
      { path: 'lastMessage.sender', select: 'name email' },
      { path: 'lastMessage.receiver', select: 'name email' }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:conversationId', protect, async (req, res) => {
  try {
    await Message.updateMany(
      {
        messageType: 'direct',
        sender: req.params.conversationId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;