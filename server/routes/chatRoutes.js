import express from 'express'
import {
  getConversations,
  createConversation,
  getConversation,
  sendMessage,
} from '../controllers/chatController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All chat routes are protected
router.use(protect)

router.route('/conversations')
  .get(getConversations)
  .post(createConversation)

router.route('/conversations/:id')
  .get(getConversation)

router.post('/conversations/:id/messages', sendMessage)

export default router