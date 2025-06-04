import express from 'express'
import {
  createCircle,
  getCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
  joinCircle,
  leaveCircle,
  getMyCircles,
  getCircleMessages,
  createCircleMessage,
  getRecommendedCircles,
} from '../controllers/circleController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/', getCircles)
router.get('/:id', getCircleById)

// Protected routes
router.route('/')
  .post(protect, createCircle)

router.get('/my', protect, getMyCircles)
router.get('/recommended', protect, getRecommendedCircles)

router.route('/:id')
  .put(protect, updateCircle)
  .delete(protect, deleteCircle)

router.post('/:id/join', protect, joinCircle)
router.post('/:id/leave', protect, leaveCircle)

// Circle messages
router.route('/:id/messages')
  .get(protect, getCircleMessages)
  .post(protect, createCircleMessage)

export default router