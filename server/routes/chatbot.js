import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatbotHistory from '../models/ChatbotHistory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.log('⚠️ GEMINI_API_KEY not found in environment variables');
}

// Ask question to chatbot
router.post('/ask', protect, async (req, res) => {
  try {
    const { question, topic = 'general' } = req.body;

    if (!genAI) {
      return res.status(503).json({ 
        message: 'AI service not available. Please add GEMINI_API_KEY to environment variables.',
        answer: 'I apologize, but the AI service is currently unavailable. Please ensure the Gemini API key is properly configured.'
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a educational context prompt
    const prompt = `You are an educational assistant for SkillCircle, a learning platform. 
    Please provide a helpful, clear, and educational answer to the following question about ${topic}:
    
    Question: ${question}
    
    Please provide a comprehensive but concise answer that would help a student learn.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    // Save to chat history
    const chatHistory = await ChatbotHistory.create({
      user: req.user._id,
      question,
      answer,
      topic
    });

    res.json({
      question,
      answer,
      topic,
      timestamp: chatHistory.createdAt
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Provide fallback response
    const fallbackAnswer = `I'm having trouble processing your question right now. However, I'd suggest breaking down your question about "${req.body.question}" into smaller parts and trying to research each component. You might also want to ask this question in one of the study circles on our platform where other learners can help!`;
    
    // Still save to history with fallback
    try {
      await ChatbotHistory.create({
        user: req.user._id,
        question: req.body.question,
        answer: fallbackAnswer,
        topic: req.body.topic || 'general'
      });
    } catch (historyError) {
      console.error('History save error:', historyError);
    }

    res.json({
      question: req.body.question,
      answer: fallbackAnswer,
      topic: req.body.topic || 'general',
      timestamp: new Date()
    });
  }
});

// Get user's chat history
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, topic } = req.query;
    let query = { user: req.user._id };

    if (topic && topic !== 'all') {
      query.topic = topic;
    }

    const history = await ChatbotHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatbotHistory.countDocuments(query);

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat history item
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const historyItem = await ChatbotHistory.findById(req.params.id);

    if (!historyItem) {
      return res.status(404).json({ message: 'Chat history not found' });
    }

    if (historyItem.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await ChatbotHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat history deleted' });
  } catch (error) {
    console.error('Delete chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat topics
router.get('/topics', protect, async (req, res) => {
  try {
    const topics = await ChatbotHistory.distinct('topic', { user: req.user._id });
    res.json(topics);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;