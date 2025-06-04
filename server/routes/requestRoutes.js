import express from 'express'
import {
  updateRequestStatus,
  getSentRequests,
  getReceivedRequests,
} from '../controllers/requestController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes
router.get('/sent', protect, getSentRequests)
router.get('/received', protect, getReceivedRequests)

router.route('/:id')
  .put(protect, updateRequestStatus)

export default router